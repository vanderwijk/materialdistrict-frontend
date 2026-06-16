'use client'

/**
 * BooksGrid — client-grid van `BookCard` in de gedeelde `.ov-grid-3`-container,
 * zodat de kolomkeuze (ViewToggle, `data-cols`) net als bij materials werkt.
 * Client omdat `BookCard` auth-aware is (Insider-prijs) en de Store-API-cart
 * gebruikt.
 */

import { BookCard } from './BookCard'
import type { BookListItem } from '@/types/book'

export function BooksGrid({ items }: { items: BookListItem[] }) {
  return (
    <div className="ov-grid-3">
      {items.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
