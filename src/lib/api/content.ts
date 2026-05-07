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
 */

import type { Article } from '@/types/article'
import type { Brand, BrandListItem } from '@/types/brand'
import type { Event } from '@/types/event'
import type { Material, MaterialListItem } from '@/types/material'
import type { Talk } from '@/types/talk'

import {
  mapArticle,
  mapArticleListItem,
  mapBrand,
  mapBrandListItem,
  mapEvent,
  mapEventListItem,
  mapMaterial,
  mapMaterialListItem,
  mapMedia,
  mapTalk,
  mapTalkListItem,
  splitGallery,
} from './mappers'

import {
  type ListArticlesParams,
  type ListBrandsParams,
  type ListEventsParams,
  type ListMaterialsParams,
  type ListTalksParams,
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
 * Voor de hoofdoverzichtspagina /material met FacetWP-filtering: gebruik
 * `fetchMaterials` uit `./facetwp`.
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
async function fetchMediaMap(ids: number[]): Promise<Map<number, ReturnType<typeof mapMedia>>> {
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
