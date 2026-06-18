/**
 * SidebarBooks — compact "Books"-blok voor de homepage-rechterkolom.
 *
 * Build-order stap 10, S10.2. Presentational server-component: krijgt de
 * nieuwste boeken (al opgehaald door de homepage-server-component) en toont
 * een korte lijst met cover + titel + prijs (ex. btw), met een deeplink naar
 * het volledige boeken-overzicht. Vult de rechterkolom onder de bestaande
 * sidebar-widgets (zoals in de demo).
 *
 * Lege lijst → de hele sectie verdwijnt.
 */

import Link from 'next/link'
import type { BookListItem } from '@/types/book'

export interface SidebarBooksProps {
  books: BookListItem[]
}

const priceFmt = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
})

export function SidebarBooks({ books }: SidebarBooksProps) {
  if (books.length === 0) return null

  return (
    <section className="hp-sidebar-books" aria-label="Latest books">
      <div className="hp-sidebar-books-head">
        <h2 className="hp-sidebar-books-title">Books</h2>
        <Link href="/book" className="hp-sidebar-books-link">
          All books →
        </Link>
      </div>
      <ul className="hp-sidebar-books-list">
        {books.map((book) => {
          const price = book.priceExVat ?? book.price
          return (
            <li key={book.id}>
              <Link href={`/book/${book.slug}`} className="hp-sidebar-book">
                <span
                  className="hp-sidebar-book-cover"
                  aria-hidden="true"
                  style={
                    book.cover?.url
                      ? { backgroundImage: `url(${book.cover.url})` }
                      : undefined
                  }
                />
                <span className="hp-sidebar-book-body">
                  <span className="hp-sidebar-book-title">{book.title}</span>
                  <span className="hp-sidebar-book-price">
                    {priceFmt.format(price)}{' '}
                    <span className="hp-sidebar-book-vat">ex. VAT</span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
