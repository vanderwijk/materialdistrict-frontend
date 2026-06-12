'use client'

/**
 * CartView — winkelmand-UI (client).
 *
 * Rendert de Store-API-mand uit `useCart`: regelitems met aantal/verwijderen,
 * coupon, en een ordersamenvatting. Alle bedragen komen rechtstreeks uit de
 * response (minor-units → euro's); we rekenen niets zelf na — ook de btw en
 * verzendkosten zijn van WooCommerce.
 *
 * De checkout-knop staat uit tot de checkout-fase (payments). De Insider-
 * korting is NIET hier toegepast: de mand toont wat WooCommerce daadwerkelijk
 * rekent. (Zie MANIFEST: de member-korting moet server-side in WC komen.)
 */

import { useState } from 'react'
import { useCart } from '@/components/providers/CartContext'
import { storeMinorToNumber } from '@/lib/api/cart'
import { formatEur } from '@/lib/utils/format-price'
import { Button, EmptyState } from '@/components/ui'

function slugFromPermalink(permalink: string): string {
  return permalink.replace(/\/+$/, '').split('/').pop() ?? ''
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
  const money = (value: string | undefined, unit = minor) =>
    formatEur(storeMinorToNumber(value, unit))
  const discount = storeMinorToNumber(cart.totals.total_discount, minor)

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
        {cart.items.map((item) => {
          const img = item.images?.[0]
          const slug = slugFromPermalink(item.permalink)
          return (
            <div key={item.key} className="cart-item">
              <div className="cart-item-thumb">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.thumbnail ?? img.src} alt={img.alt || item.name} />
                ) : null}
              </div>

              <div className="cart-item-main">
                <a className="cart-item-title" href={`/books/${slug}`}>
                  {item.name}
                </a>
                <div className="cart-item-unit">
                  {money(item.prices.price, item.prices.currency_minor_unit)}
                </div>

                <div className="cart-item-controls">
                  <div className="cart-qty">
                    <button
                      type="button"
                      onClick={() => updateItem(item.key, Math.max(1, item.quantity - 1))}
                      disabled={loading || item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
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
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(item.key)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-item-linetotal">
                {money(item.totals.line_total, item.totals.currency_minor_unit)}
              </div>
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
            <dd>{money(cart.totals.total_items)}</dd>
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
                {cart.totals.total_shipping
                  ? money(cart.totals.total_shipping)
                  : 'Calculated at checkout'}
              </dd>
            </div>
          )}
          <div className="cart-totals-row">
            <dt>Tax</dt>
            <dd>{money(cart.totals.total_tax)}</dd>
          </div>
          <div className="cart-totals-row cart-totals-grand">
            <dt>Total</dt>
            <dd>{money(cart.totals.total_price)}</dd>
          </div>
        </dl>

        <a className="cart-checkout-btn" href="/checkout">
          Checkout
        </a>
      </aside>
    </div>
  )
}
