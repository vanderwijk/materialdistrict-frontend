/**
 * Books API (geïsoleerde vertical)
 * ----------------------------------------------------------------------
 * Eén module voor de books-shop: de rauwe WP-shape, de raw→domain mappers,
 * de publieke fetchers (`listBooks`, `getBook`) én een mock-seam.
 *
 * Waarom geïsoleerd (i.p.v. verspreid over wordpress.ts / content.ts /
 * mappers.ts zoals de andere content-types): het WP-endpoint bestaat nog
 * niet, dus we bouwen tegen mock. Door alles hier te houden blijven de
 * gedeelde, hoog-churn bestanden ongemoeid tot het contract met Johan
 * vastligt. Zodra dat zo is, kan de mapper alsnog naar `mappers.ts`
 * verhuizen — de domeintypes (`src/types/book.ts`) veranderen daarbij niet.
 *
 * Mock-seam: zolang `BOOKS_LIVE !== 'true'` draaien de fetchers op de
 * fixtures uit `books-mock.ts`. Die fixtures hebben de RAUWE shape en lopen
 * door dezelfde mapper als live-data — de UI ziet dus exact de live-output.
 * Swap naar live = `BOOKS_LIVE=true` in de env zetten; geen codewijziging.
 *
 * Prijs: deze module leest alleen de reguliere `price` (uit WooCommerce). De
 * Insider-prijs is geen veld in de payload — die leidt de UI af via
 * `getBookPrice(price, isInsider)` met de centrale `BOOK_DISCOUNT`-constante.
 *
 * Bron (bevestigd door Johan, 11-06): een boek is een WooCommerce-PRODUCT
 * (`post_type=product`), géén `book`-CPT en géén ACF. De endpoint is
 * `/wp/v2/product?product_cat=books`; de boek-metadata (isbn←sku,
 * publisher←pa_publisher, price, in_stock, …) komt top-level via
 * `register_rest_field`. Onze domeintypes blijven identiek — alleen de
 * mapper-input is een product.
 *
 * Contract: `docs/books-datacontract.md` (v0.3).
 */

import type { Book, BookListItem, BooksListParams } from '@/types/book'
import type { MediaImage } from '@/types/media'

import { mapMedia } from './mappers'
import {
  getMedia,
  wpFetch,
  wpFetchPaginated,
  type WPMediaResponse,
} from './wordpress'

import { MOCK_BOOKS } from './books-mock'

// --------------------------------------------------------------------
// Rauwe WP-shape (snake_case) — WooCommerce-product op /wp/v2/product
// --------------------------------------------------------------------
// Native product-velden + de top-level velden die Johan via
// register_rest_field toevoegt. Geen `acf`-blok: dat was puur een
// naamgevingsconventie; de werkelijke bron is SKU + product attributes.
// Zie het mapping-overzicht in docs/books-datacontract.md.

export interface WPBookRawResponse {
  id: number
  date: string
  modified: string
  slug: string
  status: 'publish' | 'draft' | 'private'
  /** Permalink. NB: na cutover een backend/cms-URL — niet user-facing tonen. */
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  featured_media: number
  /** Boek-metadata, top-level via register_rest_field. */
  isbn?: string
  publisher?: string
  /** Nu leeg; later optionele product attributes. */
  author_name?: string
  pages?: number
  publication_year?: number
  /** Server-velden: reguliere WC-prijs (number, EUR) + voorraad. */
  price?: number
  in_stock?: boolean
  /** Fase-afhankelijke koop-URL, door Johan geleverd. Nooit een cms-URL. */
  buy_url?: string
  _embedded?: {
    'wp:featuredmedia'?: WPMediaResponse[]
  }
}

// --------------------------------------------------------------------
// Config
// --------------------------------------------------------------------

/** Prijzen kunnen wijzigen → 30 min revalidate, conform `woocommerce.ts`. */
const BOOK_REVALIDATE = 1800

/**
 * Mock-seam. Default: mock (endpoint bestaat nog niet). Zet `BOOKS_LIVE=true`
 * in de env zodra Johans endpoint op de testserver staat — dan lopen dezelfde
 * mappers over live-data.
 */
const BOOKS_LIVE = process.env.BOOKS_LIVE === 'true'

/**
 * Endpoint + categorie. Een boek is een WC-product; we filteren op de
 * `books`-productcategorie (`show-catalogues` is een child daarvan en valt er
 * dus vanzelf onder — v1 toont beide).
 */
const BOOK_ENDPOINT = '/wp/v2/product'
const BOOK_PRODUCT_CAT = 'books'

const DEFAULT_PER_PAGE = 24

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

/** Veilige rendered-HTML-extractie (zelfde semantiek als `mappers.wpRenderedHtml`). */
function renderedHtml(field: { rendered?: string } | undefined | null): string {
  return field?.rendered ?? ''
}

function nullableString(value: string | undefined | null): string | null {
  const v = value?.trim()
  return v ? v : null
}

function nullableNumber(value: number | undefined | null): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null
}

/** Prijzen zijn nooit `null` in het domein: ontbreekt een waarde, dan 0. */
function toPrice(value: number | undefined | null): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

/**
 * Cover uit embedded media (via `?_embed`). `null` als afwezig of als WP een
 * error-stub embed (geen `id`/`media_details`) teruggeeft.
 */
function coverFromEmbedded(raw: WPBookRawResponse): MediaImage | null {
  const media = raw._embedded?.['wp:featuredmedia']?.[0]
  if (!media || typeof media.id !== 'number' || !media.media_details) {
    return null
  }
  return mapMedia(media)
}

// --------------------------------------------------------------------
// Mappers (raw → domain)
// --------------------------------------------------------------------

export function mapBookListItem(
  raw: WPBookRawResponse,
  cover: MediaImage | null = coverFromEmbedded(raw),
): BookListItem {
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: renderedHtml(raw.title),
    excerptHtml: renderedHtml(raw.excerpt),
    cover,
    author: nullableString(raw.author_name),
    publicationYear: nullableNumber(raw.publication_year),
    price: toPrice(raw.price),
    inStock: raw.in_stock ?? true,
    date: raw.date,
  }
}

export function mapBook(
  raw: WPBookRawResponse,
  cover: MediaImage | null = coverFromEmbedded(raw),
): Book {
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: renderedHtml(raw.title),
    contentHtml: renderedHtml(raw.content),
    excerptHtml: renderedHtml(raw.excerpt),
    cover,
    author: nullableString(raw.author_name),
    isbn: nullableString(raw.isbn),
    publisher: nullableString(raw.publisher),
    pages: nullableNumber(raw.pages),
    publicationYear: nullableNumber(raw.publication_year),
    // Een boek IS het WC-product → product-id is de wc_product_id.
    wcProductId: raw.id,
    buyUrl: nullableString(raw.buy_url),
    price: toPrice(raw.price),
    inStock: raw.in_stock ?? true,
    date: raw.date,
    modified: raw.modified,
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

  if (!BOOKS_LIVE) {
    return listBooksMock({ page, perPage, orderby, order, search })
  }

  const { items, total, totalPages } = await wpFetchPaginated<
    WPBookRawResponse[]
  >(BOOK_ENDPOINT, {
    revalidate: BOOK_REVALIDATE,
    params: {
      product_cat: BOOK_PRODUCT_CAT,
      _embed: true,
      per_page: perPage,
      page,
      orderby,
      order,
      search: search || undefined,
    },
  })

  return {
    items: items.map((raw) => mapBookListItem(raw)),
    total,
    totalPages,
  }
}

export async function getBook(slug: string): Promise<Book | null> {
  if (!BOOKS_LIVE) {
    return getBookMock(slug)
  }

  const matches = await wpFetch<WPBookRawResponse[]>(BOOK_ENDPOINT, {
    revalidate: BOOK_REVALIDATE,
    params: { product_cat: BOOK_PRODUCT_CAT, slug, per_page: 1, _embed: true },
  })
  const raw = matches[0]
  if (!raw) return null

  // `?_embed` levert de cover meestal mee; val anders terug op een losse fetch.
  let cover = coverFromEmbedded(raw)
  if (!cover && raw.featured_media > 0) {
    const media = await getMedia(raw.featured_media)
    cover = media ? mapMedia(media) : null
  }
  return mapBook(raw, cover)
}

// --------------------------------------------------------------------
// Mock-implementatie
// --------------------------------------------------------------------
// In-memory equivalent van wat het endpoint straks doet: filteren op zoek,
// sorteren, pagineren. Verwijderbaar zodra `BOOKS_LIVE=true` standaard is en
// de fixtures niet meer nodig zijn.

function listBooksMock(args: {
  page: number
  perPage: number
  orderby: 'date' | 'title'
  order: 'asc' | 'desc'
  search: string
}): ListBooksResult {
  const { page, perPage, orderby, order, search } = args

  let rows = MOCK_BOOKS.filter((b) => b.status === 'publish')

  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter((b) =>
      [
        b.title.rendered,
        b.author_name ?? '',
        b.isbn ?? '',
        b.publisher ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }

  rows = [...rows].sort((a, b) => {
    const cmp =
      orderby === 'title'
        ? a.title.rendered.localeCompare(b.title.rendered)
        : a.date.localeCompare(b.date)
    return order === 'asc' ? cmp : -cmp
  })

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const items = rows
    .slice(start, start + perPage)
    .map((raw) => mapBookListItem(raw))

  return { items, total, totalPages }
}

function getBookMock(slug: string): Book | null {
  const raw = MOCK_BOOKS.find((b) => b.slug === slug)
  return raw ? mapBook(raw) : null
}
