'use client'

/**
 * CheckoutForm — de volledige afrekenflow (client). Draait binnen <Elements>
 * (zie CheckoutView), zodat de Stripe-card-velden werken.
 *
 * Stappen:
 *  1. Contact (e-mail) + factuuradres (+ optioneel apart verzendadres).
 *  2. Verzendkosten worden AUTOMATISCH berekend zodra land + postcode bekend
 *     zijn (gedebounced `update-customer` → verzendtarieven). Het goedkoopste
 *     tarief wordt vanzelf geselecteerd; de bezoeker kan wisselen bij meerdere.
 *     Totalen komen uit de mand-response.
 *  3. Betaling: Stripe-kaart (CardElement) of iDEAL (Payment Element + redirect).
 *  4. `POST /checkout`. Bij `redirect_url` (3DS/iDEAL) → doorsturen; anders bij
 *     success/pending → /order-confirmation/{id}?key=…
 *
 * iDEAL gebruikt dezelfde deferred-intent `payment_data` als kaart, maar met een
 * PaymentMethod uit Stripe's Payment Element (bankkeuze).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { checkCheckoutEmail, checkCheckoutVat } from '@/lib/api/checkout-account'
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
import { freeShippingRemaining } from '@/lib/config/shipping-thresholds'
import { AddressFields } from './AddressFields'
import { Input } from '@/components/ui/form'
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
  const [vatNumber, setVatNumber] = useState(prefill?.vatNumber ?? '')
  const [vatStatus, setVatStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [vatError, setVatError] = useState<string | null>(null)
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

  // Auto-shipping: adres compleet genoeg om tarieven te berekenen?
  const shipComplete = Boolean(shipAddr.country && shipAddr.postcode.trim())
  const shipKey = `${shipAddr.country}|${normalizePostcode(shipAddr.country, shipAddr.postcode)}|${shipAddr.city}|${shipAddr.address_1}`
  const ratesKey = rates.map((r) => r.rate_id).join('|')
  const selectedRateId = selectedRate?.rate_id ?? ''
  const lastShipKeyRef = useRef('')

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

  useEffect(() => {
    const trimmedVat = vatNumber.trim()
    if (!trimmedVat) {
      setVatStatus('idle')
      setVatError(null)
      return
    }
    if (!billing.country) {
      setVatStatus('idle')
      setVatError(null)
      return
    }

    const normalizedVat = trimmedVat.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const vatPrefix = normalizedVat.slice(0, 2)
    if (/^[A-Z]{2}$/.test(vatPrefix) && vatPrefix !== billing.country.toUpperCase()) {
      setVatStatus('invalid')
      setVatError('VAT country prefix does not match the selected billing country.')
      return
    }

    const timer = window.setTimeout(async () => {
      setVatStatus('checking')
      setVatError(null)
      try {
        const result = await checkCheckoutVat(billing.country, trimmedVat)
        if (result.is_valid) {
          setVatStatus('valid')
          setVatError(null)
        } else {
          setVatStatus('invalid')
          if (result.status === 'invalid') {
            setVatError('VAT number not recognized by VIES.')
          } else if (result.status === 'unreachable') {
            setVatError('Could not verify VAT right now. Please try again.')
          } else if (result.status === 'non_eu') {
            setVatError('VAT validation via VIES is only available for EU countries.')
          } else {
            setVatError('VAT number could not be validated.')
          }
        }
      } catch {
        setVatStatus('invalid')
        setVatError('Could not verify VAT right now. Please try again.')
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [vatNumber, billing.country])

  // Bereken verzendtarieven automatisch zodra land + postcode ingevuld zijn
  // (gedebounced). shipKey is de stabiele trigger; ref voorkomt herhaling.
  useEffect(() => {
    if (!cart?.needs_shipping || !shipComplete) return
    if (shipKey === lastShipKeyRef.current) return
    const handle = window.setTimeout(() => {
      setError(null)
      setCustomer(withNormalizedPostcode(shipAddr), withNormalizedPostcode(billing))
        .then(() => {
          lastShipKeyRef.current = shipKey
          setRatesLoaded(true)
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : 'Could not calculate shipping.'),
        )
    }, 600)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipKey, shipComplete, cart?.needs_shipping])

  // Selecteer automatisch het goedkoopste tarief zodra de tarieven binnen zijn
  // en er nog niets gekozen is. De loading-guard voorkomt dubbele calls.
  useEffect(() => {
    if (!cart?.needs_shipping || loading) return
    if (rates.length === 0 || selectedRateId) return
    const cheapest = [...rates].sort((a, b) => Number(a.price) - Number(b.price))[0]
    if (cheapest) {
      void selectShipping(cheapest.rate_id).catch(() =>
        setError('Could not select that shipping method.'),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratesKey, selectedRateId, loading, cart?.needs_shipping])

  async function handleCheckoutSignedIn(data: { email: string; billing: StoreAddress; vatNumber?: string }) {
    setEmail(data.email)
    setBilling(data.billing)
    setVatNumber(data.vatNumber ?? '')
    setEmailRegistered(null)
    setRatesLoaded(false)
    try {
      await refresh()
    } catch {
      /* cart may still render from prior state */
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
        paymentData = buildStripePaymentData(
          pm.id,
          STRIPE_CARD_METHOD,
          billingWithContact,
          vatNumber,
        )
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
        // Store API: betaling loopt via de hoofd-gateway `stripe`; iDEAL-type zit in
        // payment_data (split UPE-gateway `stripe_ideal` wordt server-side niet verwerkt).
        paymentMethod = STRIPE_CARD_METHOD
        paymentData = buildStripePaymentData(
          pm.id,
          STRIPE_IDEAL_METHOD,
          billingWithContact,
          vatNumber,
        )
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

        try {
          const finalUrl = await resolveStripeCheckoutRedirect(stripe, redirectUrl, {
            fallbackReturnUrl: `${window.location.origin}${confirmationUrl}`,
          })
          setPlaced(true)
          clearCart()
          window.location.href = finalUrl
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Payment confirmation failed. Your order was created — check your email for next steps.',
          )
        }
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
        Your cart is empty. <a href="/book">Browse books</a>.
      </p>
    )
  }

  const moneyN = (v?: string, unit = minor) => storeMinorToNumber(v, unit)
  const subtotalIncl =
    moneyN(cart.totals.total_items) + moneyN(cart.totals.total_items_tax)
  // Ex-btw weergave (prijzen ex btw; btw als aparte regel — punt 1).
  const subtotalEx = moneyN(cart.totals.total_items)
  const shippingEx = moneyN(cart.totals.total_shipping)
  const summaryTax = moneyN(cart.totals.total_tax)
  const freeShipRemaining = cart.needs_shipping
    ? freeShippingRemaining(billing.country, subtotalIncl)
    : 0

  return (
    <div className="checkout-layout">
      <div className="checkout-main">
        {freeShipRemaining > 0 && (
          <div className="cart-freeship" role="status">
            Spend <strong>{formatEur(freeShipRemaining)}</strong> more for free
            shipping!
          </div>
        )}

        {/* Contact */}
        <section className="checkout-section">
          <h2 className="checkout-section-head">Contact</h2>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            readOnly={isLoggedIn}
          />
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
          <AddressFields
            value={billing}
            onChange={setBilling}
            idPrefix="billing"
            vatNumber={vatNumber}
            onVatNumberChange={setVatNumber}
            vatStatus={vatStatus}
            vatErrorMessage={vatError}
          />
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

        {/* Shipping method — automatisch berekend op land + postcode */}
        {cart.needs_shipping && (
          <section className="checkout-section">
            <h2 className="checkout-section-head">Shipping method</h2>

            {!shipComplete ? (
              <p className="checkout-hint">
                Enter your address to calculate shipping.
              </p>
            ) : loading && rates.length === 0 ? (
              <p className="checkout-hint">Calculating shipping…</p>
            ) : ratesLoaded && rates.length === 0 ? (
              <p className="checkout-hint">No shipping rates for this address.</p>
            ) : null}

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
                {formatEur(
                  moneyN(item.totals.line_subtotal, item.prices.currency_minor_unit),
                )}
              </span>
            </div>
          ))}
        </div>

        <dl className="cart-totals">
          <div className="cart-totals-row">
            <dt>Subtotal</dt>
            <dd>{formatEur(subtotalEx)}</dd>
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
                {selectedRate ? formatEur(shippingEx) : '—'}
              </dd>
            </div>
          )}
          {summaryTax > 0 && (
            <div className="cart-totals-row">
              <dt>VAT</dt>
              <dd>{formatEur(summaryTax)}</dd>
            </div>
          )}
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
