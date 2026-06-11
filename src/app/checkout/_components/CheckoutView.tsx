'use client'

/**
 * CheckoutView — Stripe-Elements-wrapper rond het checkout-formulier.
 * Elements heeft alleen de Stripe-promise nodig voor de losse CardElement
 * (geen clientSecret: we maken client-side een PaymentMethod en sturen die
 * via `POST /checkout` door).
 */

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { CheckoutForm } from './CheckoutForm'

const stripePromise = getStripe()

export function CheckoutView() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
