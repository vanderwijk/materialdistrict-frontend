'use client'

/**
 * BookCard — boek-tegel voor het /books-overzicht.
 *
 * Bewust gebouwd op dezelfde `Card`-primitives als de generieke `ContentCard`
 * (zelfde thumb + `content-card-*` body-klassen), zodat de tegel één familie
 * is met de materials-/articles-overzichten. Boek-specifiek is alleen:
 *  - portrait-cover (3:4) als thumb;
 *  - uitgever als eyebrow;
 *  - prijs **ex btw** + Insider-prijs in de Insider-huisstijlkleur (teal).
 *
 * De getoonde prijs is ex btw (B2B-conventie, net als de rest van de site),
 * gelezen uit het Store-API extensieveld `prices.md_price_ex_vat`.
 * De Insider-korting (10%) is een UI-afleiding via `getBookPrice`; de mand/
 * checkout tonen de echte WC-prijs.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { Card } from '@/components/ui'
import { getBookPrice } from '@/lib/config/membership'
import { formatEur } from '@/lib/utils/format-price'
import type { BookListItem } from '@/types/book'

export function BookCard({ book }: { book: BookListItem }) {
  const { isMember } = useAuth()

  const exReg = book.priceExVat ?? book.price
  const exInsider = getBookPrice(exReg, true)
  const hasDiscount = book.price > 0 && exInsider < exReg

  const coverSrc = book.cover?.thumbnailUrl ?? book.cover?.url

  return (
    <Card href={`/book/${book.slug}`} prefetch={false} prefetchOn="hover">
      <Card.Thumb
        className="is-portrait"
        src={coverSrc}
        alt={book.cover?.alt || book.title}
      >
        {!book.inStock && (
          <div className="card-thumb-overlay is-top-left">
            <span className="book-tile-soldout">Sold out</span>
          </div>
        )}
      </Card.Thumb>

      <Card.Body>
        {book.publisher && (
          <div className="content-card-eyebrow">{book.publisher}</div>
        )}

        <div className="content-card-title-row">
          <h3 className="content-card-title">{book.title}</h3>
        </div>

        {book.price > 0 && (
          <div className="book-tile-foot">
            {isMember && hasDiscount ? (
              <>
                <span className="book-tile-price">{formatEur(exInsider)}</span>
                <span className="book-tile-was">{formatEur(exReg)}</span>
                <span className="book-tile-vat">ex. VAT</span>
              </>
            ) : (
              <>
                <span className="book-tile-price">{formatEur(exReg)}</span>
                <span className="book-tile-vat">ex. VAT</span>
                {hasDiscount && (
                  <span className="book-tile-insider">
                    Insider {formatEur(exInsider)}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
