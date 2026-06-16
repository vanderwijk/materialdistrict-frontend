'use client'

/**
 * BookCard — boek-tegel voor het /book-overzicht.
 *
 * Gebouwd op dezelfde `Card`-primitives als de generieke `ContentCard` (zelfde
 * thumb + `content-card-*` body-klassen), zodat de tegel één familie is met de
 * materials-/articles-overzichten.
 *
 * - Thumb in **landscape** (`book-thumb`), NIET portrait — dezelfde liggende
 *   tegel die ook de featured-tegel op de homepage gebruikt (punt 2 + 8).
 * - Uitgever als eyebrow, titel, prijs **ex btw** (uit `prices.md_price_ex_vat`)
 *   + Insider-prijs in de Insider-huisstijlkleur (teal).
 * - Twee acties op de tegel: **bookmark** (gedeelde CardBookmarkButton) en
 *   **direct in mandje** (add-to-cart via de gedeelde CartContext). Beide
 *   secundair — groen blijft gereserveerd voor de primaire actie van een pagina.
 */

import { useState } from 'react'
import type { MouseEvent } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { useCart } from '@/components/providers/CartContext'
import { Card, CardBookmarkButton } from '@/components/ui'
import { getBookPrice } from '@/lib/config/membership'
import { formatEur } from '@/lib/utils/format-price'
import type { BookListItem } from '@/types/book'

export function BookCard({
  book,
  variant,
}: {
  book: BookListItem
  /** 'home' = compacte featured-tegel naast de EventCard (zelfde bandhoogte,
   *  geen Add-to-cart). Default = volledige overzichts-/More-books-tegel. */
  variant?: 'home'
}) {
  const { isMember } = useAuth()
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const exReg = book.priceExVat ?? book.price
  const exInsider = getBookPrice(exReg, true)
  const hasDiscount = book.price > 0 && exInsider < exReg

  const coverSrc = book.cover?.thumbnailUrl ?? book.cover?.url

  const onAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    // De tegel is een Link; voorkom navigatie bij klik op de actieknop.
    e.preventDefault()
    e.stopPropagation()
    if (adding || !book.inStock) return
    setAdding(true)
    try {
      await addItem(book.id, 1)
      setAdded(true)
      window.setTimeout(() => setAdded(false), 2000)
    } finally {
      setAdding(false)
    }
  }

  const isHome = variant === 'home'

  return (
    <Card href={`/book/${book.slug}`} prefetch={false} prefetchOn="hover">
      <Card.Thumb
        className={isHome ? 'book-thumb book-thumb--home' : 'book-thumb'}
        src={coverSrc}
        alt={book.cover?.alt || book.title}
      >
        {!book.inStock && (
          <div className="card-thumb-overlay is-top-left">
            <span className="book-tile-soldout">Sold out</span>
          </div>
        )}
        <CardBookmarkButton type="books" itemId={book.id} withOverlay />
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

        {book.inStock ? (
          !isHome && (
            <button
              type="button"
              className="book-tile-add"
              onClick={onAdd}
              disabled={adding}
              aria-label={`Add ${book.title} to cart`}
            >
              {added ? 'Added ✓' : adding ? 'Adding…' : 'Add to cart'}
            </button>
          )
        ) : !isHome ? (
          <span className="book-tile-add is-disabled" aria-disabled="true">
            Sold out
          </span>
        ) : null}
      </Card.Body>
    </Card>
  )
}
