/**
 * High-level content API
 * ----------------------------------------------------------------------
 * Orchestreert raw WP REST fetches met domain-mappers, en doet optionele
 * relation-resolves (gallery via attachments, brand-naam, author-naam).
 *
 * Pages roepen deze functies aan — ze zijn de publieke API van de
 * data-laag voor de UI.
 *
 * Conventie:
 *  - `get<Entity>` voor één item → returns `Entity | null`
 *  - `list<Entities>` voor lijsten → returns `{ items, total, totalPages }`
 *  - Lijst-helpers gebruiken altijd `*ListItem` (lichtgewicht).
 *  - Detail-helpers resolven relations standaard (overridable via `resolve` param).
 *
 * Sessie 4 (12-05-2026): `listMaterialsWithFacets` toegevoegd — het
 * orchestratie-punt voor de /materials-overzichtspagina. Combineert
 * FacetWP filtered + baseline + WP REST batch-fetch tot één UI-shape.
 */

import type { Article } from '@/types/article'
import type { Brand, BrandListItem } from '@/types/brand'
import type { Event } from '@/types/event'
import type { Material, MaterialListItem } from '@/types/material'
import type { Talk } from '@/types/talk'
import type { FacetSelection, MaterialSortValue } from '@/types/facetwp'

import {
  STORY_TYPES,
  storyTypeLabel,
  type StoryType,
} from '@/lib/config/story-types'

import {
  fetchMaterialFacetsBaseline,
  fetchMaterialsFiltered,
} from './facetwp'

import {
  mapArticle,
  mapArticleListItem,
  mapBrand,
  mapBrandListItem,
  mapEvent,
  mapEventListItem,
  mapFacetWPToFilterSections,
  mapMaterial,
  mapMaterialListItem,
  mapMedia,
  mapTalk,
  mapTalkListItem,
  splitGallery,
  type MaterialFilterSection,
} from './mappers'

import {
  type ListArticlesParams,
  type ListBrandsParams,
  type ListEventsParams,
  type ListMaterialsParams,
  type ListTalksParams,
  type WPMaterialRawResponse,
  type WPTermResponse,
  getArticleBySlug as fetchArticleBySlugRaw,
  getAttachmentsForPost,
  getBrandById as fetchBrandByIdRaw,
  getBrandBySlug as fetchBrandBySlugRaw,
  getEventBySlug as fetchEventBySlugRaw,
  getMaterialBySlug as fetchMaterialBySlugRaw,
  getMedia,
  getTalkBySlug as fetchTalkBySlugRaw,
  getTerms,
  listArticles as listArticlesRaw,
  listBrands as listBrandsRaw,
  listEvents as listEventsRaw,
  listMaterials as listMaterialsRaw,
  listTalks as listTalksRaw,
  wpFetch,
} from './wordpress'

// --------------------------------------------------------------------
// Material
// --------------------------------------------------------------------

export interface GetMaterialOptions {
  /**
   * Resolves van relations:
   *  - `gallery` (default true): haalt attachments op via `?parent=<id>` en bouwt Gallery
   *  - `brand` (default true): haalt brand op via `meta.brand_id`. Niet gebruikt in de
   *     huidige `Material` shape — brand-naam wordt op listings opgelost (Q.v.).
   *
   * Zet alles op false voor maximaal lichtgewicht ophalen (bv. SEO-only).
   */
  resolve?: {
    gallery?: boolean
  }
}

/**
 * Haal één material op met opgeloste gallery.
 *
 * Resolves draaien parallel waar mogelijk (Promise.all).
 */
export async function getMaterial(
  slug: string,
  options: GetMaterialOptions = {},
): Promise<Material | null> {
  const raw = await fetchMaterialBySlugRaw(slug)
  if (!raw) return null

  const resolveGallery = options.resolve?.gallery ?? true
  const brandId = typeof raw.meta?.brand_id === 'number' ? raw.meta.brand_id : null

  // Brand-naam ophalen — parallel met gallery zodat het geen extra latency
  // toevoegt. Faalbestendig: bij upstream-fout returnen we gewoon null en
  // de detail-page valt terug op generieke "Get in touch" zonder brand.
  const brandPromise: Promise<string | null> = brandId
    ? fetchBrandByIdRaw(brandId)
        .then((b) => (b ? b.title.rendered : null))
        .catch(() => null)
    : Promise.resolve(null)

  if (!resolveGallery) {
    const brandName = await brandPromise
    return mapMaterial(raw, { hero: null, thumbs: [], total: 0 }, brandName)
  }

  const [attachmentsRaw, brandName] = await Promise.all([
    getAttachmentsForPost(raw.id),
    brandPromise,
  ])
  const attachments = attachmentsRaw
    .filter((a) => a.media_type === 'image')
    .map(mapMedia)

  const gallery = splitGallery(attachments, raw.featured_media)
  return mapMaterial(raw, gallery, brandName)
}

// --------------------------------------------------------------------
// Material + keywords (detail-page orchestrator) — sessie 6 performance
// --------------------------------------------------------------------

/** Lichtgewicht keyword-shape voor de UI. */
export interface MaterialKeyword {
  name: string
  slug: string
}

/**
 * Material-category term — gebruikt voor de tags-rij boven de h1 op
 * de detail-page (sessie 7 Punt 13). Zelfde shape als MaterialKeyword
 * maar conceptueel anders: keywords zijn vrije tags (post_tag), terwijl
 * material_category een hiërarchische taxonomie is.
 */
export interface MaterialCategoryTerm {
  name: string
  slug: string
}

export interface MaterialDetailResult {
  material: Material
  /**
   * Tag-taxonomie-termen, in dezelfde volgorde als WordPress ze teruggeeft
   * (relevantie/alfabetisch — niet door ons gegarandeerd). Leeg array als
   * het material geen tags heeft, of als de term-fetch faalde (zie jsdoc
   * van `getMaterialDetail`).
   */
  keywords: MaterialKeyword[]
  /**
   * Material-category termen — opgelost van de taxonomy-IDs op het
   * material naar { name, slug }. Sessie 7 Punt 13: nodig voor de
   * tags-rij boven de h1. Lege array bij faal/ontbreken.
   */
  materialCategoryTerms: MaterialCategoryTerm[]
}

/**
 * Detail-orchestrator voor `/materials/[slug]`.
 *
 * Sessie 6 (performance): vervangt het sequentiële paar
 * `getMaterial(slug)` → `getTerms('tags', { include: tag_ids })` op de
 * detail-page. Door alle drie de resolves (gallery, brand-naam, keywords)
 * parallel te draaien ná de initiële material-fetch besparen we één
 * round-trip op de TTFB van de page. Met WP-latency 150–400 ms per call
 * is dat een duidelijk merkbare winst.
 *
 * Sequentie:
 *   1. fetchMaterialBySlugRaw                (latency: X)
 *   2. parallel: gallery + brand + keywords  (latency: max(Y, Z, W))
 *
 * Voorheen was stap 2 stap 2+3:
 *   2. parallel: gallery + brand             (latency: max(Y, Z))
 *   3. keywords                              (latency: W)
 *   → totaal: X + max(Y, Z) + W
 *
 * Nu: X + max(Y, Z, W) — verschilt 100–400 ms in praktijk.
 *
 * Faalbestendigheid:
 *  - Material niet gevonden → return `null` (page roept `notFound()` aan).
 *  - Keywords-fetch faalt → `keywords: []`. Geen reden om de hele page te
 *    laten falen voor een nice-to-have list.
 *  - Brand/gallery faal → al afgehandeld door `getMaterial` zelf.
 *
 * Pages die alléén het material nodig hebben (bv. `generateMetadata`)
 * blijven `getMaterial(slug)` aanroepen — die functie wijzigt niet.
 */
export async function getMaterialDetail(
  slug: string,
): Promise<MaterialDetailResult | null> {
  // Stap 1: raw material — moeten we hebben vóór we tag-IDs kennen.
  const raw = await fetchMaterialBySlugRaw(slug)
  if (!raw) return null

  // Tag-IDs extraheren — `taxonomies.tags` zit in de mapper, maar we hebben
  // het hier sneller direct uit de raw response. WordPress noemt het veld
  // `tags` op het material-CPT (de `post_tag`-taxonomie).
  const rawTagIds = Array.isArray(raw.tags) ? raw.tags : []
  const tagIds = rawTagIds.filter(
    (id): id is number => typeof id === 'number' && id > 0,
  )

  // Sessie 7 Punt 13: material_category-IDs extraheren voor de tags-rij
  // boven de h1. WP CPT-veld heet `material_category` op de material-post
  // (zie WPMaterialRawResponse in api/wordpress.ts).
  const rawCategoryIds = Array.isArray(raw.material_category)
    ? raw.material_category
    : []
  const categoryIds = rawCategoryIds.filter(
    (id): id is number => typeof id === 'number' && id > 0,
  )

  // Brand-ID + gallery zoals in `getMaterial`.
  const brandId = typeof raw.meta?.brand_id === 'number' ? raw.meta.brand_id : null

  const brandPromise: Promise<string | null> = brandId
    ? fetchBrandByIdRaw(brandId)
        .then((b) => (b ? b.title.rendered : null))
        .catch(() => null)
    : Promise.resolve(null)

  // Keywords parallel — wordPress noemt de taxonomie-endpoint `tags`.
  // Faalbestendig: bij upstream-fout een lege array zodat de page laadt.
  const keywordsPromise: Promise<MaterialKeyword[]> =
    tagIds.length > 0
      ? getTerms('tags', { include: tagIds, perPage: 50 })
          .then((terms: WPTermResponse[]) =>
            terms.map((t) => ({ name: t.name, slug: t.slug })),
          )
          .catch(() => [])
      : Promise.resolve([])

  // Sessie 7 Punt 13: material_category-terms parallel. Faalbestendig
  // op exact dezelfde manier als keywords.
  const categoryTermsPromise: Promise<MaterialCategoryTerm[]> =
    categoryIds.length > 0
      ? getTerms('material_category', {
          include: categoryIds,
          perPage: 50,
        })
          .then((terms: WPTermResponse[]) =>
            terms.map((t) => ({ name: t.name, slug: t.slug })),
          )
          .catch(() => [])
      : Promise.resolve([])

  // Stap 2: alles parallel.
  const [attachmentsRaw, brandName, keywords, materialCategoryTerms] =
    await Promise.all([
      getAttachmentsForPost(raw.id),
      brandPromise,
      keywordsPromise,
      categoryTermsPromise,
    ])

  const attachments = attachmentsRaw
    .filter((a) => a.media_type === 'image')
    .map(mapMedia)

  const gallery = splitGallery(attachments, raw.featured_media)
  const material = mapMaterial(raw, gallery, brandName)

  return { material, keywords, materialCategoryTerms }
}

export interface ListMaterialsResult {
  items: MaterialListItem[]
  total: number
  totalPages: number
}

/**
 * Lijst materials voor overzichtspagina's (homepage carousels, "recente
 * materials", "materialen van brand X").
 *
 * Voor de hoofdoverzichtspagina /materials met FacetWP-filtering: gebruik
 * `listMaterialsWithFacets` hieronder.
 *
 * Resolves:
 *  - hero: featured_media → MediaImage. Default ON.
 *  - brandName: brand_id → brand-titel via batch-fetch. Default ON.
 *
 * Performance-tip: zet `resolveBrandName=false` op carousels die alleen
 * material-titel + image tonen. Bespaart een fetch per uniek brand.
 */
export async function listMaterials(
  params: ListMaterialsParams & {
    resolveHero?: boolean
    resolveBrandName?: boolean
  } = {},
): Promise<ListMaterialsResult> {
  const {
    resolveHero = true,
    resolveBrandName = true,
    ...rawParams
  } = params

  const { items: rawItems, total, totalPages } = await listMaterialsRaw(rawParams)

  // Verzamel unieke media-IDs en brand-IDs voor batch-resolves
  const heroIds = resolveHero
    ? unique(rawItems.map((r) => r.featured_media).filter((id) => id > 0))
    : []
  const brandIds = resolveBrandName
    ? unique(
        rawItems
          .map((r) => r.meta?.brand_id)
          .filter((id): id is number => typeof id === 'number' && id > 0),
      )
    : []

  // Parallel batch-fetches
  const [mediaMap, brandNameMap] = await Promise.all([
    fetchMediaMap(heroIds),
    fetchBrandNameMap(brandIds),
  ])

  const items: MaterialListItem[] = rawItems.map((raw) =>
    mapMaterialListItem(
      raw,
      raw.featured_media > 0 ? mediaMap.get(raw.featured_media) ?? null : null,
      typeof raw.meta?.brand_id === 'number' && raw.meta.brand_id > 0
        ? brandNameMap.get(raw.meta.brand_id) ?? null
        : null,
    ),
  )

  return { items, total, totalPages }
}

// --------------------------------------------------------------------
// Material — FacetWP-overzichtspagina orchestrator
// --------------------------------------------------------------------

export interface ListMaterialsWithFacetsParams {
  /** Geselecteerde facet-waarden (mag leeg zijn). */
  selection?: FacetSelection
  /** 1-indexed paginanummer. */
  page?: number
  /** Aantal per pagina. Default 12. */
  perPage?: number
  /** Sortering. */
  sort?: MaterialSortValue
  /** Vrije zoekterm. */
  search?: string
}

export interface ListMaterialsWithFacetsResult {
  /** Resolved material list items (hero + brand naam) — in FacetWP-sort-volgorde. */
  items: MaterialListItem[]
  /** Pager-state uit FacetWP. */
  pager: {
    page: number
    perPage: number
    totalRows: number
    totalPages: number
  }
  /** Filter-secties voor de FilterSidebar — gemerged baseline + filtered. */
  filterSections: MaterialFilterSection[]
}

/**
 * Orchestrator voor `/materials` — combineert drie data-bronnen:
 *
 *  1. FacetWP filtered call → `results`-IDs + pager + actuele facet-state
 *  2. FacetWP baseline call → volledige facet-set (label + choices + counts
 *     voor de ongefilterde wereld). Nodig om de FilterSidebar altijd alle
 *     facets te kunnen tonen, ook die zonder huidige selectie.
 *  3. `/wp/v2/material?include=<ids>` → raw material-data voor de grid.
 *
 * Calls 1 en 2 draaien parallel; call 3 wacht op 1 (heeft de IDs nodig).
 *
 * Mapper-laag merged baseline (alle facets + labels + alle choices) met
 * filtered (counts + selected) — zie `mapFacetWPToFilterSections`.
 *
 * Failure-modes:
 *  - FacetWP-call faalt → exception bubbelt op naar de page → `error.tsx`
 *  - WP-include-call faalt → idem
 *  - Geen results → returnt items: [] (geen exception); page rendert dan
 *    `EmptyState reason="filtered-out"` of `"no-results"`
 */
export async function listMaterialsWithFacets(
  params: ListMaterialsWithFacetsParams = {},
): Promise<ListMaterialsWithFacetsResult> {
  // 1 + 2: parallel — filtered query én ongefilterde baseline
  const [filteredResponse, baselineResponse] = await Promise.all([
    fetchMaterialsFiltered({
      facets: params.selection,
      page: params.page,
      perPage: params.perPage,
      sort: params.sort,
      search: params.search,
    }),
    fetchMaterialFacetsBaseline(),
  ])

  // 3: WP REST batch-fetch — alleen als er results zijn
  const ids = filteredResponse.results
  const rawItemsUnordered =
    ids.length > 0 ? await fetchMaterialsByIds(ids) : []

  // FacetWP geeft IDs in sort-volgorde; WP REST `include=` respecteert
  // die volgorde niet noodzakelijk. Daarom re-orderen op basis van `ids`.
  const orderedRawItems = reorderByIds(rawItemsUnordered, ids)

  // Batch-resolve hero + brand-naam (zelfde patroon als listMaterials)
  const heroIds = unique(
    orderedRawItems.map((r) => r.featured_media).filter((id) => id > 0),
  )
  const brandIds = unique(
    orderedRawItems
      .map((r) => r.meta?.brand_id)
      .filter((id): id is number => typeof id === 'number' && id > 0),
  )

  const [mediaMap, brandNameMap] = await Promise.all([
    fetchMediaMap(heroIds),
    fetchBrandNameMap(brandIds),
  ])

  const items: MaterialListItem[] = orderedRawItems.map((raw) =>
    mapMaterialListItem(
      raw,
      raw.featured_media > 0 ? mediaMap.get(raw.featured_media) ?? null : null,
      typeof raw.meta?.brand_id === 'number' && raw.meta.brand_id > 0
        ? brandNameMap.get(raw.meta.brand_id) ?? null
        : null,
    ),
  )

  // FilterSections: baseline = volledige set, filtered = counts + selected
  const filterSections = mapFacetWPToFilterSections(
    baselineResponse,
    filteredResponse,
  )

  return {
    items,
    pager: {
      page: filteredResponse.pager.page,
      perPage: filteredResponse.pager.per_page,
      totalRows: filteredResponse.pager.total_rows,
      totalPages: filteredResponse.pager.total_pages,
    },
    filterSections,
  }
}

/**
 * Helper: haal meerdere materials in één call via `?include=`.
 *
 * WP REST `per_page` heeft een maximum van 100 — als FacetWP ooit meer
 * dan 100 IDs per pagina retourneert, splitsen we hier in chunks. Voor
 * sessie 4 is `perPage` max 12 dus geen issue.
 */
async function fetchMaterialsByIds(
  ids: number[],
): Promise<WPMaterialRawResponse[]> {
  if (ids.length === 0) return []

  return wpFetch<WPMaterialRawResponse[]>('/wp/v2/material', {
    params: {
      include: ids,
      per_page: ids.length,
      orderby: 'include',
    },
  })
}

/**
 * Sorteer een array van materials op de volgorde van de gegeven ID-lijst.
 *
 * Nodig omdat FacetWP de sort-volgorde bepaalt (newest first, etc.), maar
 * `/wp/v2/material?include=` die volgorde niet noodzakelijk respecteert
 * zonder expliciete `orderby=include`. Veiligheidsnet voor het geval
 * `orderby=include` niet werkt zoals verwacht.
 */
function reorderByIds<T extends { id: number }>(
  items: T[],
  ids: number[],
): T[] {
  const map = new Map<number, T>()
  for (const item of items) map.set(item.id, item)
  const ordered: T[] = []
  for (const id of ids) {
    const item = map.get(id)
    if (item) ordered.push(item)
  }
  return ordered
}

// --------------------------------------------------------------------
// Material — relatie-query op brand (Johan-handoff 27-05-2026)
// --------------------------------------------------------------------

export interface ListMaterialsByBrandParams {
  /** Aantal materials om op te halen. Default 12. */
  perPage?: number
  /** Material-ID om uit te sluiten (bv. het huidige material bij MoreFromBrand). */
  exclude?: number
  /** Hero-image resolven. Default true. */
  resolveHero?: boolean
  /** Brand-naam resolven. Default false — caller kent de brand-naam meestal al. */
  resolveBrandName?: boolean
}

/**
 * Lijst materials van één brand via de genormaliseerde REST-relatie-query
 * `?brand_id=<id>` (Johan-handoff 27-05-2026, production verified).
 *
 * Dit is GEEN FacetWP-route. FacetWP blijft de filter-mechaniek voor het
 * hoofdoverzicht `/materials`; deze functie is een dedicated code-
 * gebaseerde relatie-query voor:
 *  - MoreFromBrand op de material-detail-page
 *  - de "Materials by [brand]"-grid op de brand-detail-page
 *
 * Bouwt voort op `listMaterials()` (hero + optionele brand-naam-resolve),
 * dus de items zijn volledige `MaterialListItem`s die de bestaande
 * MaterialCard zonder aanpassing kan renderen.
 *
 * Faalbestendig: de caller bepaalt wat er bij 0 resultaten gebeurt; deze
 * functie geeft simpelweg een (mogelijk lege) lijst terug.
 */
export async function listMaterialsByBrand(
  brandId: number,
  params: ListMaterialsByBrandParams = {},
): Promise<ListMaterialsResult> {
  const {
    perPage = 12,
    exclude,
    resolveHero = true,
    resolveBrandName = false,
  } = params

  return listMaterials({
    brand_id: brandId,
    exclude: exclude ? [exclude] : undefined,
    perPage,
    orderby: 'date',
    order: 'desc',
    resolveHero,
    resolveBrandName,
  })
}

// --------------------------------------------------------------------
// Brand
// --------------------------------------------------------------------

export async function getBrand(
  slug: string,
  options: { resolve?: { gallery?: boolean } } = {},
): Promise<Brand | null> {
  const raw = await fetchBrandBySlugRaw(slug)
  if (!raw) return null

  const resolveGallery = options.resolve?.gallery ?? true

  if (!resolveGallery) {
    return mapBrand(raw, { hero: null, thumbs: [], total: 0 })
  }

  const attachmentsRaw = await getAttachmentsForPost(raw.id)
  const attachments = attachmentsRaw
    .filter((a) => a.media_type === 'image')
    .map(mapMedia)
  const gallery = splitGallery(attachments, raw.featured_media)

  return mapBrand(raw, gallery)
}

export async function listBrands(
  params: ListBrandsParams & { resolveLogo?: boolean } = {},
): Promise<{ items: BrandListItem[]; total: number; totalPages: number }> {
  const { resolveLogo = true, ...rawParams } = params
  const { items: rawItems, total, totalPages } = await listBrandsRaw(rawParams)

  const logoIds = resolveLogo
    ? unique(rawItems.map((r) => r.featured_media).filter((id) => id > 0))
    : []
  const mediaMap = await fetchMediaMap(logoIds)

  const items = rawItems.map((raw) =>
    mapBrandListItem(
      raw,
      raw.featured_media > 0 ? mediaMap.get(raw.featured_media) ?? null : null,
    ),
  )

  return { items, total, totalPages }
}

/**
 * Land-facetoptie voor het brand-filter: waarde + label + telling.
 */
export interface BrandCountryOption {
  /** Filterwaarde (= het label; brand-country is vrije tekst, geen code-taxonomie). */
  value: string
  label: string
  count: number
}

/**
 * Bouwt de Country-filteropties voor het brand-overzicht (Optie A,
 * sessie 5).
 *
 * IDEAAL: WP levert facet-tellingen naast de gefilterde resultaten (net
 * als FacetWP voor materials). Tot Johan dat koppelt (open-issue
 * sessie 5) aggregeren we de landen hier client-side uit een ruime,
 * ongefilterde brand-fetch. `resolveLogo: false` houdt dit licht — we
 * hebben alleen `country` nodig, geen media.
 *
 * Beperking (genoteerd): de tellingen kloppen alleen als `aggregateMax`
 * groot genoeg is om alle brands te dekken. Zolang de catalogus binnen
 * één ruime fetch past is dat prima; daarboven zijn de tellingen een
 * ondergrens tot de backend facet-counts levert. De landen-LIJST zelf is
 * dan nog steeds bruikbaar als filter — alleen de getallen zijn dan
 * indicatief.
 */
export async function getBrandCountryOptions(
  aggregateMax = 100,
): Promise<BrandCountryOption[]> {
  const { items } = await listBrands({
    perPage: aggregateMax,
    page: 1,
    resolveLogo: false,
    orderby: 'title',
    order: 'asc',
  })

  const counts = new Map<string, number>()
  for (const brand of items) {
    const country = brand.country?.trim()
    if (!country) continue
    counts.set(country, (counts.get(country) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export async function getArticle(slug: string): Promise<Article | null> {
  const raw = await fetchArticleBySlugRaw(slug)
  if (!raw) return null
  const hero =
    raw.featured_media > 0 ? await getMediaImage(raw.featured_media) : null
  // Author-naam-resolve: TODO sessie 2-vervolg via /wp/v2/users/<id>
  return mapArticle(raw, hero, null)
}

export async function listArticles(
  params: ListArticlesParams & { resolveHero?: boolean } = {},
) {
  const { resolveHero = true, ...rawParams } = params
  const { items: rawItems, total, totalPages } = await listArticlesRaw(rawParams)
  const heroIds = resolveHero
    ? unique(rawItems.map((r) => r.featured_media).filter((id) => id > 0))
    : []
  const mediaMap = await fetchMediaMap(heroIds)
  const items = rawItems.map((raw) =>
    mapArticleListItem(
      raw,
      raw.featured_media > 0 ? mediaMap.get(raw.featured_media) ?? null : null,
    ),
  )
  return { items, total, totalPages }
}

/**
 * Story-type filteroptie voor het article-overzicht: type + label + telling.
 */
export interface StoryTypeOption {
  value: StoryType
  label: string
  count: number
}

/**
 * Bouwt de story-type-filteropties voor het `/articles` overzicht (Optie A,
 * D1 — voorbereid).
 *
 * In tegenstelling tot het brand-Country-filter is de optie-SET hier vast
 * (de vijf canonieke types uit `STORY_TYPE_META`); alleen de TELLINGEN
 * worden geaggregeerd. Zolang Johan `story_type` nog niet levert mapt de
 * mapper elk article op de default `'news'` — dan staat de volledige
 * telling bij News en de andere types op 0. De sidebar toont dan alle vijf
 * types met die (indicatieve) counts; zodra het veld gekoppeld is verdelen
 * de tellingen zich vanzelf, zonder frontend-wijziging.
 *
 * Aggregeert client-side uit één ruime, ongefilterde article-fetch
 * (`resolveHero: false` houdt dit licht — we tellen alleen types). De
 * tellingen zijn een ondergrens als de catalogus niet binnen `aggregateMax`
 * past; de type-LIJST zelf blijft hoe dan ook volledig en bruikbaar als
 * filter. Analoog aan `getBrandCountryOptions` (sessie 5).
 */
export async function getArticleStoryTypeOptions(
  aggregateMax = 100,
): Promise<StoryTypeOption[]> {
  const { items } = await listArticles({
    perPage: aggregateMax,
    page: 1,
    resolveHero: false,
    orderby: 'date',
    order: 'desc',
  })

  const counts = new Map<StoryType, number>()
  for (const type of STORY_TYPES) counts.set(type, 0)
  for (const article of items) {
    counts.set(article.type, (counts.get(article.type) ?? 0) + 1)
  }

  return STORY_TYPES.map((type) => ({
    value: type,
    label: storyTypeLabel(type),
    count: counts.get(type) ?? 0,
  }))
}

export async function getEvent(slug: string): Promise<Event | null> {
  const raw = await fetchEventBySlugRaw(slug)
  if (!raw) return null
  const hero =
    raw.featured_media > 0 ? await getMediaImage(raw.featured_media) : null
  return mapEvent(raw, hero)
}

export async function listEvents(
  params: ListEventsParams & { resolveHero?: boolean } = {},
) {
  const { resolveHero = true, ...rawParams } = params
  const { items: rawItems, total, totalPages } = await listEventsRaw(rawParams)
  const heroIds = resolveHero
    ? unique(rawItems.map((r) => r.featured_media).filter((id) => id > 0))
    : []
  const mediaMap = await fetchMediaMap(heroIds)
  const items = rawItems.map((raw) =>
    mapEventListItem(
      raw,
      raw.featured_media > 0 ? mediaMap.get(raw.featured_media) ?? null : null,
    ),
  )
  return { items, total, totalPages }
}

// --------------------------------------------------------------------
// Talk
// --------------------------------------------------------------------

export async function getTalk(slug: string): Promise<Talk | null> {
  const raw = await fetchTalkBySlugRaw(slug)
  if (!raw) return null
  const hero =
    raw.featured_media > 0 ? await getMediaImage(raw.featured_media) : null
  return mapTalk(raw, hero)
}

export async function listTalks(
  params: ListTalksParams & { resolveHero?: boolean } = {},
) {
  const { resolveHero = true, ...rawParams } = params
  const { items: rawItems, total, totalPages } = await listTalksRaw(rawParams)
  const heroIds = resolveHero
    ? unique(rawItems.map((r) => r.featured_media).filter((id) => id > 0))
    : []
  const mediaMap = await fetchMediaMap(heroIds)
  const items = rawItems.map((raw) =>
    mapTalkListItem(
      raw,
      raw.featured_media > 0 ? mediaMap.get(raw.featured_media) ?? null : null,
    ),
  )
  return { items, total, totalPages }
}

// --------------------------------------------------------------------
// Internal resolvers
// --------------------------------------------------------------------

async function getMediaImage(id: number) {
  const raw = await getMedia(id)
  return raw ? mapMedia(raw) : null
}

/**
 * Batch-fetch van media-IDs tot een Map<id, MediaImage>.
 * Gebruikt `include` om in één REST-call meerdere attachments te halen.
 */
async function fetchMediaMap(
  ids: number[],
): Promise<Map<number, ReturnType<typeof mapMedia>>> {
  const map = new Map<number, ReturnType<typeof mapMedia>>()
  if (ids.length === 0) return map
  const { getMediaBatch } = await import('./wordpress')
  const items = await getMediaBatch(ids)
  for (const raw of items) {
    map.set(raw.id, mapMedia(raw))
  }
  return map
}

/**
 * Batch-fetch van brand-IDs tot een Map<id, naam>.
 * Gebruikt `include` op `/wp/v2/brand` om in één call alle brands te halen.
 */
async function fetchBrandNameMap(ids: number[]): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  if (ids.length === 0) return map
  const { items } = await listBrandsRaw({
    include: ids,
    perPage: ids.length,
  })
  for (const raw of items) {
    map.set(raw.id, raw.title.rendered)
  }
  return map
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
