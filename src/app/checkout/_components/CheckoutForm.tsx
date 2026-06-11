'use client'

/**
 * CheckoutForm — de volledige afrekenflow (client). Draait binnen <Elements>
 * (zie CheckoutView), zodat de Stripe-card-velden werken.
 *
 * Stappen:
 *  1. Contact (e-mail) + factuuradres (+ optioneel apart verzendadres).
 *  2. "Calculate shipping" → `update-customer` → verzendtarieven → keuze →
 *     `select-shipping-rate`. Totalen komen uit de mand-response.
 *  3. Betaling: Stripe-kaart (PaymentMethod client-side) of iDEAL (redirect).
 *  4. `POST /checkout`. Bij `redirect_url` (3DS/iDEAL) → doorsturen; anders bij
 *     success/pending → /order-confirmation/{id}?key=…
 *
 * De Stripe `payment_data` komt uit `buildStripePaymentData` — de enige plek
 * die nog via capture bevestigd moet worden (handoff §4.1).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useCart } from '@/components/providers/CartContext'
import { storeMinorToNumber, type StoreAddress } from '@/lib/api/cart'
import {
  buildStripePaymentData,
  rememberOrderEmail,
  submitCheckout,
  STRIPE_CARD_METHOD,
  STRIPE_IDEAL_METHOD,
  type PaymentDataItem,
} from '@/lib/api/checkout'
import { formatEur } from '@/lib/utils/format-price'
import { AddressFields } from './AddressFields'

type PayMethod = 'card' | 'ideal'

const EMPTY_ADDRESS: StoreAddress = {
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  postcode: '',
  country: 'NL',
  state: '',
}

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1a1a1a',
      '::placeholder': { color: '#9a9a9a' },
    },
  },
}

export function CheckoutForm() {
  const router = useRouter()
  const { cart, setCustomer, selectShipping, loading } = useCart()
  const stripe = useStripe()
  const elements = useElements()

  const [email, setEmail] = useState('')
  const [billing, setBilling] = useState<StoreAddress>(EMPTY_ADDRESS)
  const [shipSame, setShipSame] = useState(true)
  const [shipping, setShipping] = useState<StoreAddress>(EMPTY_ADDRESS)
  const [ratesLoaded, setRatesLoaded] = useState(false)
  const [method, setMethod] = useState<PayMethod>('card')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shipAddr = shipSame ? billing : shipping
  const minor = cart?.totals.currency_minor_unit ?? 2
  const money = (v?: string) => formatEur(storeMinorToNumber(v, minor))

  const rates = cart?.shipping_rates?.[0]?.shipping_rates ?? []
  const selectedRate = rates.find((r) => r.selected)

  async function handleCalculateShipping() {
    setError(null)
    try {
      await setCustomer(shipAddr, billing)
      setRatesLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not calculate shipping.')
    }
  }

  async function handleSelectRate(rateId: string) {
    setError(null)
    try {
      await selectShipping(rateId)
    } catch {
      setError('Could not select that shipping method.')
    }
  }

  function validate(): string | null {
    if (!email.trim() || !email.includes('@')) {
      return 'Enter a valid email address.'
    }
    const required: StoreAddress[] = shipSame ? [billing] : [billing, shipping]
    for (const a of required) {
      if (!a.first_name || !a.last_name || !a.address_1 || !a.city || !a.postcode || !a.country) {
        return 'Please complete all required address fields.'
      }
    }
    if (cart?.needs_shipping && !selectedRate) {
      return 'Please calculate and select a shipping method.'
    }
    return null
  }

  async function handlePlaceOrder() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const billingWithContact: StoreAddress = { ...billing, email: email.trim() }
      let paymentMethod = STRIPE_CARD_METHOD
      let paymentData: PaymentDataItem[] = []

      if (method === 'card') {
        if (!stripe || !elements) {
          setError('Payment form is still loading. Please wait a moment and try again.')
          setSubmitting(false)
          return
        }
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          setError('Card field not found.')
          setSubmitting(false)
          return
        }
        const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: `${billing.first_name} ${billing.last_name}`.trim(),
            email: email.trim(),
          },
        })
        if (pmError || !pm) {
          setError(pmError?.message ?? 'Your card could not be validated.')
          setSubmitting(false)
          return
        }
        paymentMethod = STRIPE_CARD_METHOD
        paymentData = buildStripePaymentData(pm.id)
      } else {
        // iDEAL — redirect-based; geen kaartvelden, payment_data leeg.
        paymentMethod = STRIPE_IDEAL_METHOD
        paymentData = []
      }

      const result = await submitCheckout({
        billing_address: billingWithContact,
        shipping_address: { ...shipAddr },
        payment_method: paymentMethod,
        payment_data: paymentData,
      })

      rememberOrderEmail(result.order_id, email.trim())

      const redirectUrl = result.payment_result?.redirect_url
      const status = result.payment_result?.payment_status

      if (redirectUrl) {
        // 3DS / iDEAL / andere redirect-gateways.
        window.location.href = redirectUrl
        return
      }
      if (status === 'success' || status === 'pending') {
        router.push(
          `/order-confirmation/${result.order_id}?key=${encodeURIComponent(result.order_key)}`,
        )
        return
      }
      setError('The payment could not be completed. Please try another method.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <p className="checkout-empty">
        Your cart is empty. <a href="/books">Browse books</a>.
      </p>
    )
  }

  return (
    <div className="checkout-layout">
      <div className="checkout-main">
        {/* Contact */}
        <section className="checkout-section">
          <h2 className="checkout-section-head">Contact</h2>
          <div className="addr-field addr-field-wide">
            <label htmlFor="checkout-email">Email *</label>
            <input
              id="checkout-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
        </section>

        {/* Billing */}
        <section className="checkout-section">
          <h2 className="checkout-section-head">Billing address</h2>
          <AddressFields value={billing} onChange={setBilling} idPrefix="billing" />
          <label className="checkout-checkbox">
            <input
              type="checkbox"
              checked={shipSame}
              onChange={(e) => setShipSame(e.target.checked)}
            />
            Ship to the same address
          </label>
        </section>

        {/* Shipping address */}
        {!shipSame && (
          <section className="checkout-section">
            <h2 className="checkout-section-head">Shipping address</h2>
            <AddressFields value={shipping} onChange={setShipping} idPrefix="shipping" />
          </section>
        )}

        {/* Shipping method */}
        {cart.needs_shipping && (
          <section className="checkout-section">
            <h2 className="checkout-section-head">Shipping method</h2>
            <button
              type="button"
              className="checkout-secondary-btn"
              onClick={handleCalculateShipping}
              disabled={loading}
            >
              {loading ? 'Calculating…' : 'Calculate shipping'}
            </button>

            {ratesLoaded && rates.length === 0 && (
              <p className="checkout-hint">No shipping rates for this address.</p>
            )}

            {rates.length > 0 && (
              <div className="checkout-rates">
                {rates.map((r) => (
                  <label key={r.rate_id} className="checkout-rate">
                    <input
                      type="radio"
                      name="shipping-rate"
                      checked={r.selected}
                      onChange={() => handleSelectRate(r.rate_id)}
                      disabled={loading}
                    />
                    <span className="checkout-rate-name">{r.name}</span>
                    <span className="checkout-rate-price">
                      {money(r.price)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Payment */}
        <section className="checkout-section">
          <h2 className="checkout-section-head">Payment</h2>
          <div className="checkout-methods">
            <label className="checkout-method">
              <input
                type="radio"
                name="pay-method"
                checked={method === 'card'}
                onChange={() => setMethod('card')}
              />
              Credit or debit card
            </label>
            <label className="checkout-method">
              <input
                type="radio"
                name="pay-method"
                checked={method === 'ideal'}
                onChange={() => setMethod('ideal')}
              />
              iDEAL
            </label>
          </div>

          {method === 'card' && (
            <div className="checkout-card-element">
              <CardElement options={CARD_OPTIONS} />
            </div>
          )}
          {method === 'ideal' && (
            <p className="checkout-hint">
              You&apos;ll be redirected to your bank to approve the payment.
            </p>
          )}
        </section>

        {error && (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="checkout-place-btn"
          onClick={handlePlaceOrder}
          disabled={submitting || loading}
        >
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </div>

      {/* Summary */}
      <aside className="checkout-summary">
        <h2 className="cart-summary-head">Order summary</h2>
        <div className="checkout-summary-items">
          {cart.items.map((item) => (
            <div key={item.key} className="checkout-summary-item">
              <span className="checkout-summary-qty">{item.quantity}×</span>
              <span className="checkout-summary-name">{item.name}</span>
              <span className="checkout-summary-amount">
                {money(item.totals.line_total)}
              </span>
            </div>
          ))}
        </div>

        <dl className="cart-totals">
          <div className="cart-totals-row">
            <dt>Subtotal</dt>
            <dd>{money(cart.totals.total_items)}</dd>
          </div>
          {storeMinorToNumber(cart.totals.total_discount, minor) > 0 && (
            <div className="cart-totals-row">
              <dt>Discount</dt>
              <dd>−{money(cart.totals.total_discount)}</dd>
            </div>
          )}
          {cart.needs_shipping && (
            <div className="cart-totals-row">
              <dt>Shipping</dt>
              <dd>
                {selectedRate ? money(cart.totals.total_shipping) : '—'}
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
      </aside>
    </div>
  )
}
