'use client'

/**
 * BookBuyCard
 * ----------------------------------------------------------------------
 * Auth-aware koop-card in de book-detail-sidebar. Ink-paneel met prijs +
 * "Add to cart" (headless, via de Store-API-cart). De Insider-prijs is een
 * UI-afleiding via `getBookPrice(price, isInsider)`:
 *
 *  - Insider      → Insider-prijs groot, reguliere prijs doorgehaald.
 *  - Niet-member  → reguliere prijs groot + upsell.
 *  - Uitverkocht  → "Sold out" i.p.v. de knop.
 *
 * Na toevoegen tonen we "Added" + een link naar /cart. Kopen blijft volledig
 * op het apex-domein (geen redirect naar WooCommerce/cms).
 */

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { useCart } from '@/components/providers/CartContext'
import { getBookPrice } from '@/lib/config/membership'
import { formatEur } from '@/lib/utils/format-price'

export interface BookBuyCardProps {
  title: string
  /** WooCommerce-product-id, voor add-to-cart. */
  productId: number
  price: number
  inStock: boolean
}

export function BookBuyCard({ title, productId, price, inStock }: BookBuyCardProps) {
  const { isMember } = useAuth()
  const { addItem, loading } = useCart()

  const [added, setAdded] = useState(false)
  const [pending, setPending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const priceKnown = price > 0
  const insiderPrice = getBookPrice(price, true)
  const hasDiscount = priceKnown && insiderPrice < price

  async function handleAdd() {
    setLocalError(null)
    setPending(true)
    try {
      await addItem(productId, 1)
      setAdded(true)
    } catch {
      setLocalError('Could not add to cart. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <aside className="book-buy-card" aria-label={`Buy ${title}`}>
      <div className="book-buy-eyebrow">Buy this book</div>

      {priceKnown ? (
        <>
          <div className="book-buy-price">
            <span className="book-buy-price-now">
              {formatEur(isMember && hasDiscount ? insiderPrice : price)}
            </span>
            {isMember && hasDiscount && (
              <span className="book-buy-price-was">{formatEur(price)}</span>
            )}
          </div>

          {isMember && hasDiscount && (
            <div className="book-buy-insider-tag">Insider price applied</div>
          )}

          {!isMember && hasDiscount && (
            <p className="book-buy-upsell">
              Insiders pay {formatEur(insiderPrice)}.{' '}
              <a href="/membership">Become an Insider</a>
            </p>
          )}
        </>
      ) : (
        <p className="book-buy-upsell">See price and availability in the shop.</p>
      )}

      {!inStock ? (
        <span className="book-buy-soldout">Sold out</span>
      ) : added ? (
        <div className="book-buy-added">
          <span className="book-buy-added-label">✓ Added to cart</span>
          <a className="book-buy-btn-link" href="/cart">
            View cart<span aria-hidden="true"> →</span>
          </a>
        </div>
      ) : (
        <button
          type="button"
          className="book-buy-btn"
          onClick={handleAdd}
          disabled={pending || loading}
        >
          {pending ? 'Adding…' : 'Add to cart'}
        </button>
      )}

      {localError && (
        <p className="book-buy-error" role="alert">
          {localError}
        </p>
      )}
    </aside>
  )
}
