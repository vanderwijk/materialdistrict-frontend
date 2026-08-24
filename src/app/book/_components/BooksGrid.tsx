'use client'

/**
 * BooksGrid — client-grid van `BookCard` in de gedeelde `.ov-grid-3`-container,
 * zodat de kolomkeuze (ViewToggle, `data-cols`) net als bij materials werkt.
 * Client omdat `BookCard` auth-aware is (Insider-prijs) en de Store-API-cart
 * gebruikt.
 */

import { Fragment } from 'react'
import { BookCard } from './BookCard'
import { GridAdRow, GRID_AD_AFTER } from '@/components/ads/GridAdRow'
import type { BookListItem } from '@/types/book'

export function BooksGrid({ items }: { items: BookListItem[] }) {
  return (
    <div className="ov-grid-3">
      {items.map((book, i) => (
        <Fragment key={book.id}>
          <BookCard book={book} />
          {/* §BETA-FIX-24-08 (L1) — leaderboard onder de eerste rij. */}
          {i === GRID_AD_AFTER - 1 && <GridAdRow />}
        </Fragment>
      ))}
    </div>
  )
}
