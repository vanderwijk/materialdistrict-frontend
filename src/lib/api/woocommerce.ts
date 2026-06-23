/**
 * WooCommerce REST API client
 * ----------------------------------------------------------------------
 * Voor publieke read-acties (products, product reviews) gebruiken we
 * eenvoudige Basic Auth met de WC consumer key/secret.
 *
 * WooCommerce ondersteunt twee auth-modi:
 *  - Over HTTPS: HTTP Basic Auth (consumer key als user, secret als pwd)
 *  - Over HTTP: OAuth 1.0a one-legged
 *
 * Productie draait op HTTPS, dus we gebruiken Basic Auth. Eenvoudiger,
 * geen signing, geen nonce-gedoe.
 *
 * Bron-doc: https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication
 *
 * Sessie 2 status: scaffold + endpoint-functies voor books staan klaar.
 * `book` is mogelijk een WooCommerce-product (categorie "books") en/of een
 * apart `book` CPT — dat moet nog worden bevestigd. Beide patronen
 * worden hieronder gefaciliteerd.
 */

// --------------------------------------------------------------------
// Configuratie
// --------------------------------------------------------------------

/**
 * WooCommerce REST API base. Doorgaans:
 *   https://cms.materialdistrict.com/wp-json/wc/v3
 */
export const WC_API_URL = (() => {
  // Stand-alone configurable, OF afgeleid van WP_API_URL
  const explicit = process.env.WC_API_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const wp = process.env.WP_API_URL
  if (wp) return `${wp.replace(/\/$/, '')}/wc/v3`

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required env var: WC_API_URL or WP_API_URL')
  }
  return 'https://cms.materialdistrict.com/wp-json/wc/v3'
})()

const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET

const DEFAULT_REVALIDATE = 1800 // 30 min — productprijzen kunnen wijzigen

// --------------------------------------------------------------------
// Auth header
// --------------------------------------------------------------------

function buildAuthHeader(): Record<string, string> {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing required env vars: WC_CONSUMER_KEY and/or WC_CONSUMER_SECRET',
      )
    }
    return {}
  }
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString(
    'base64',
  )
  return { Authorization: `Basic ${token}` }
}

// --------------------------------------------------------------------
// Errors
// --------------------------------------------------------------------

export class WooCommerceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'WooCommerceError'
  }
}

// --------------------------------------------------------------------
// Generieke fetcher
// --------------------------------------------------------------------

export interface WCFetchOptions {
  revalidate?: number
  noCache?: boolean
  tags?: string[]
  params?: Record<string, string | number | boolean | string[] | number[] | undefined>
  signal?: AbortSignal
}

function buildUrl(
  path: string,
  params?: WCFetchOptions['params'],
): string {
  const url = new URL(`${WC_API_URL}${path.startsWith('/') ? path : `/${path}`}`)
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

export async function wcFetch<T>(
  path: string,
  options: WCFetchOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.params)

  const fetchOptions: RequestInit & {
    next?: { revalidate?: number; tags?: string[] }
  } = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...buildAuthHeader(),
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
    throw new WooCommerceError(
      `WooCommerce fetch failed (${res.status} ${res.statusText})`,
      res.status,
      url,
      payload,
    )
  }

  return (await res.json()) as T
}

// --------------------------------------------------------------------
// Products (Books) — lichte typing tot exacte WC-config bekend is
// --------------------------------------------------------------------

export interface WCProductImage {
  id: number
  src: string
  name: string
  alt: string
}

export interface WCProductCategory {
  id: number
  name: string
  slug: string
}

/**
 * Conservatieve modellering van een WooCommerce-product.
 * WooCommerce retourneert veel meer velden — voeg pas toe wanneer de UI
 * ze gebruikt.
 */
export interface WCProduct {
  id: number
  name: string
  slug: string
  permalink: string
  date_created: string
  type: 'simple' | 'grouped' | 'external' | 'variable'
  status: 'draft' | 'pending' | 'private' | 'publish'
  featured: boolean
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  categories: WCProductCategory[]
  tags: { id: number; name: string; slug: string }[]
  images: WCProductImage[]
  attributes: { id: number; name: string; options: string[] }[]
  meta_data: { id: number; key: string; value: unknown }[]
}

export interface ListProductsParams {
  perPage?: number
  page?: number
  category?: number | string
  search?: string
  include?: number[]
  exclude?: number[]
  orderby?: 'date' | 'id' | 'title' | 'slug' | 'price' | 'popularity' | 'rating'
  order?: 'asc' | 'desc'
  status?: 'any' | 'draft' | 'pending' | 'private' | 'publish'
  featured?: boolean
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<WCProduct[]> {
  return wcFetch<WCProduct[]>('/products', {
    params: {
      per_page: params.perPage ?? 20,
      page: params.page,
      category: params.category,
      search: params.search,
      include: params.include,
      exclude: params.exclude,
      orderby: params.orderby,
      order: params.order,
      status: params.status,
      featured: params.featured,
    },
  })
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const matches = await wcFetch<WCProduct[]>('/products', {
    params: { slug, per_page: 1 },
  })
  return matches[0] ?? null
}

export async function getProductById(id: number): Promise<WCProduct | null> {
  try {
    return await wcFetch<WCProduct>(`/products/${id}`)
  } catch (err) {
    if (err instanceof WooCommerceError && err.status === 404) return null
    throw err
  }
}

// --------------------------------------------------------------------
// Books-specific helpers
// --------------------------------------------------------------------
// Sessie 2 BLOCKER: bevestigen of "books" een WC-product-categorie is
// (dan werkt `listProducts({ category: 'books' })`) of een apart `book`-CPT
// dat via WP REST komt. Tot bevestiging laten we beide mogelijk:

/**
 * Lijst books — gaat ervan uit dat books een WC-categorie zijn.
 * Pas BOOK_CATEGORY_SLUG aan zodra de werkelijke slug bekend is.
 */
const BOOK_CATEGORY_SLUG = 'books' // TODO: bevestigen

export async function listBooks(
  params: Omit<ListProductsParams, 'category'> = {},
): Promise<WCProduct[]> {
  return listProducts({ ...params, category: BOOK_CATEGORY_SLUG })
}

// --------------------------------------------------------------------
// Orders, customers, cart — Fase 2
// --------------------------------------------------------------------
// TODO Fase 2: getOrders, createOrder, getCustomerById — pas wanneer
// dashboard/checkout aan de beurt is. Niet onderdeel van Fase 1.
