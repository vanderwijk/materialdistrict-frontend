import type { WPPostBase, ListParams } from './shared'

/**
 * Book — gekoppeld aan een WooCommerce product.
 * `wc_product_id` verwijst naar het bijbehorende product zodat we
 * via de WooCommerce API de actuele prijs en voorraad kunnen ophalen.
 */
export interface Book extends WPPostBase {
  acf?: {
    author_name?: string
    isbn?: string
    publisher?: string
    pages?: number
    publication_year?: number
    wc_product_id?: number
  }
}

export interface BookWithPrice extends Book {
  price: number
  insiderPrice: number
  inStock: boolean
}

export type BooksListParams = ListParams
