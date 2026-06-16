'use client'

/**
 * BookCard — compacte boek-tegel voor het overzicht.
 *
 * Boek-specifiek (i.p.v. de generieke ContentCard): staande cover (2:3), titel,
 * auteur · publisher, een prominente prijs, en een directe "Add"-knop naar de
 * winkelmand. Cover + titel linken naar de detailpagina; de Add-knop staat los.
 *
 * Insider-korting zichtbaar:
 *  - Ingelogde Insider → de Insider-prijs is de hoofdprijs, met de reguliere
 *    prijs doorgestreept ernaast.
 *  - Iedereen anders → reguliere prijs als hoofdprijs, met een subtiele
 *    "Insider €X"-regel die de korting laat zien.
 * De korting is een centrale UI-afleiding (`getBookPrice`, 10%); de mand/checkout
 * tonen de echte WC-prijs.
 */

import { useState } from 'react'
import { useCart } from '@/components/providers/CartContext'
import { useAuth } from '@/components/providers/AuthContext'
import { isInsider } from '@/lib/auth/user-helpers'
import { getBookPrice } from '@/lib/config/membership'
import { formatEur } from '@/lib/utils/format-price'
import type { BookListItem } from '@/types/book'

export function BookCard({ book }: { book: BookListItem }) {
  const { addItem, loading } = useCart()
  const { user } = useAuth()
  const [pending, setPending] = useState(false)
  const [added, setAdded] = useState(false)

  const insider = isInsider(user)
  const insiderPrice = getBookPrice(book.price, true)

  async function handleAdd() {
    if (!book.inStock || pending) return
    setPending(true)
    try {
      await addItem(book.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      /* stil — fout toont zich verder in de cart */
    } finally {
      setPending(false)
    }
  }

  return (
    <article className="book-card">
      <a className="book-card-link" href={`/books/${book.slug}`}>
        <div className="book-card-cover">
          {book.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover.thumbnailUrl ?? book.cover.url}
              alt={book.cover.alt || book.title}
              loading="lazy"
            />
          ) : (
            <div className="book-card-cover-empty" aria-hidden="true" />
          )}
          {!book.inStock && <span className="book-card-badge">Sold out</span>}
        </div>
        <h3 className="book-card-title">{book.title}</h3>
        {(book.author || book.publisher) && (
          <p className="book-card-meta">
            {book.author && (
              <span className="book-card-author">{book.author}</span>
            )}
            {book.author && book.publisher && (
              <span className="book-card-sep" aria-hidden="true">
                {' · '}
              </span>
            )}
            {book.publisher && (
              <span className="book-card-publisher">{book.publisher}</span>
            )}
          </p>
        )}
      </a>

      <div className="book-card-foot">
        <div className="book-card-prices">
          {insider ? (
            <>
              <span className="book-card-price">{formatEur(insiderPrice)}</span>
              <span className="book-card-price-was">
                {formatEur(book.price)}
              </span>
            </>
          ) : (
            <>
              <span className="book-card-price">{formatEur(book.price)}</span>
              <span className="book-card-insider">
                Insider {formatEur(insiderPrice)}
              </span>
            </>
          )}
        </div>
        {book.inStock ? (
          <button
            type="button"
            className="book-card-add"
            onClick={handleAdd}
            disabled={pending || loading}
            aria-label={`Add ${book.title} to cart`}
          >
            {added ? '✓ Added' : pending ? 'Adding…' : 'Add'}
          </button>
        ) : (
          <span className="book-card-soldout">Sold out</span>
        )}
      </div>
    </article>
  )
}
