/**
 * Book types
 * ----------------------------------------------------------------------
 * Domain-model voor de books-shop (`book`-CPT + gekoppeld WooCommerce-product).
 *
 * Net als bij de overige content-types zijn dit PLATTE domeintypes (`title`
 * als string, `cover` als `BookCover`), niet de rauwe WP-shape. De rauwe
 * response-shape (`WPBookRawResponse`) en de raw→domain mapping staan in
 * `src/lib/api/books.ts` — bewust geïsoleerd zolang het WP-endpoint nog niet
 * live is, zodat de gedeelde `mappers.ts` / `content.ts` ongemoeid blijven.
 *
 * Prijs: `price` (incl. btw) en `priceExVat` (ex. btw) komen uit WooCommerce.
 * De Insider-prijs is GEEN apart veld — de korting is een centrale instelling
 * (`BOOK_DISCOUNT.insiderDiscount` in `lib/config/membership.ts`, nu 10%) en de
 * UI leidt de te tonen prijs af via `getBookPrice(price, isInsider)`. Wil je
 * ooit een ander percentage, dan wijzig je die ene constante en niets anders.
 * Zie `docs/books-datacontract.md`.
 */

/**
 * Cover uit de WooCommerce Store API (`images[0]`). Geen WP-media-shape: de
 * Store API levert directe URL's. `MediaImage` is hier dus bewust niet gebruikt.
 */
export interface BookCover {
  /** Volledige cover-URL (`images[0].src`). */
  url: string
  /** Thumbnail (`images[0].thumbnail`); `null` als afwezig. */
  thumbnailUrl: string | null
  alt: string
}

/** Sorteervelden die het overzicht ondersteunt. */
export type BookOrderBy = 'date' | 'title'

/**
 * Lichtgewicht boek voor lijsten/cards (overzichtspagina).
 * Prijs zit erop zodat cards de (Insider-)prijs kunnen tonen zonder extra call.
 */
export interface BookListItem {
  id: number
  slug: string
  link: string
  title: string
  excerptHtml: string
  cover: BookCover | null
  /** Auteur(s) — uit het `Authors`-attribuut (samengevoegd); `null` als afwezig. */
  author: string | null
  /** Uitgever — uit het `Publisher`-attribuut; `null` als afwezig. */
  publisher: string | null
  /** Uit het `Year of Publishing`-attribuut; `null` als afwezig. */
  publicationYear: number | null
  /** Reguliere prijs in EUR (getal, twee decimalen). De Insider-prijs leidt de
   *  UI af via `getBookPrice(price, isInsider)`. */
  price: number
  /** Catalogusprijs ex. btw in EUR (afkomstig uit Store API extensieveld). */
  priceExVat: number | null
  /** Afgeleid van WC `stock_status`. */
  inStock: boolean
  date: string
}

/** Volledig boek voor de detailpagina. */
export interface Book {
  id: number
  slug: string
  link: string
  title: string
  contentHtml: string
  excerptHtml: string
  cover: BookCover | null
  /** Binnenwerk-spreads uit de product-gallery (`images[1..]`). */
  gallery: BookCover[]
  author: string | null
  format: string | null
  isbn: string | null
  publisher: string | null
  pages: number | null
  publicationYear: number | null
  /** WooCommerce-product-ID waaraan dit boek hangt. `null` als niet gekoppeld. */
  wcProductId: number | null
  /**
   * Doel-URL voor de koop-CTA: de WooCommerce-productpagina/winkelmand.
   * Checkout bouwen we niet opnieuw in Next.js. `null` tot Johan de
   * permalink/route bevestigt (open vraag 5 in het datacontract).
   */
  buyUrl: string | null
  price: number
  /** Detailprijs ex. btw in EUR (afkomstig uit Store API extensieveld). */
  priceExVat: number | null
  inStock: boolean
  date: string
  modified: string
}

/** Parameters voor `listBooks` (camelCase publieke API). */
export interface BooksListParams {
  page?: number
  perPage?: number
  search?: string
  orderby?: BookOrderBy
  order?: 'asc' | 'desc'
}
