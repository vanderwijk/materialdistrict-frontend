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
  md_price_ex_vat?: string
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
  /** Native WooCommerce featured-vlag (sterretje op het product). Plugin
   *  commit 81cfd2f (16-06-2026). Ontbreekt in oudere responses → default false. */
  featured?: boolean
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

/** Store-API prijsveld in minor-units string naar euro's. */
function minorToEuros(value: string | undefined, minor = 2): number | null {
  if (!value) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n / 10 ** minor
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

/** Binnenwerk-spreads uit de product-gallery: alle images ná de cover. */
function mapGallery(images: WCStoreImage[] | undefined): BookCover[] {
  if (!images || images.length <= 1) return []
  return images
    .slice(1)
    .filter((img) => img.src)
    .map((img) => ({
      url: img.src,
      thumbnailUrl: img.thumbnail || null,
      alt: img.alt || img.name || '',
    }))
}

/**
 * Attribuut-waarde op naam (case-insensitive deelmatch op het label), robuust
 * tegen slug-varianten (pa_author vs pa_authors enz.). `joinAll` voegt meerdere
 * termen samen (bv. meerdere auteurs). Geeft `null` als het attribuut ontbreekt
 * — placeholders blijven dus leeg tot Johan de attributes aanmaakt.
 */
function pickAttr(
  attributes: WCStoreAttribute[] | undefined,
  keyword: string,
  joinAll = false,
): string | null {
  const attr = attributes?.find((a) =>
    (a.name ?? '').toLowerCase().includes(keyword),
  )
  const terms = attr?.terms ?? []
  if (terms.length === 0) return null
  return joinAll
    ? nullableString(terms.map((t) => t.name).join(', '))
    : nullableString(terms[0]?.name)
}

/** Eerste getal uit een attribuut-waarde (bv. "224" → 224). */
function pickInt(
  attributes: WCStoreAttribute[] | undefined,
  keyword: string,
): number | null {
  const raw = pickAttr(attributes, keyword)
  const m = raw?.match(/\d+/)
  return m ? Number(m[0]) : null
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
    author: pickAttr(p.attributes, 'author', true),
    publisher: pickAttr(p.attributes, 'publisher'),
    publicationYear: pickInt(p.attributes, 'year'),
    price: priceToEuros(p.prices),
    priceExVat: minorToEuros(p.prices?.md_price_ex_vat, p.prices?.currency_minor_unit ?? 2),
    inStock: p.is_in_stock ?? true,
    featured: p.featured ?? false,
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
    gallery: mapGallery(p.images),
    author: pickAttr(p.attributes, 'author', true),
    format: pickAttr(p.attributes, 'format'),
    // ISBN: eerst het ISBN-attribuut, anders de SKU (huidige MD-titels).
    isbn: pickAttr(p.attributes, 'isbn') ?? nullableString(p.sku),
    publisher: pickAttr(p.attributes, 'publisher'),
    pages: pickInt(p.attributes, 'page'),
    publicationYear: pickInt(p.attributes, 'year'),
    wcProductId: p.id,
    // Kopen gaat via Add-to-cart (stap 2). Geen permalink user-facing.
    buyUrl: null,
    price: priceToEuros(p.prices),
    priceExVat: minorToEuros(p.prices?.md_price_ex_vat, p.prices?.currency_minor_unit ?? 2),
    inStock: p.is_in_stock ?? true,
    featured: p.featured ?? false,
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
        // Native WC featured-vlag (plugin 81cfd2f). Alleen meesturen als true,
        // zodat de reguliere lijst onveranderd blijft.
        ...(params.featured ? { featured: true } : {}),
      },
    },
  )

  return { items: items.map(mapBookListItem), total, totalPages }
}

/**
 * Featured boeken — native WooCommerce featured-vlag (Store API `featured=true`),
 * binnen de books-categorie. Voor het homepage featured-boek-tegeltje volstaat
 * `perPage: 1`. Geen featured boek → lege lijst (de homepage verbergt dan het
 * tegeltje).
 */
export async function listFeaturedBooks(
  params: Omit<BooksListParams, 'featured'> = {},
): Promise<ListBooksResult> {
  return listBooks({ perPage: 1, ...params, featured: true })
}

export async function getBook(slug: string): Promise<Book | null> {
  // Single-product endpoint: /wc/store/v1/products/{id-or-slug}.
  const product = await wpFetchOrNull<WCStoreProduct>(
    `${STORE_PRODUCTS}/${encodeURIComponent(slug)}`,
    { revalidate: BOOK_REVALIDATE },
  )
  return product ? mapBook(product) : null
}
