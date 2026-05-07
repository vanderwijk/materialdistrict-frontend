/**
 * WordPress REST API client
 * ----------------------------------------------------------------------
 * Generieke fetcher + endpoint-functies per CPT.
 *
 * Authenticatie via WordPress Application Password (Basic Auth), alleen
 * gebruikt voor leesoperaties van publieke content. Anonymous-fetches
 * werken voor reeds gepubliceerde posts; auth is nodig voor draft/private
 * preview, custom user-endpoints, en write-actions in Fase 2.
 *
 * Architectuur-regels:
 * - Geen eigen filterlogica — alles via FacetWP voor materials
 * - ISR via `next: { revalidate }` op fetch-options
 * - Strict types op alle endpoints
 *
 * Sessie 2 status:
 * - `material` endpoint werkt anonymous, post-meta NIET ontsloten (blocker)
 * - `brand`/`article`/`talk`/`event`/`book` endpoints onbekend tot
 *   WP-developer ze in REST exposeert
 */

// --------------------------------------------------------------------
// Configuratie
// --------------------------------------------------------------------

/**
 * Base URL van de WordPress REST API.
 * In productie: `https://materialdistrict.com/wp-json`
 *
 * In `.env.local` moet `WP_API_URL` zonder trailing slash staan.
 * Als de env-var ontbreekt, vallen we terug op de publieke productie-API.
 */
export const WP_API_URL = (() => {
  const url = process.env.WP_API_URL
  if (!url) return 'https://materialdistrict.com/wp-json'
  return url.replace(/\/$/, '')
})()

const WP_USER = process.env.WP_APP_USER
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD

/** Default revalidate-tijd in seconden voor publieke content (1 uur). */
const DEFAULT_REVALIDATE = 3600

// --------------------------------------------------------------------
// Auth header (alleen meegestuurd als beide env-vars aanwezig zijn)
// --------------------------------------------------------------------

function buildAuthHeader(): Record<string, string> {
  if (!WP_USER || !WP_APP_PASSWORD) return {}
  // App passwords worden vaak met spaties getoond door WP — strippen voor de zekerheid
  const cleanPassword = WP_APP_PASSWORD.replace(/\s+/g, '')
  const token = Buffer.from(`${WP_USER}:${cleanPassword}`).toString('base64')
  return { Authorization: `Basic ${token}` }
}

// --------------------------------------------------------------------
// Errors
// --------------------------------------------------------------------

export class WordPressError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'WordPressError'
  }
}

export class WordPressNotFoundError extends WordPressError {
  constructor(endpoint: string, body?: unknown) {
    super(`Resource not found: ${endpoint}`, 404, endpoint, body)
    this.name = 'WordPressNotFoundError'
  }
}

// --------------------------------------------------------------------
// Generieke fetcher
// --------------------------------------------------------------------

export interface WPFetchOptions {
  /** ISR-revalidate in seconden. Default 3600 (1 uur). */
  revalidate?: number
  /** Force no-cache (bv. voor user-specifieke data). */
  noCache?: boolean
  /** Extra cache-tags voor on-demand revalidation. */
  tags?: string[]
  /** Querystring-params. Arrays worden komma-separated. */
  params?: Record<string, string | number | boolean | string[] | number[] | undefined>
  /** Extra headers. */
  headers?: Record<string, string>
  /** Cancel-signal. */
  signal?: AbortSignal
}

function buildUrl(
  path: string,
  params?: WPFetchOptions['params'],
): string {
  const url = new URL(`${WP_API_URL}${path.startsWith('/') ? path : `/${path}`}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        if (value.length === 0) continue
        url.searchParams.set(key, value.join(','))
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

/**
 * Lage WP-fetch. Returnt het geparseerde JSON-response.
 * Throwed `WordPressError` (of `WordPressNotFoundError`) bij niet-2xx.
 */
export async function wpFetch<T>(
  path: string,
  options: WPFetchOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.params)

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number; tags?: string[] }
  } = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...buildAuthHeader(),
      ...(options.headers ?? {}),
    },
    signal: options.signal,
  }

  if (options.noCache) {
    fetchOptions.cache = 'no-store'
  } else {
    fetchOptions.next = {
      revalidate: options.revalidate ?? DEFAULT_REVALIDATE,
      ...(options.tags ? { tags: options.tags } : {}),
    }
  }

  const res = await fetch(url, fetchOptions)

  if (!res.ok) {
    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      // ignore
    }
    if (res.status === 404) {
      throw new WordPressNotFoundError(url, payload)
    }
    throw new WordPressError(
      `WordPress fetch failed (${res.status} ${res.statusText})`,
      res.status,
      url,
      payload,
    )
  }

  return (await res.json()) as T
}

/**
 * Variant die `null` returnt bij 404 in plaats van te throwen.
 * Handig voor optionele lookups.
 */
export async function wpFetchOrNull<T>(
  path: string,
  options: WPFetchOptions = {},
): Promise<T | null> {
  try {
    return await wpFetch<T>(path, options)
  } catch (err) {
    if (err instanceof WordPressNotFoundError) return null
    throw err
  }
}

/**
 * Haal de `X-WP-Total` en `X-WP-TotalPages` headers op naast de body.
 * Nodig voor pagination buiten FacetWP (bv. bij brand-overzicht).
 */
export async function wpFetchPaginated<T>(
  path: string,
  options: WPFetchOptions = {},
): Promise<{ items: T; total: number; totalPages: number }> {
  const url = buildUrl(path, options.params)

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number; tags?: string[] }
  } = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...buildAuthHeader(),
      ...(options.headers ?? {}),
    },
    signal: options.signal,
  }

  if (options.noCache) {
    fetchOptions.cache = 'no-store'
  } else {
    fetchOptions.next = {
      revalidate: options.revalidate ?? DEFAULT_REVALIDATE,
      ...(options.tags ? { tags: options.tags } : {}),
    }
  }

  const res = await fetch(url, fetchOptions)

  if (!res.ok) {
    throw new WordPressError(
      `WordPress fetch failed (${res.status} ${res.statusText})`,
      res.status,
      url,
    )
  }

  const items = (await res.json()) as T
  const total = Number(res.headers.get('X-WP-Total') ?? 0)
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 0)

  return { items, total, totalPages }
}

// --------------------------------------------------------------------
// Taxonomie-helpers (werken nu al — onafhankelijk van post-meta blocker)
// --------------------------------------------------------------------

export interface WPTermResponse {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
  parent: number
  meta: Record<string, unknown> | unknown[]
}

/**
 * Bekende taxonomieën op `material`.
 * Bevestigd via REST-verkenning sessie 2:
 *  - tags (post_tag)
 *  - sector
 *  - theme
 *  - material_category
 *  - product_category
 *
 * Daarnaast gebruiken de FacetWP-facets nog 16 eigenschap-taxonomieën
 * (glossiness, translucence, …). Of die ook via standaard
 * `/wp/v2/<slug>` endpoints bereikbaar zijn moet worden geverifieerd.
 */
export type MaterialTaxonomy =
  | 'tags'
  | 'sector'
  | 'theme'
  | 'material_category'
  | 'product_category'

export async function getTerms(
  taxonomy: string,
  params?: {
    perPage?: number
    page?: number
    slug?: string | string[]
    include?: number[]
    parent?: number
    hide_empty?: boolean
  },
): Promise<WPTermResponse[]> {
  // WP REST gebruikt `tags` als endpoint voor de `post_tag` taxonomie.
  // Voor custom taxonomieën is de slug direct het endpoint.
  return wpFetch<WPTermResponse[]>(`/wp/v2/${taxonomy}`, {
    params: {
      per_page: params?.perPage ?? 100,
      page: params?.page,
      slug: params?.slug,
      include: params?.include,
      parent: params?.parent,
      hide_empty: params?.hide_empty,
    },
  })
}

export async function getTerm(
  taxonomy: string,
  idOrSlug: number | string,
): Promise<WPTermResponse | null> {
  if (typeof idOrSlug === 'number') {
    return wpFetchOrNull<WPTermResponse>(`/wp/v2/${taxonomy}/${idOrSlug}`)
  }
  const matches = await wpFetch<WPTermResponse[]>(`/wp/v2/${taxonomy}`, {
    params: { slug: idOrSlug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// Media (featured images, attachments) — werkt nu al
// --------------------------------------------------------------------

export interface WPMediaResponse {
  id: number
  date: string
  slug: string
  type: 'attachment'
  status: 'inherit' | 'publish' | 'draft' | 'private'
  link: string
  title: { rendered: string }
  alt_text: string
  caption: { rendered: string }
  description: { rendered: string }
  media_type: 'image' | 'file'
  mime_type: string
  source_url: string
  /** ID van de post waaraan deze attachment hangt. */
  post: number | null
  /** WP geeft `menu_order` niet altijd terug — alleen wanneer expliciet gevraagd via orderby. */
  menu_order?: number
  author?: number
  media_details: {
    width: number
    height: number
    file: string
    filesize?: number
    sizes?: Record<
      string,
      {
        file: string
        width: number
        height: number
        filesize?: number
        mime_type: string
        source_url: string
      }
    >
    image_meta?: Record<string, unknown>
  }
}

export async function getMedia(id: number): Promise<WPMediaResponse | null> {
  return wpFetchOrNull<WPMediaResponse>(`/wp/v2/media/${id}`)
}

/** Batch-versie voor gallery-ophalen zodra meta is ontsloten. */
export async function getMediaBatch(ids: number[]): Promise<WPMediaResponse[]> {
  if (ids.length === 0) return []
  return wpFetch<WPMediaResponse[]>(`/wp/v2/media`, {
    params: { include: ids, per_page: ids.length, orderby: 'include' },
  })
}

// --------------------------------------------------------------------
// Material endpoints
// --------------------------------------------------------------------

/**
 * Sessie 2 verkenning bevestigde welke velden via REST komen.
 * Deze interface beschrijft de RAW response — het is bewust geen `Material`
 * domain-type. Conversie naar het Material-domeinmodel gebeurt in
 * `src/types/material.ts` (sessie 2-vervolg, na meta-ontsluiting).
 */
export interface WPMaterialRawResponse {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: 'publish' | 'draft' | 'pending' | 'private'
  type: 'material'
  link: string
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  featured_media: number
  comment_status: 'open' | 'closed'
  ping_status: 'open' | 'closed'
  template: string
  /**
   * Meta-velden zoals geëxposeerd door `rest-post-meta.php` in de
   * MaterialDistrict-plugin (zie developer-handover sessie 2).
   *
   * We typeren hier ALLEEN de frontend-aliassen + publieke meta. De
   * onderliggende `_material_*`-velden worden door de plugin óók
   * geëxposeerd maar zijn redundant — één bron van waarheid in de
   * frontend.
   *
   * BELANGRIJK: `samples_available` zit als alias in de handover, maar
   * is misleidend omgekeerd t.o.v. de WP-bron. De developer draait deze
   * om naar `disable_sample_request` (zie session-log sessie 2-vervolg).
   * Tot die fix LIVE staat zal `meta.disable_sample_request` undefined
   * zijn — domain-mapper gebruikt `?? false` als fallback (samples aan).
   */
  meta: {
    brand_id?: number
    disable_sample_request?: boolean
    material_code?: string
    short_description?: string
    transport_weight?: string
    not_available?: boolean
    featured?: boolean
    commercial_material?: boolean
    gallery?: number[]
    video_url?: string
    datasheet_url?: string
    epd_url?: string
    product_url?: string
    [otherKey: string]: unknown
  }
  /** Standaard taxonomieën als ID-arrays op de post. */
  tags: number[]
  sector: number[]
  theme: number[]
  material_category: number[]
  product_category: number[]
  /**
   * String-array met alle term-slugs. Bruikbaar als snelle bron van
   * eigenschappen (glossiness, translucence, hardness, …) zonder
   * extra term-fetch.
   *
   * Voorbeeld:
   *   "glossiness-variable", "translucence-50-100-percent",
   *   "hardness-soft", "renewable-no", …
   */
  class_list: string[]
  acf: [] | Record<string, unknown> // bevestigd `[]` op materials
  yoast_head?: string
  yoast_head_json?: Record<string, unknown>
  _links: Record<string, unknown>
}

export interface ListMaterialsParams {
  perPage?: number
  page?: number
  slug?: string
  include?: number[]
  exclude?: number[]
  search?: string
  /** Filter op term-IDs van een specifieke taxonomie. */
  material_category?: number[]
  sector?: number[]
  theme?: number[]
  tags?: number[]
  orderby?: 'date' | 'modified' | 'title' | 'id' | 'include'
  order?: 'asc' | 'desc'
  /** Voor server-side rendering een verse fetch afdwingen. */
  noCache?: boolean
}

/**
 * Lijst materials. Voor de overzichtspagina met filtering: gebruik bij voorkeur
 * `fetchMaterials` uit `facetwp.ts` — die ondersteunt alle 20 facets.
 *
 * Deze functie is voor:
 *  - simpele use-cases (homepage carousels, "recente materials")
 *  - relatie-queries die FacetWP niet ondersteunt
 *    (bv. "alle materials van brand X" zodra brand_id-meta beschikbaar is)
 */
export async function listMaterials(
  params: ListMaterialsParams = {},
): Promise<{ items: WPMaterialRawResponse[]; total: number; totalPages: number }> {
  return wpFetchPaginated<WPMaterialRawResponse[]>('/wp/v2/material', {
    noCache: params.noCache,
    params: {
      per_page: params.perPage ?? 12,
      page: params.page,
      slug: params.slug,
      include: params.include,
      exclude: params.exclude,
      search: params.search,
      material_category: params.material_category,
      sector: params.sector,
      theme: params.theme,
      tags: params.tags,
      orderby: params.orderby ?? 'date',
      order: params.order ?? 'desc',
    },
  })
}

export async function getMaterialById(
  id: number,
): Promise<WPMaterialRawResponse | null> {
  return wpFetchOrNull<WPMaterialRawResponse>(`/wp/v2/material/${id}`)
}

export async function getMaterialBySlug(
  slug: string,
): Promise<WPMaterialRawResponse | null> {
  const matches = await wpFetch<WPMaterialRawResponse[]>('/wp/v2/material', {
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// Attachments — gallery via /wp/v2/media?parent=<post_id>
// --------------------------------------------------------------------

/**
 * Haal alle attachments van een post op, gesorteerd op upload-volgorde.
 *
 * De huidige WP REST-configuratie accepteert geen `orderby=menu_order` op
 * `/wp/v2/media`; die request faalt met 400. Daarom gebruiken we `date asc`,
 * wat overeenkomt met de gewenste fallback-volgorde voor bestaande galleries.
 *
 * Default `per_page=100` — galleries worden zelden groter; pagination
 * voor attachments is overkill.
 */
export async function getAttachmentsForPost(
  postId: number,
  params?: { perPage?: number },
): Promise<WPMediaResponse[]> {
  return wpFetch<WPMediaResponse[]>('/wp/v2/media', {
    params: {
      parent: postId,
      per_page: params?.perPage ?? 100,
      orderby: 'date',
      order: 'asc',
    },
  })
}

// --------------------------------------------------------------------
// Brand endpoints
// --------------------------------------------------------------------

export interface WPBrandRawResponse {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: 'publish' | 'draft' | 'pending' | 'private'
  type: 'brand'
  link: string
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  featured_media: number
  /**
   * Ontsloten meta volgens developer-handover:
   *   _brand_country, _brand_website, _brand_email,
   *   socials (_brand_facebook, etc.), _partner, _featured
   *
   * BLOCKER (sessie 2): bevestigen via een echte fetch dat de
   * underscore-velden daadwerkelijk verschijnen — WP filtert protected
   * meta met underscore standaard weg, tenzij `auth_callback => __return_true`
   * is gezet in `register_post_meta`.
   */
  meta: Record<string, unknown>
  class_list: string[]
  acf: [] | Record<string, unknown>
  yoast_head_json?: Record<string, unknown>
  _links: Record<string, unknown>
}

export interface ListBrandsParams {
  perPage?: number
  page?: number
  slug?: string
  include?: number[]
  exclude?: number[]
  search?: string
  orderby?: 'date' | 'modified' | 'title' | 'id' | 'include'
  order?: 'asc' | 'desc'
  noCache?: boolean
}

export async function listBrands(
  params: ListBrandsParams = {},
): Promise<{ items: WPBrandRawResponse[]; total: number; totalPages: number }> {
  return wpFetchPaginated<WPBrandRawResponse[]>('/wp/v2/brand', {
    noCache: params.noCache,
    params: {
      per_page: params.perPage ?? 24,
      page: params.page,
      slug: params.slug,
      include: params.include,
      exclude: params.exclude,
      search: params.search,
      orderby: params.orderby ?? 'title',
      order: params.order ?? 'asc',
    },
  })
}

export async function getBrandById(
  id: number,
): Promise<WPBrandRawResponse | null> {
  return wpFetchOrNull<WPBrandRawResponse>(`/wp/v2/brand/${id}`)
}

export async function getBrandBySlug(
  slug: string,
): Promise<WPBrandRawResponse | null> {
  const matches = await wpFetch<WPBrandRawResponse[]>('/wp/v2/brand', {
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// Article endpoints
// --------------------------------------------------------------------

export interface WPArticleRawResponse {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: 'publish' | 'draft' | 'pending' | 'private'
  type: 'article'
  link: string
  author: number
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  featured_media: number
  meta: Record<string, unknown> // _featured (alleen volgens handover)
  categories: number[]
  tags: number[]
  class_list: string[]
  yoast_head_json?: Record<string, unknown>
  _links: Record<string, unknown>
}

export interface ListArticlesParams {
  perPage?: number
  page?: number
  slug?: string
  search?: string
  categories?: number[]
  tags?: number[]
  author?: number
  orderby?: 'date' | 'modified' | 'title' | 'id'
  order?: 'asc' | 'desc'
  noCache?: boolean
}

export async function listArticles(
  params: ListArticlesParams = {},
): Promise<{ items: WPArticleRawResponse[]; total: number; totalPages: number }> {
  return wpFetchPaginated<WPArticleRawResponse[]>('/wp/v2/article', {
    noCache: params.noCache,
    params: {
      per_page: params.perPage ?? 12,
      page: params.page,
      slug: params.slug,
      search: params.search,
      categories: params.categories,
      tags: params.tags,
      author: params.author,
      orderby: params.orderby ?? 'date',
      order: params.order ?? 'desc',
    },
  })
}

export async function getArticleById(
  id: number,
): Promise<WPArticleRawResponse | null> {
  return wpFetchOrNull<WPArticleRawResponse>(`/wp/v2/article/${id}`)
}

export async function getArticleBySlug(
  slug: string,
): Promise<WPArticleRawResponse | null> {
  const matches = await wpFetch<WPArticleRawResponse[]>('/wp/v2/article', {
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// Event endpoints
// --------------------------------------------------------------------

export interface WPEventRawResponse {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: 'publish' | 'draft' | 'pending' | 'private'
  type: 'event'
  link: string
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  featured_media: number
  /**
   * Ontsloten meta volgens handover:
   *   _featured, _event_date_start, _event_date_end,
   *   _event_time_start, _event_time_end,
   *   _event_external_website, _event_costs
   */
  meta: Record<string, unknown>
  class_list: string[]
  yoast_head_json?: Record<string, unknown>
  _links: Record<string, unknown>
}

export interface ListEventsParams {
  perPage?: number
  page?: number
  slug?: string
  search?: string
  /**
   * Filter op datum-range. Niet rechtstreeks ondersteund door WP REST —
   * voor server-side filtering is een meta_query nodig (custom endpoint).
   * Voor nu: filter client-side na fetch via `startsAt`.
   */
  orderby?: 'date' | 'modified' | 'title' | 'id'
  order?: 'asc' | 'desc'
  noCache?: boolean
}

export async function listEvents(
  params: ListEventsParams = {},
): Promise<{ items: WPEventRawResponse[]; total: number; totalPages: number }> {
  return wpFetchPaginated<WPEventRawResponse[]>('/wp/v2/event', {
    noCache: params.noCache,
    params: {
      per_page: params.perPage ?? 12,
      page: params.page,
      slug: params.slug,
      search: params.search,
      orderby: params.orderby ?? 'date',
      order: params.order ?? 'desc',
    },
  })
}

export async function getEventById(
  id: number,
): Promise<WPEventRawResponse | null> {
  return wpFetchOrNull<WPEventRawResponse>(`/wp/v2/event/${id}`)
}

export async function getEventBySlug(
  slug: string,
): Promise<WPEventRawResponse | null> {
  const matches = await wpFetch<WPEventRawResponse[]>('/wp/v2/event', {
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// Talk endpoints
// --------------------------------------------------------------------

export interface WPTalkRawResponse {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: 'publish' | 'draft' | 'pending' | 'private'
  type: 'talk'
  link: string
  title: { rendered: string }
  content: { rendered: string; protected: boolean }
  excerpt: { rendered: string; protected: boolean }
  featured_media: number
  /** Geen specifieke talk-meta in handover. Mogelijk leeg. */
  meta: Record<string, unknown>
  class_list: string[]
  yoast_head_json?: Record<string, unknown>
  _links: Record<string, unknown>
}

export interface ListTalksParams {
  perPage?: number
  page?: number
  slug?: string
  search?: string
  orderby?: 'date' | 'modified' | 'title' | 'id'
  order?: 'asc' | 'desc'
  noCache?: boolean
}

export async function listTalks(
  params: ListTalksParams = {},
): Promise<{ items: WPTalkRawResponse[]; total: number; totalPages: number }> {
  return wpFetchPaginated<WPTalkRawResponse[]>('/wp/v2/talk', {
    noCache: params.noCache,
    params: {
      per_page: params.perPage ?? 12,
      page: params.page,
      slug: params.slug,
      search: params.search,
      orderby: params.orderby ?? 'date',
      order: params.order ?? 'desc',
    },
  })
}

export async function getTalkById(
  id: number,
): Promise<WPTalkRawResponse | null> {
  return wpFetchOrNull<WPTalkRawResponse>(`/wp/v2/talk/${id}`)
}

export async function getTalkBySlug(
  slug: string,
): Promise<WPTalkRawResponse | null> {
  const matches = await wpFetch<WPTalkRawResponse[]>('/wp/v2/talk', {
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// User / authenticatie — wacht op custom membership-uitleg
// --------------------------------------------------------------------
// BLOCKER (sessie 2): we wachten op de uitleg van het custom membership-
// systeem voordat we /wp/v2/users/me of een eventueel custom endpoint
// aanroepen. De `User`-interface in `src/types/shared.ts` blijft
// onaangepast tot die info binnen is.

// TODO sessie 2-vervolg: getCurrentUser() implementeren tegen het
// juiste endpoint met de juiste tier-uitlees-logica.
