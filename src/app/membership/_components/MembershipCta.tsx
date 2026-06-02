'use client'

/**
 * MembershipCta — auth-bewuste CTA voor de publieke /membership-pagina.
 *
 * Drie toestanden (de twee varianten die Jeroen benoemde + de al-Insider-case):
 *  1. Niet ingelogd        → "Become an Insider" → /register?next=/membership.
 *                            Account aanmaken eerst; daarna landt de bezoeker
 *                            terug op deze pagina om de subscribe-stap te doen.
 *  2. Ingelogd, gratis      → "Become an Insider" → checkout-route.
 *  3. Al Insider            → geen upsell, bevestigende state.
 *
 * De checkout-route (`INSIDER_CHECKOUT_HREF`) is gebouwd in P2 (handoff S12 §3):
 * `/checkout` start de Stripe-subscribe server-side. Als één constante zodat het
 * pad op één plek aanpasbaar blijft.
 *
 * Prijs/periode komen uit `membership.ts` (INSIDER_PRICING) — nooit hardcoded.
 */

import { Button } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'
import { INSIDER_PRICING } from '@/lib/config/membership'

/** Checkout-route — start de Insider-subscribe (zie src/app/checkout/page.tsx). */
const INSIDER_CHECKOUT_HREF = '/checkout?plan=insider'
const REGISTER_HREF = '/register?next=/membership'

export function MembershipCta() {
  const { isLoggedIn, isMember } = useAuth()

  // 3 — al Insider: geen upsell tonen.
  if (isMember) {
    return (
      <div className="mkt-cta">
        <span className="mkt-cta-member" aria-label="You are an Insider">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline
              points="20 6 9 17 4 12"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
          You&rsquo;re an Insider — you have full access.
        </span>
        <Button as="link" href="/materials" variant="outline" size="lg">
          Explore materials
        </Button>
      </div>
    )
  }

  // 1 & 2 — niet ingelogd vs. ingelogd-gratis: ander doel, zelfde label.
  const href = isLoggedIn ? INSIDER_CHECKOUT_HREF : REGISTER_HREF
  const label = `Become an Insider — €${INSIDER_PRICING.monthly.amount}/month`

  return (
    <div className="mkt-cta">
      <Button as="link" href={href} variant="insider" size="lg">
        {label}
      </Button>
      <span className="mkt-cta-sub">
        {isLoggedIn
          ? 'Cancel anytime · no commitment.'
          : 'Free account first — then unlock Insider whenever you like.'}
      </span>
    </div>
  )
}
