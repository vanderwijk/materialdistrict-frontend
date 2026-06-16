'use client'

/**
 * CartView — winkelmand-UI (client).
 *
 * Wijzigingen t.o.v. de eerste versie:
 *  - Eén prijs per regel: het regeltotaal **incl. btw** (geen dubbele incl/excl).
 *  - Bij aantal 1 wordt de min-knop een prullenbak (verwijdert het item); de
 *    losse "Remove"-knop is daarmee weg.
 *  - Verzendkosten: "Calculated at checkout" zolang er geen tarief gekozen is
 *    (de "€0,00"-weergave was misleidend — een leeg/nul-tarief is níét gratis).
 *  - Ordersamenvatting incl. btw, met de btw als notitie ("incl. €X VAT").
 *  - "Spend €X more for free shipping"-melding op basis van het incl-btw
 *    goederen-subtotaal (drempel uit `config/shipping-thresholds`).
 *
 * Bedragen komen uit de Store-API-response (minor-units → euro's). De Insider-
 * korting zit al in `prices.price` (server-side dynamic pricing via de JWT-
 * proxy); we rekenen niets na — behalve het incl-btw-regeltotaal (eenheids-
 * prijs incl. btw × aantal) voor de weergave.
 */

import { useState } from 'react'
import { useCart } from '@/components/providers/CartContext'
import { storeMinorToNumber } from '@/lib/api/cart'
import { formatEur } from '@/lib/utils/format-price'
import { freeShippingRemaining } from '@/lib/config/shipping-thresholds'
import { Button, EmptyState } from '@/components/ui'

function slugFromPermalink(permalink: string): string {
  return permalink.replace(/\/+$/, '').split('/').pop() ?? ''
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function CartView() {
  const {
    cart,
    loading,
    initialized,
    updateItem,
    removeItem,
    applyCouponCode,
    removeCouponCode,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, setCouponPending] = useState(false)

  if (!initialized) {
    return <EmptyState title="Loading your cart…" />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the bookshop to add titles to your cart."
        actions={
          <Button as="link" href="/books" variant="green" size="sm">
            Browse books
          </Button>
        }
      />
    )
  }

  const minor = cart.totals.currency_minor_unit ?? 2
  const moneyN = (value: string | undefined, unit = minor) =>
    storeMinorToNumber(value, unit)
  const money = (value: string | undefined, unit = minor) =>
    formatEur(moneyN(value, unit))
  const discount = moneyN(cart.totals.total_discount)

  // Incl-btw weergave.
  const subtotalIncl =
    moneyN(cart.totals.total_items) + moneyN(cart.totals.total_items_tax)
  const shippingIncl =
    moneyN(cart.totals.total_shipping) + moneyN(cart.totals.total_shipping_tax)
  const totalTax = moneyN(cart.totals.total_tax)
  const shippingSelected =
    cart.shipping_rates?.some((pkg) =>
      pkg.shipping_rates?.some((r) => r.selected),
    ) ?? false

  // Free-shipping-melding: nog geen adres in de mand → NL-drempel (primaire markt).
  const freeShipRemaining = cart.needs_shipping
    ? freeShippingRemaining('NL', subtotalIncl)
    : 0

  async function handleApplyCoupon() {
    const code = couponInput.trim()
    if (!code) return
    setCouponError(null)
    setCouponPending(true)
    try {
      await applyCouponCode(code)
      setCouponInput('')
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon')
    } finally {
      setCouponPending(false)
    }
  }

  return (
    <div className="cart-layout">
      <div className="cart-items">
        {freeShipRemaining > 0 && (
          <div className="cart-freeship" role="status">
            Spend <strong>{formatEur(freeShipRemaining)}</strong> more for free
            shipping!
          </div>
        )}

        {cart.items.map((item) => {
          const img = item.images?.[0]
          const slug = slugFromPermalink(item.permalink)
          const lineUnit = item.prices.currency_minor_unit ?? minor
          const lineIncl = moneyN(item.prices.price, lineUnit) * item.quantity
          const isLast = item.quantity <= 1
          return (
            <div key={item.key} className="cart-item">
              <div className="cart-item-thumb">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.thumbnail ?? img.src}
                    alt={img.alt || item.name}
                  />
                ) : null}
              </div>

              <div className="cart-item-main">
                <a className="cart-item-title" href={`/books/${slug}`}>
                  {item.name}
                </a>

                <div className="cart-item-controls">
                  <div className="cart-qty">
                    <button
                      type="button"
                      className={isLast ? 'cart-qty-trash' : undefined}
                      onClick={() =>
                        isLast
                          ? removeItem(item.key)
                          : updateItem(item.key, item.quantity - 1)
                      }
                      disabled={loading}
                      aria-label={isLast ? 'Remove item' : 'Decrease quantity'}
                    >
                      {isLast ? <TrashIcon /> : '−'}
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItem(item.key, item.quantity + 1)}
                      disabled={loading}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="cart-item-linetotal">{formatEur(lineIncl)}</div>
            </div>
          )
        })}
      </div>

      <aside className="cart-summary">
        <h2 className="cart-summary-head">Order summary</h2>

        <div className="cart-coupon">
          {cart.coupons.length > 0 ? (
            cart.coupons.map((c) => (
              <div key={c.code} className="cart-coupon-applied">
                <span>
                  Coupon <strong>{c.code}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => removeCouponCode(c.code)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="cart-coupon-form">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                aria-label="Coupon code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponPending || !couponInput.trim()}
              >
                Apply
              </button>
            </div>
          )}
          {couponError && (
            <p className="cart-coupon-error" role="alert">
              {couponError}
            </p>
          )}
        </div>

        <dl className="cart-totals">
          <div className="cart-totals-row">
            <dt>Subtotal</dt>
            <dd>{formatEur(subtotalIncl)}</dd>
          </div>
          {discount > 0 && (
            <div className="cart-totals-row">
              <dt>Discount</dt>
              <dd>−{money(cart.totals.total_discount)}</dd>
            </div>
          )}
          {cart.needs_shipping && (
            <div className="cart-totals-row">
              <dt>Shipping</dt>
              <dd>
                {shippingSelected
                  ? formatEur(shippingIncl)
                  : 'Calculated at checkout'}
              </dd>
            </div>
          )}
          <div className="cart-totals-row cart-totals-grand">
            <dt>Total</dt>
            <dd>{money(cart.totals.total_price)}</dd>
          </div>
          {totalTax > 0 && (
            <p className="cart-totals-vat">incl. {formatEur(totalTax)} VAT</p>
          )}
        </dl>

        <a className="cart-checkout-btn" href="/checkout">
          Checkout
        </a>
      </aside>
    </div>
  )
}
