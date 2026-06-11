/**
 * Stripe.js loader — singleton.
 *
 * Laadt Stripe.js één keer met de **publishable** test-key uit
 * `NEXT_PUBLIC_STRIPE_PK` (browser-safe). Geeft `null` als de key ontbreekt,
 * zodat de checkout netjes degradeert i.p.v. te crashen.
 *
 * Vereist de dependency `@stripe/stripe-js` (+ `@stripe/react-stripe-js` voor
 * de Elements-componenten). Zie MANIFEST.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PK
    stripePromise = pk ? loadStripe(pk) : Promise.resolve(null)
  }
  return stripePromise
}
