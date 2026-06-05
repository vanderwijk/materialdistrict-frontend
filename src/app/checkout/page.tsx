import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createInsiderCheckout, WordPressError } from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'

/**
 * /checkout — start een Insider-abonnement via Stripe (P2, handoff S12 §3).
 * ----------------------------------------------------------------------
 * Server-component, geen UI: leest de query-params + de auth-cookie,
 * roept WordPress server-side aan en redirect naar de Stripe checkout_url.
 * De Stripe-secret komt nooit in de browser — alle WP-calls zijn server-side.
 *
 * Flow:
 *   ?plan=insider[&interval=monthly|annual]
 *   - plan ≠ insider          → /membership
 *   - niet ingelogd           → /sign-in?next=/checkout?plan=insider&interval=…
 *   - ingelogd                → POST /md/v2/checkout/insider → redirect checkout_url
 *   - 401 (token afgewezen)   → /sign-in?next=…
 *   - 409 already subscribed  → /dashboard/membership?checkout=already
 *   - 503 unavailable         → /membership?checkout=unavailable
 *   - overige fout            → /membership?checkout=error
 *
 * Landingspunt van de CTA in src/app/membership/_components/MembershipCta.tsx
 * (`/checkout?plan=insider`).
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// Nooit cachen: triggert een server-side WP-POST en een externe redirect.
export const dynamic = 'force-dynamic'

interface CheckoutPageProps {
  searchParams: Promise<{ plan?: string; interval?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan, interval: rawInterval } = await searchParams

  // v1: alleen het Insider-plan wordt ondersteund.
  if (plan !== 'insider') {
    redirect('/membership')
  }

  const interval: 'monthly' | 'annual' =
    rawInterval === 'annual' ? 'annual' : 'monthly'

  // Pad om naar terug te keren na login (zelfde interval).
  const selfHref = `/checkout?plan=insider&interval=${interval}`
  const signInHref = `/sign-in?next=${encodeURIComponent(selfHref)}`

  const token = await getAuthCookie()
  if (!token) {
    redirect(signInHref)
  }

  // We lossen de checkout-URL op (of een fallback-redirect) ZONDER redirect()
  // binnen de try aan te roepen: redirect() werkt via een interne throw, die
  // anders door onze eigen catch zou worden opgeslokt.
  let checkoutUrl: string | undefined
  try {
    const session = await createInsiderCheckout(token, interval)
    checkoutUrl = session.checkoutUrl
  } catch (err) {
    const status = err instanceof WordPressError ? err.status : 0
    if (status === 401) {
      redirect(signInHref)
    }
    if (status === 409) {
      redirect('/dashboard/membership?checkout=already')
    }
    if (status === 503) {
      redirect('/membership?checkout=unavailable')
    }
    console.error('[checkout] insider checkout failed', err)
    redirect('/membership?checkout=error')
  }

  // Onbereikbaar in de praktijk (de catch redirect altijd), maar houdt de
  // type-checker tevreden en is een veilige fallback.
  if (!checkoutUrl) {
    redirect('/membership?checkout=error')
  }

  redirect(checkoutUrl)
}
