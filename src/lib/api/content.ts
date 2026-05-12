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
  getArticleBySlug as fetchArticleBySlugRaw,
  getAttachmentsForPost,
  getBrandById as fetchBrandByIdRaw,
  getBrandBySlug as fetchBrandBySlugRaw,
  getEventBySlug as fetchEventBySlugRaw,
  getMaterialBySlug as fetchMaterialBySlugRaw,
  getMedia,
  getTalkBySlug as fetchTalkBySlugRaw,
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

  if (!resolveGallery) {
    return mapMaterial(raw, { hero: null, thumbs: [], total: 0 })
  }

  const attachmentsRaw = await getAttachmentsForPost(raw.id)
  const attachments = attachmentsRaw
    .filter((a) => a.media_type === 'image')
    .map(mapMedia)

  const gallery = splitGallery(attachments, raw.featured_media)
  return mapMaterial(raw, gallery)
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

// --------------------------------------------------------------------
// Article
// --------------------------------------------------------------------

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

// --------------------------------------------------------------------
// Event
// --------------------------------------------------------------------

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
