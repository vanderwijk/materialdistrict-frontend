'use client'

/**
 * BookBuyCard
 * ----------------------------------------------------------------------
 * Auth-aware koop-card op de book-detailpagina (MD-stijl ink-paneel) met
 * prijs + "Add to cart" (headless, via de Store-API-cart).
 *
 * Prijsweergave (punt 1): de prijs **ex btw** is het prominente bedrag
 * (B2B-conventie, net als het overzicht); het **incl-btw** bedrag staat er
 * klein onder (consument-zichtbaarheid). De BTW wordt bij de checkout als
 * aparte regel verrekend.
 *
 * Insider-prijs is een UI-afleiding via `getBookPrice`:
 *  - Insider     → Insider-prijs (ex) groot, reguliere prijs (ex) doorgehaald.
 *  - Niet-member → reguliere prijs (ex) groot + upsell.
 *  - Uitverkocht → "Sold out" i.p.v. de knop.
 */

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { useCart } from '@/components/providers/CartContext'
import { getBookPrice } from '@/lib/config/membership'
import { CartError } from '@/lib/api/cart'
import { formatEur } from '@/lib/utils/format-price'

export interface BookBuyCardProps {
  title: string
  /** WooCommerce-product-id, voor add-to-cart. */
  productId: number
  /** Reguliere prijs incl. btw (wat je betaalt). */
  price: number
  /** Reguliere prijs ex. btw (uit `prices.md_price_ex_vat`); valt terug op `price`. */
  priceExVat: number | null
  inStock: boolean
}

export function BookBuyCard({
  title,
  productId,
  price,
  priceExVat,
  inStock,
}: BookBuyCardProps) {
  const { isMember } = useAuth()
  const { addItem } = useCart()

  const [added, setAdded] = useState(false)
  const [pending, setPending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const priceKnown = price > 0
  const exReg = priceExVat ?? price
  const exInsider = getBookPrice(exReg, true)
  const inclInsider = getBookPrice(price, true)
  const hasDiscount = priceKnown && exInsider < exReg

  const useInsider = isMember && hasDiscount
  const exNow = useInsider ? exInsider : exReg
  const inclNow = useInsider ? inclInsider : price

  async function handleAdd() {
    setLocalError(null)
    setPending(true)
    try {
      await addItem(productId, 1)
      setAdded(true)
    } catch (err) {
      setLocalError(
        err instanceof CartError
          ? err.message
          : 'Could not add to cart. Please try again.',
      )
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
            <span className="book-buy-price-now">{formatEur(exNow)}</span>
            <span className="book-buy-price-vat">ex. VAT</span>
            {useInsider && (
              <span className="book-buy-price-was">{formatEur(exReg)}</span>
            )}
          </div>

          <div className="book-buy-price-incl">
            incl. VAT {formatEur(inclNow)}
          </div>

          {useInsider && (
            <div className="book-buy-insider-row">
              <span className="book-buy-insider-tag">Insider price</span>
              <span className="book-buy-save">
                save {formatEur(exReg - exInsider)}
              </span>
            </div>
          )}

          {!isMember && hasDiscount && (
            <p className="book-buy-upsell">
              Insiders pay {formatEur(exInsider)} ex. VAT —{' '}
              <strong>save {formatEur(exReg - exInsider)}</strong>.{' '}
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
          disabled={pending}
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
