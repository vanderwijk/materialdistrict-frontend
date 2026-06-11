/**
 * Books API — WooCommerce Store API (headless storefront)
 * ----------------------------------------------------------------------
 * Bron: de WooCommerce **Store API** (`/wc/store/v1/products`) op de
 * env-geconfigureerde WP-basis (`WP_API_URL`). Dit vervangt de eerdere
 * `/wp/v2/product`-aanpak: de hele storefront (catalogus → cart → checkout)
 * draait headless in Next.js. Zie `docs/nextjs-store-api-handoff.md`.
 *
 * Stap 1 dekt alleen de **catalogus** (read-only, ISR). Cart/checkout volgen.
 *
 * Mapping-bijzonderheden:
 *  - prijs: `prices.price` staat in minor-units als string ("2350" = €23,50)
 *    → gedeeld door 10^currency_minor_unit.
 *  - cover: uit `images[0]` (geen WP-media/`_embed` meer).
 *  - isbn ← `sku`; publisher ← het `pa_publisher`-attribuut.
 *  - auteur/pagina's/jaar: niet in de Store API → voorlopig leeg.
 *  - geen `buy_url`/permalink user-facing: kopen gaat via Add-to-cart (stap 2);
 *    de permalink wordt na cutover een backend/cms-URL.
 *  - de Store API levert geen `date_created`; sorteren op datum gebeurt
 *    server-side, per item tonen we geen datum.
 *
 * Insider-prijs blijft een UI-afleiding via `getBookPrice()`.
 */

import type {
  Book,
  BookCover,
  BookListItem,
  BooksListParams,
} from '@/types/book'

import { wpFetch, wpFetchOrNull, wpFetchPaginated } from './wordpress'

// --------------------------------------------------------------------
// Rauwe Store-API-shape (subset die we gebruiken)
// --------------------------------------------------------------------

interface WCStorePrices {
  price: string
  regular_price: string
  sale_price: string
  currency_code: string
  currency_minor_unit: number
  currency_symbol: string
}

interface WCStoreImage {
  id: number
  src: string
  thumbnail?: string
  srcset?: string
  name?: string
  alt?: string
}

interface WCStoreAttributeTerm {
  id: number
  name: string
  slug: string
}

interface WCStoreAttribute {
  id: number
  name: string
  taxonomy: string | null
  terms: WCStoreAttributeTerm[]
}

interface WCStoreCategory {
  id: number
  name: string
  slug: string
  link?: string
}

export interface WCStoreProduct {
  id: number
  name: string
  slug: string
  parent: number
  type: string
  permalink: string
  sku: string
  short_description: string
  description: string
  on_sale: boolean
  prices: WCStorePrices
  images: WCStoreImage[]
  categories: WCStoreCategory[]
  attributes: WCStoreAttribute[]
  is_purchasable: boolean
  is_in_stock: boolean
}

// --------------------------------------------------------------------
// Config
// --------------------------------------------------------------------

const STORE_PRODUCTS = '/wc/store/v1/products'
const STORE_CATEGORIES = '/wc/store/v1/products/categories'
const BOOKS_CATEGORY_SLUG = 'books'

/** Prijzen/voorraad kunnen wijzigen → 30 min. */
const BOOK_REVALIDATE = 1800
const DEFAULT_PER_PAGE = 24

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

function nullableString(value: string | undefined | null): string | null {
  const v = value?.trim()
  return v ? v : null
}

/** Store-API-prijs (minor-units string) → euro's als getal. */
function priceToEuros(prices: WCStorePrices | undefined): number {
  if (!prices?.price) return 0
  const minor = prices.currency_minor_unit ?? 2
  const n = Number(prices.price)
  return Number.isFinite(n) ? n / 10 ** minor : 0
}

function mapCover(images: WCStoreImage[] | undefined): BookCover | null {
  const img = images?.[0]
  if (!img?.src) return null
  return {
    url: img.src,
    thumbnailUrl: img.thumbnail || null,
    alt: img.alt || img.name || '',
  }
}

/** Publisher uit het `pa_publisher`-attribuut (eerste term). */
function pickPublisher(attributes: WCStoreAttribute[] | undefined): string | null {
  const attr = attributes?.find((a) => a.taxonomy === 'pa_publisher')
  return nullableString(attr?.terms?.[0]?.name)
}

// --------------------------------------------------------------------
// Categorie-resolver (slug → id), gememoïseerd. Cutover-proof: we hardcoden
// geen term-id. Override mogelijk via env `BOOKS_CATEGORY_ID`.
// --------------------------------------------------------------------

let booksCategoryIdPromise: Promise<number | null> | null = null

async function getBooksCategoryId(): Promise<number | null> {
  const override = process.env.BOOKS_CATEGORY_ID
  if (override) {
    const n = Number(override)
    if (Number.isFinite(n)) return n
  }
  if (!booksCategoryIdPromise) {
    booksCategoryIdPromise = (async () => {
      try {
        const cats = await wpFetch<WCStoreCategory[]>(STORE_CATEGORIES, {
          revalidate: 3600,
          params: { per_page: 100 },
        })
        return cats.find((c) => c.slug === BOOKS_CATEGORY_SLUG)?.id ?? null
      } catch {
        return null
      }
    })()
  }
  return booksCategoryIdPromise
}

// --------------------------------------------------------------------
// Mappers (Store-API-product → domein)
// --------------------------------------------------------------------

export function mapBookListItem(p: WCStoreProduct): BookListItem {
  return {
    id: p.id,
    slug: p.slug,
    link: p.permalink,
    title: p.name,
    excerptHtml: p.short_description ?? '',
    cover: mapCover(p.images),
    // Niet in de Store API; later evt. als product attribute.
    author: null,
    publicationYear: null,
    price: priceToEuros(p.prices),
    inStock: p.is_in_stock ?? true,
    // Store API levert geen date_created; sorteren gebeurt server-side.
    date: '',
  }
}

export function mapBook(p: WCStoreProduct): Book {
  return {
    id: p.id,
    slug: p.slug,
    link: p.permalink,
    title: p.name,
    contentHtml: p.description ?? '',
    excerptHtml: p.short_description ?? '',
    cover: mapCover(p.images),
    author: null,
    isbn: nullableString(p.sku),
    publisher: pickPublisher(p.attributes),
    pages: null,
    publicationYear: null,
    wcProductId: p.id,
    // Kopen gaat via Add-to-cart (stap 2). Geen permalink user-facing.
    buyUrl: null,
    price: priceToEuros(p.prices),
    inStock: p.is_in_stock ?? true,
    date: '',
    modified: '',
  }
}

// --------------------------------------------------------------------
// Publieke fetchers
// --------------------------------------------------------------------

export interface ListBooksResult {
  items: BookListItem[]
  total: number
  totalPages: number
}

export async function listBooks(
  params: BooksListParams = {},
): Promise<ListBooksResult> {
  const page = params.page ?? 1
  const perPage = params.perPage ?? DEFAULT_PER_PAGE
  const orderby = params.orderby ?? 'date'
  const order = params.order ?? 'desc'
  const search = params.search?.trim() ?? ''

  const categoryId = await getBooksCategoryId()

  const { items, total, totalPages } = await wpFetchPaginated<WCStoreProduct[]>(
    STORE_PRODUCTS,
    {
      revalidate: BOOK_REVALIDATE,
      params: {
        ...(categoryId ? { category: categoryId } : {}),
        per_page: perPage,
        page,
        orderby,
        order,
        search: search || undefined,
      },
    },
  )

  return { items: items.map(mapBookListItem), total, totalPages }
}

export async function getBook(slug: string): Promise<Book | null> {
  // Single-product endpoint: /wc/store/v1/products/{id-or-slug}.
  const product = await wpFetchOrNull<WCStoreProduct>(
    `${STORE_PRODUCTS}/${encodeURIComponent(slug)}`,
    { revalidate: BOOK_REVALIDATE },
  )
  return product ? mapBook(product) : null
}
