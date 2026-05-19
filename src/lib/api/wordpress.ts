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
 * In .env.local moet WP_API_URL ZONDER trailing slash staan.
 */
export const WP_API_URL = (() => {
  const url = process.env.WP_API_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required env var: WP_API_URL')
    }
    // Dev fallback — voorkomt crash tijdens lokaal opstarten zonder env
    return 'https://materialdistrict.com/wp-json'
  }
  return url.replace(/\/$/, '')
})()

const WP_USER = process.env.WP_APP_USER
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD

/** Default revalidate-tijd in seconden voor publieke content (1 uur). */
const DEFAULT_REVALIDATE = 3600

// --------------------------------------------------------------------
// Cache-kill-switch voor staging/dev (sessie 6 — feedback Johan)
// --------------------------------------------------------------------
//
// Caching is geweldig in productie maar maakt content-tests verwarrend:
// Johan past iets aan in WP-admin, ververst de frontend, ziet de oude
// versie en denkt dat zijn wijziging niet is doorgekomen. Tot 24 uur
// later (BRAND_REVALIDATE, MEDIA_REVALIDATE).
//
// Oplossing: één env-variabele die in dev/staging álle WP-fetches
// dwingt naar `cache: 'no-store'`. In productie staat hij uit en blijft
// de cache-tuning werken zoals gepland.
//
// Zet in `.env.local` (dev/staging):
//   WP_CACHE_DISABLED=true
//
// Productie: zet 'm NIET (of expliciet op `false`). Default = uit.
//
// Scope:
//   - `wpFetch` / `wpFetchPaginated`  → respecteren deze flag
//   - `facetwpFetch` (in facetwp.ts)  → respecteert hem óók (zelfde flag)
//   - `wpAuthFetch`                   → gebruikte al `cache: 'no-store'`,
//                                       niet beïnvloed
//
// We exporteren een helper-functie zodat `facetwp.ts` 'm kan importeren
// in plaats van de env-var twee keer te lezen. Eén bron van waarheid.

const CACHE_DISABLED = process.env.WP_CACHE_DISABLED === 'true'

// Waarschuwing als de cache-kill-switch per ongeluk aan staat in
// productie. We crashen NIET — er zijn legitieme debug-sessies waar
// dit zinvol is — maar maken het hard zichtbaar in de server-logs
// zodat het niet maandenlang door iemand wordt vergeten.
if (CACHE_DISABLED && process.env.NODE_ENV === 'production') {
  console.warn(
    '[wordpress.ts] WP_CACHE_DISABLED=true in production — every WP fetch ' +
      'will hit the upstream WordPress server. Performance and load profile ' +
      'will be significantly worse than designed. Unset this env var unless ' +
      'you are actively debugging.',
  )
}

/**
 * True wanneer alle publieke WP-fetches `cache: 'no-store'` moeten
 * gebruiken. Bedoeld voor staging/dev waar Johan content test.
 *
 * Geëxporteerd zodat `facetwp.ts` (en eventueel andere fetchers) dezelfde
 * flag kunnen respecteren — niemand moet `process.env.WP_CACHE_DISABLED`
 * direct lezen.
 */
export function isCacheDisabled(): boolean {
  return CACHE_DISABLED
}

// --------------------------------------------------------------------
// Per-content-type revalidate (sessie 6 — performance)
// --------------------------------------------------------------------
//
// Verschillende content-types muteren met verschillende frequenties.
// WordPress doet 150–400ms per single-fetch, dus elke cache-hit is winst.
// Onderstaande waarden zijn conservatief gekozen: liever iets te lang dan
// content die niet ververst. Bij brand-side wijzigingen die per direct
// zichtbaar moeten zijn, kan Johan een on-demand revalidation-endpoint
// inbouwen (`revalidateTag('material:1234')`) — pas dán hebben we ook
// een reden om tags op de fetches te zetten. Voor nu: tijdsgebaseerd.

/** Materials: brands wijzigen per item gemiddeld <1x per week. 6 uur. */
const MATERIAL_REVALIDATE = 6 * 3600 // 21600s

/** Brand-records: bijna nooit gewijzigd na aanmaak. 24 uur. */
const BRAND_REVALIDATE = 24 * 3600 // 86400s

/** Media: afbeeldingen-metadata wijzigt nooit na upload. 24 uur. */
const MEDIA_REVALIDATE = 24 * 3600 // 86400s

/** Taxonomie-termen (tags, themes, etc.): zelden gewijzigd. 24 uur. */
const TERM_REVALIDATE = 24 * 3600 // 86400s

/**
 * Articles, events, talks, books — wisselend dynamisch. Events kunnen
 * tot kort voor datum schuiven; articles worden af en toe ge-edit.
 * Default (1 uur) houden voor deze types — beter expliciet maken zodat
 * de keuze in de code zichtbaar is.
 */
const EDITORIAL_REVALIDATE = DEFAULT_REVALIDATE // 3600s



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

  if (options.noCache || CACHE_DISABLED) {
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

  if (options.noCache || CACHE_DISABLED) {
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
    revalidate: TERM_REVALIDATE,
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
    return wpFetchOrNull<WPTermResponse>(`/wp/v2/${taxonomy}/${idOrSlug}`, {
      revalidate: TERM_REVALIDATE,
    })
  }
  const matches = await wpFetch<WPTermResponse[]>(`/wp/v2/${taxonomy}`, {
    revalidate: TERM_REVALIDATE,
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
  return wpFetchOrNull<WPMediaResponse>(`/wp/v2/media/${id}`, {
    revalidate: MEDIA_REVALIDATE,
  })
}

/** Batch-versie voor gallery-ophalen zodra meta is ontsloten. */
export async function getMediaBatch(ids: number[]): Promise<WPMediaResponse[]> {
  if (ids.length === 0) return []
  return wpFetch<WPMediaResponse[]>(`/wp/v2/media`, {
    revalidate: MEDIA_REVALIDATE,
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
    revalidate: MATERIAL_REVALIDATE,
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
  return wpFetchOrNull<WPMaterialRawResponse>(`/wp/v2/material/${id}`, {
    revalidate: MATERIAL_REVALIDATE,
  })
}

export async function getMaterialBySlug(
  slug: string,
): Promise<WPMaterialRawResponse | null> {
  const matches = await wpFetch<WPMaterialRawResponse[]>('/wp/v2/material', {
    revalidate: MATERIAL_REVALIDATE,
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// Attachments — gallery via /wp/v2/media?parent=<post_id>
// --------------------------------------------------------------------

/**
 * Haal alle attachments van een post op, gesorteerd op `menu_order` ascending.
 *
 * WP-conventie: als `menu_order` niet expliciet is gezet (alle waarden 0),
 * valt WP terug op `date asc`. Dat is wat we willen voor MD: brands die
 * de volgorde bewust instellen via WP-admin krijgen die volgorde, anders
 * upload-volgorde (oudste eerst).
 *
 * Default `per_page=100` — galleries worden zelden groter; pagination
 * voor attachments is overkill.
 */
export async function getAttachmentsForPost(
  postId: number,
  params?: { perPage?: number },
): Promise<WPMediaResponse[]> {
  return wpFetch<WPMediaResponse[]>('/wp/v2/media', {
    revalidate: MEDIA_REVALIDATE,
    params: {
      parent: postId,
      per_page: params?.perPage ?? 100,
      orderby: 'menu_order',
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
    revalidate: BRAND_REVALIDATE,
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
  return wpFetchOrNull<WPBrandRawResponse>(`/wp/v2/brand/${id}`, {
    revalidate: BRAND_REVALIDATE,
  })
}

export async function getBrandBySlug(
  slug: string,
): Promise<WPBrandRawResponse | null> {
  const matches = await wpFetch<WPBrandRawResponse[]>('/wp/v2/brand', {
    revalidate: BRAND_REVALIDATE,
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
    revalidate: EDITORIAL_REVALIDATE,
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
  return wpFetchOrNull<WPArticleRawResponse>(`/wp/v2/article/${id}`, {
    revalidate: EDITORIAL_REVALIDATE,
  })
}

export async function getArticleBySlug(
  slug: string,
): Promise<WPArticleRawResponse | null> {
  const matches = await wpFetch<WPArticleRawResponse[]>('/wp/v2/article', {
    revalidate: EDITORIAL_REVALIDATE,
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
    revalidate: EDITORIAL_REVALIDATE,
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
  return wpFetchOrNull<WPEventRawResponse>(`/wp/v2/event/${id}`, {
    revalidate: EDITORIAL_REVALIDATE,
  })
}

export async function getEventBySlug(
  slug: string,
): Promise<WPEventRawResponse | null> {
  const matches = await wpFetch<WPEventRawResponse[]>('/wp/v2/event', {
    revalidate: EDITORIAL_REVALIDATE,
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
    revalidate: EDITORIAL_REVALIDATE,
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
  return wpFetchOrNull<WPTalkRawResponse>(`/wp/v2/talk/${id}`, {
    revalidate: EDITORIAL_REVALIDATE,
  })
}

export async function getTalkBySlug(
  slug: string,
): Promise<WPTalkRawResponse | null> {
  const matches = await wpFetch<WPTalkRawResponse[]>('/wp/v2/talk', {
    revalidate: EDITORIAL_REVALIDATE,
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

// --------------------------------------------------------------------
// User / authentication
// --------------------------------------------------------------------
//
// Custom auth endpoints under `/wp-json/md/v2/auth/*`, confirmed during
// the Johan call of 12-05-2026. No third-party JWT plugin — WordPress
// implements its own endpoints, consistent with the rest of the MD API.
//
// Endpoints covered here:
//   POST /wp-json/md/v2/auth/login            → loginUser
//   GET  /wp-json/md/v2/auth/me               → getCurrentUser
//   POST /wp-json/md/v2/auth/forgot-password  → forgotPassword
//   POST /wp-json/md/v2/auth/reset-password   → resetPassword
//
// All four endpoints use a stable error envelope `{ code, message, data:
// { status } }` with `md_auth_*` codes — see `AuthErrorCode` in
// `@/types/shared` and the contract in `wordpress-instructions-auth.md`.
//
// These functions never touch the cookie. The Next.js route handlers
// in `src/app/api/auth/*` call these functions and then call the cookie
// helpers in `src/lib/auth/cookies.ts`. Strict separation: this file
// is the WordPress client, route handlers orchestrate.

import type {
  AuthErrorCode,
  AuthErrorResponse,
  AuthMeResponse,
  WPAuthMeRawResponse,
} from '@/types/shared'
import { mapAuthMeResponse } from './mappers'

/**
 * Error thrown when WordPress returns an `md_auth_*` error envelope.
 *
 * Separate from the generic `WordPressError` so route handlers can branch:
 *   - `WordPressAuthError` → forward `code` + `message` to the client with
 *     the original HTTP status. These are expected, user-facing errors.
 *   - `WordPressError` (other) → log + return a generic 500 to the client.
 *     These indicate a backend problem, not a user mistake.
 */
export class WordPressAuthError extends WordPressError {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    status: number,
    endpoint: string,
    body?: unknown,
  ) {
    super(message, status, endpoint, body)
    this.name = 'WordPressAuthError'
  }
}

/**
 * Type guard: does an unknown payload look like the standard auth-error
 * envelope `{ code: md_auth_*, message, data: { status } }`?
 */
function isAuthErrorResponse(payload: unknown): payload is AuthErrorResponse {
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  if (typeof p.code !== 'string' || !p.code.startsWith('md_auth_')) return false
  if (typeof p.message !== 'string') return false
  const data = p.data as Record<string, unknown> | undefined
  if (!data || typeof data.status !== 'number') return false
  return true
}

/**
 * Internal fetch wrapper for `/wp-json/md/v2/auth/*` endpoints.
 *
 * Differs from `wpFetch` in three ways:
 *  1. Never sends the WP application-password Basic-Auth header — auth
 *     endpoints either use no auth (login, forgot, reset) or a Bearer
 *     token (me). Application passwords have no role here.
 *  2. Always uses `cache: 'no-store'` — user-specific data.
 *  3. Parses `md_auth_*`-shaped error bodies into `WordPressAuthError`
 *     so route handlers can forward `code` + `message` cleanly.
 *
 * Returns the parsed JSON body on success, throws `WordPressAuthError`
 * (for `md_auth_*` responses) or `WordPressError` (for everything else)
 * on failure.
 */
async function wpAuthFetch<T>(
  path: string,
  init: {
    method: 'GET' | 'POST'
    bearer?: string
    body?: unknown
  },
): Promise<T> {
  const url = `${WP_API_URL}${path.startsWith('/') ? path : `/${path}`}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (init.bearer) {
    headers.Authorization = `Bearer ${init.bearer}`
  }

  const res = await fetch(url, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    let payload: unknown
    try {
      payload = await res.json()
    } catch {
      // body not JSON — fall through to generic error
    }
    if (isAuthErrorResponse(payload)) {
      throw new WordPressAuthError(
        payload.code,
        payload.message,
        res.status,
        url,
        payload,
      )
    }
    throw new WordPressError(
      `WordPress auth fetch failed (${res.status} ${res.statusText})`,
      res.status,
      url,
      payload,
    )
  }

  return (await res.json()) as T
}

/**
 * Log in with email + password.
 *
 * On success WordPress returns the JWT plus the full user object in one
 * response, so no follow-up call to `/auth/me` is needed.
 *
 * @throws WordPressAuthError for `md_auth_invalid_request`,
 *         `md_auth_invalid_email`, `md_auth_failed`.
 * @throws WordPressError for unexpected backend failures.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthMeResponse> {
  const raw = await wpAuthFetch<WPAuthMeRawResponse>('/md/v2/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  return mapAuthMeResponse(raw)
}

/**
 * Fetch the current user using the JWT from the auth cookie.
 *
 * Called server-side during layout render to hydrate the AuthContext.
 * Also called by `/api/auth/me` route handler for client-driven refreshes.
 *
 * @param token JWT from the HttpOnly cookie
 * @throws WordPressAuthError when the token is rejected (the caller
 *         should clear the cookie in that case).
 * @throws WordPressError for unexpected backend failures.
 */
export async function getCurrentUser(token: string): Promise<AuthMeResponse> {
  const raw = await wpAuthFetch<WPAuthMeRawResponse>('/md/v2/auth/me', {
    method: 'GET',
    bearer: token,
  })
  return mapAuthMeResponse(raw)
}

/**
 * Request a password-reset email.
 *
 * WordPress always returns a neutral 200 response regardless of whether
 * the email exists in the database — this prevents user enumeration.
 * Rate limiting (3 requests per email per hour) is enforced by WordPress.
 *
 * We return `void`: the only thing the caller cares about is "did the
 * request go through without a server error". The user-facing message
 * is the same in every case.
 *
 * @throws WordPressError for unexpected backend failures (5xx). These
 *         should not be exposed to the user verbatim; the route handler
 *         shows a generic error message instead.
 */
export async function forgotPassword(email: string): Promise<void> {
  await wpAuthFetch<{ message: string }>('/md/v2/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

/**
 * Complete a password reset using the one-time token from the reset
 * email link.
 *
 * WordPress validates the token (must exist, must not be expired, must
 * not have been used) and checks the new password against the
 * server-side strength rules before updating the user.
 *
 * @throws WordPressAuthError with code `md_auth_invalid_token` when the
 *         token is unknown, expired, or already used.
 * @throws WordPressAuthError with code `md_auth_weak_password` when the
 *         new password fails the server-side strength check.
 * @throws WordPressError for unexpected backend failures.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await wpAuthFetch<{ message: string }>('/md/v2/auth/reset-password', {
    method: 'POST',
    body: { token, new_password: newPassword },
  })
}

/**
 * Create a new account.
 *
 * Contract pending Johan implementation — see
 * `wordpress-instructions-register.md`. The expected shape mirrors
 * `/auth/login` exactly: on success WordPress returns the JWT plus the
 * full user object, allowing the route handler to set the auth cookie
 * and log the new user in without an extra round trip.
 *
 * Why first_name / last_name as separate fields (not a combined `name`):
 * WordPress stores them as separate user-meta keys and the rest of the
 * datacontract (see `auth-strategy.md` §4) already exposes them as
 * nullable separate fields. Sending them split keeps the server side
 * straightforward and avoids guessing at how to split a single string.
 *
 * @throws WordPressAuthError for:
 *   - `md_auth_invalid_request`  — required field missing or empty
 *   - `md_auth_invalid_email`    — email format invalid
 *   - `md_auth_email_taken`      — email already registered
 *   - `md_auth_weak_password`    — password fails server-side strength check
 * @throws WordPressError for unexpected backend failures.
 */
export async function registerUser(args: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthMeResponse> {
  const raw = await wpAuthFetch<WPAuthMeRawResponse>('/md/v2/auth/register', {
    method: 'POST',
    body: {
      email: args.email,
      password: args.password,
      first_name: args.firstName,
      last_name: args.lastName,
    },
  })
  return mapAuthMeResponse(raw)
}
