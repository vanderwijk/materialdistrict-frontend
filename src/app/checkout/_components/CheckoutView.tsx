'use client'

/**
 * CheckoutView — Stripe-Elements-wrapper rond het checkout-formulier.
 * Elements heeft alleen de Stripe-promise nodig voor de losse CardElement
 * (geen clientSecret: we maken client-side een PaymentMethod en sturen die
 * via `POST /checkout` door).
 */

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import type { CheckoutPrefill } from '@/lib/checkout/profile-prefill'
import { CheckoutForm } from './CheckoutForm'

const stripePromise = getStripe()

interface CheckoutViewProps {
  prefill: CheckoutPrefill | null
}

export function CheckoutView({ prefill }: CheckoutViewProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm key={prefill?.email ?? 'guest'} prefill={prefill} />
    </Elements>
  )
}
