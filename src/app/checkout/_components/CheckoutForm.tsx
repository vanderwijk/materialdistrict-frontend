'use client'

/**
 * CheckoutForm — de volledige afrekenflow (client). Draait binnen <Elements>
 * (zie CheckoutView), zodat de Stripe-card-velden werken.
 *
 * Stappen:
 *  1. Contact (e-mail) + factuuradres (+ optioneel apart verzendadres).
 *  2. "Calculate shipping" → `update-customer` → verzendtarieven → keuze →
 *     `select-shipping-rate`. Totalen komen uit de mand-response.
 *  3. Betaling: Stripe-kaart (CardElement) of iDEAL (Payment Element + redirect).
 *  4. `POST /checkout`. Bij `redirect_url` (3DS/iDEAL) → doorsturen; anders bij
 *     success/pending → /order-confirmation/{id}?key=…
 *
 * iDEAL gebruikt dezelfde deferred-intent `payment_data` als kaart, maar met een
 * PaymentMethod uit Stripe's Payment Element (bankkeuze).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CardElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { useAuth } from '@/components/providers/AuthContext'
import { useCart } from '@/components/providers/CartContext'
import { storeMinorToNumber, type StoreAddress } from '@/lib/api/cart'
import { checkCheckoutEmail } from '@/lib/api/checkout-account'
import {
  buildStripePaymentData,
  isSupportedCheckoutPaymentMethod,
  paymentMethodLabel,
  rememberOrderEmail,
  submitCheckout,
  STRIPE_CARD_METHOD,
  STRIPE_IDEAL_METHOD,
  type PaymentDataItem,
} from '@/lib/api/checkout'
import type { CheckoutPrefill } from '@/lib/checkout/profile-prefill'
import { resolveStripeCheckoutRedirect } from '@/lib/stripe/confirm-redirect'
import { getStripe } from '@/lib/stripe/client'
import { formatEur } from '@/lib/utils/format-price'
import { AddressFields } from './AddressFields'
import { CheckoutSignInPanel } from './CheckoutSignInPanel'

const stripePromise = getStripe()

type PayMethod = 'card' | 'ideal'

function payMethodFromGatewayId(id: string): PayMethod | null {
  if (id === STRIPE_CARD_METHOD) return 'card'
  if (id === STRIPE_IDEAL_METHOD) return 'ideal'
  return null
}

function gatewayIdFromPayMethod(method: PayMethod): string {
  return method === 'ideal' ? STRIPE_IDEAL_METHOD : STRIPE_CARD_METHOD
}

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
  // Checkout-fix: verberg Stripe's eigen postcodeveld. De postcode komt uit
  // het adresformulier; dit voorkomt het dubbele veld én de losse Stripe-
  // melding "Postcode is onvolledig" wanneer dat tweede veld leeg blijft.
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '15px',
      color: '#1a1a1a',
      '::placeholder': { color: '#9a9a9a' },
    },
  },
}

/**
 * Postcode-normalisatie vóór verzending naar Stripe/WooCommerce. NL valideert
 * strikt ("1234 AB"); we canonicaliseren naar 4 cijfers + spatie + 2 hoofd-
 * letters. Andere landen: alleen trimmen (uiteenlopende formats, niet forceren).
 */
function normalizePostcode(country: string, postcode: string): string {
  const trimmed = postcode.trim()
  if (country === 'NL') {
    const m = /^(\d{4})\s*([A-Za-z]{2})$/.exec(trimmed)
    if (m) return `${m[1]} ${m[2].toUpperCase()}`
  }
  return trimmed
}

function withNormalizedPostcode(addr: StoreAddress): StoreAddress {
  return { ...addr, postcode: normalizePostcode(addr.country, addr.postcode) }
}

interface CheckoutFormProps {
  prefill?: CheckoutPrefill | null
}

export function CheckoutForm({ prefill }: CheckoutFormProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { cart, setCustomer, selectShipping, loading, initialized, clearCart, refresh } = useCart()

  const [email, setEmail] = useState(prefill?.email ?? '')
  const [billing, setBilling] = useState<StoreAddress>(prefill?.billing ?? EMPTY_ADDRESS)
  const [emailRegistered, setEmailRegistered] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [shipSame, setShipSame] = useState(true)
  const [shipping, setShipping] = useState<StoreAddress>(EMPTY_ADDRESS)
  const [ratesLoaded, setRatesLoaded] = useState(false)
  const [method, setMethod] = useState<PayMethod>('card')
  const [submitting, setSubmitting] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeRef, setStripeRef] = useState<ReturnType<typeof useStripe>>(null)
  const [elementsRef, setElementsRef] = useState<ReturnType<typeof useElements>>(null)

  const handleStripeReady = useCallback(
    (stripe: ReturnType<typeof useStripe>, elements: ReturnType<typeof useElements>) => {
      setStripeRef(stripe)
      setElementsRef(elements)
    },
    [],
  )

  const idealElementsOptions = useMemo((): StripeElementsOptions | undefined => {
    if (!cart?.totals.total_price) return undefined
    const amount = Number(cart.totals.total_price)
    if (!Number.isFinite(amount) || amount < 1) return undefined
    return {
      mode: 'payment',
      amount,
      currency: (cart.totals.currency_code ?? 'EUR').toLowerCase(),
      paymentMethodTypes: ['ideal'],
      paymentMethodCreation: 'manual',
    }
  }, [cart?.totals.total_price, cart?.totals.currency_code])

  const shipAddr = shipSame ? billing : shipping
  const minor = cart?.totals.currency_minor_unit ?? 2
  const money = (v?: string) => formatEur(storeMinorToNumber(v, minor))

  const rates = cart?.shipping_rates?.[0]?.shipping_rates ?? []
  const selectedRate = rates.find((r) => r.selected)

  const availablePaymentMethods = useMemo(
    () => (cart?.payment_methods ?? []).filter(isSupportedCheckoutPaymentMethod),
    [cart?.payment_methods],
  )
  const availablePayMethods = useMemo(
    () =>
      availablePaymentMethods
        .map((id) => payMethodFromGatewayId(id))
        .filter((m): m is PayMethod => m !== null),
    [availablePaymentMethods],
  )
  const availablePayMethodsKey = availablePayMethods.join(',')

  useEffect(() => {
    setStripeRef(null)
    setElementsRef(null)
  }, [method])

  useEffect(() => {
    if (availablePayMethods.length === 0) return
    if (!availablePayMethods.includes(method)) {
      setMethod(availablePayMethods[0])
    }
  }, [availablePayMethodsKey, availablePayMethods, method])

  useEffect(() => {
    if (isLoggedIn) {
      setEmailRegistered(null)
      return
    }

    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setEmailRegistered(null)
      return
    }

    const timer = window.setTimeout(async () => {
      setCheckingEmail(true)
      try {
        const status = await checkCheckoutEmail(trimmed)
        setEmailRegistered(status.registered)
      } catch {
        setEmailRegistered(null)
      } finally {
        setCheckingEmail(false)
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [email, isLoggedIn])

  async function handleCheckoutSignedIn(data: { email: string; billing: StoreAddress }) {
    setEmail(data.email)
    setBilling(data.billing)
    setEmailRegistered(null)
    setRatesLoaded(false)
    try {
      await refresh()
    } catch {
      /* cart may still render from prior state */
    }
  }

  async function handleCalculateShipping() {
    setError(null)
    try {
      await setCustomer(withNormalizedPostcode(shipAddr), withNormalizedPostcode(billing))
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
      const normBilling = withNormalizedPostcode(billing)
      const billingWithContact: StoreAddress = { ...normBilling, email: email.trim() }
      const normShipping = withNormalizedPostcode(shipAddr)

      // Zorg dat WC de klant (incl. billing country) kent vóór gateway-beschikbaarheid.
      await setCustomer(normShipping, billingWithContact)

      const paymentGatewayId = gatewayIdFromPayMethod(method)
      if (!availablePaymentMethods.includes(paymentGatewayId)) {
        setError('That payment method is not available for this order. Please choose another option.')
        setSubmitting(false)
        return
      }

      let paymentMethod = paymentGatewayId
      let paymentData: PaymentDataItem[] = []

      if (method === 'card') {
        const stripe = stripeRef
        const elements = elementsRef
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
            name: `${normBilling.first_name} ${normBilling.last_name}`.trim(),
            email: email.trim(),
            // Volledig factuuradres mee → Stripe valideert de postcode tegen
            // het ingevulde adres i.p.v. een los (verborgen) CardElement-veld.
            address: {
              line1: normBilling.address_1,
              line2: normBilling.address_2 || undefined,
              city: normBilling.city,
              state: normBilling.state || undefined,
              postal_code: normBilling.postcode,
              country: normBilling.country,
            },
          },
        })
        if (pmError || !pm) {
          setError(pmError?.message ?? 'Your card could not be validated.')
          setSubmitting(false)
          return
        }
        paymentMethod = STRIPE_CARD_METHOD
        paymentData = buildStripePaymentData(pm.id, STRIPE_CARD_METHOD, billingWithContact)
      } else {
        const stripe = stripeRef
        const elements = elementsRef
        if (!stripe || !elements) {
          setError('Payment form is still loading. Please wait a moment and try again.')
          setSubmitting(false)
          return
        }
        const submitResult = await elements.submit()
        if (submitResult.error) {
          setError(submitResult.error.message ?? 'Please complete the iDEAL payment details.')
          setSubmitting(false)
          return
        }
        const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
          elements,
          params: {
            billing_details: {
              name: `${normBilling.first_name} ${normBilling.last_name}`.trim(),
              email: email.trim(),
              address: {
                line1: normBilling.address_1,
                line2: normBilling.address_2 || undefined,
                city: normBilling.city,
                state: normBilling.state || undefined,
                postal_code: normBilling.postcode,
                country: normBilling.country,
              },
            },
          },
        })
        if (pmError || !pm) {
          setError(pmError?.message ?? 'iDEAL payment could not be validated.')
          setSubmitting(false)
          return
        }
        paymentMethod = STRIPE_IDEAL_METHOD
        paymentData = buildStripePaymentData(pm.id, STRIPE_IDEAL_METHOD, billingWithContact)
      }

      const result = await submitCheckout({
        billing_address: billingWithContact,
        shipping_address: normShipping,
        payment_method: paymentMethod,
        payment_data: paymentData,
      })

      rememberOrderEmail(result.order_id, email.trim())

      const redirectUrl = result.payment_result?.redirect_url
      const status = result.payment_result?.payment_status
      const confirmationUrl =
        `/order-confirmation/${result.order_id}` +
        `?key=${encodeURIComponent(result.order_key)}`

      if (redirectUrl) {
        // 3DS / iDEAL: WC retourneert een bank-URL of een #wc-stripe-confirm-pi-hash
        // die client-side confirmPayment vereist (zelfde flow als block-checkout).
        const stripe = stripeRef
        if (!stripe) {
          setError('Payment form is still loading. Please wait a moment and try again.')
          setSubmitting(false)
          return
        }

        setPlaced(true)
        clearCart()

        const finalUrl = await resolveStripeCheckoutRedirect(stripe, redirectUrl, {
          fallbackReturnUrl: `${window.location.origin}${confirmationUrl}`,
        })
        window.location.href = finalUrl
        return
      }
      if (status === 'success' || status === 'pending') {
        setPlaced(true)
        clearCart()
        router.push(confirmationUrl)
        return
      }
      const detail = result.payment_result?.payment_details
        ?.map((item) => item.value)
        .filter(Boolean)
        .join(' ')
      setError(
        detail || 'The payment could not be completed. Please try another method.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Order net geplaatst → navigatie loopt; toon geen "leeg"-flits.
  if (placed) {
    return <p className="checkout-empty">Order placed — redirecting…</p>
  }

  // Nog aan het initialiseren (mand-fetch in flight) → toon geen "leeg".
  if (!initialized) {
    return <p className="checkout-empty">Loading your cart…</p>
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
              readOnly={isLoggedIn}
            />
          </div>
          {checkingEmail && !isLoggedIn && (
            <p className="checkout-hint">Checking email…</p>
          )}
          {emailRegistered && !isLoggedIn && (
            <CheckoutSignInPanel email={email.trim()} onSignedIn={handleCheckoutSignedIn} />
          )}
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
          {availablePayMethods.length === 0 ? (
            <p className="checkout-hint">
              No payment methods are available yet. Enter your address and calculate shipping if
              needed, then try again.
            </p>
          ) : (
            <div className="checkout-methods">
              {availablePaymentMethods.map((id) => {
                const payMethod = payMethodFromGatewayId(id)
                if (!payMethod) return null
                return (
                  <label key={id} className="checkout-method">
                    <input
                      type="radio"
                      name="pay-method"
                      checked={method === payMethod}
                      onChange={() => setMethod(payMethod)}
                    />
                    {paymentMethodLabel(id)}
                  </label>
                )
              })}
            </div>
          )}

          {method === 'card' && availablePayMethods.includes('card') && (
            <Elements stripe={stripePromise}>
              <StripeBridge onReady={handleStripeReady} />
              <div className="checkout-card-element">
                <CardElement options={CARD_OPTIONS} />
              </div>
            </Elements>
          )}
          {method === 'ideal' && availablePayMethods.includes('ideal') && idealElementsOptions && (
            <Elements stripe={stripePromise} options={idealElementsOptions}>
              <StripeBridge onReady={handleStripeReady} />
              <div className="checkout-ideal-element">
                <PaymentElement options={{ layout: 'tabs' }} />
                <p className="checkout-hint">
                  Choose your bank — you&apos;ll be redirected to approve the payment.
                </p>
              </div>
            </Elements>
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
          disabled={submitting || loading || availablePayMethods.length === 0}
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

/** Publiceert stripe/elements naar de parent (buiten nested Elements-context). */
function StripeBridge({
  onReady,
}: {
  onReady: (stripe: ReturnType<typeof useStripe>, elements: ReturnType<typeof useElements>) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    onReady(stripe, elements)
  }, [stripe, elements, onReady])

  return null
}
