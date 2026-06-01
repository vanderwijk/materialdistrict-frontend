'use client'

/**
 * PartnerCta — auth-bewuste CTA voor de publieke /become-a-partner-pagina.
 *
 * Drie toestanden:
 *  1. Niet ingelogd            → "Become a partner" → /register?next=…
 *  2. Ingelogd, beheert geen brand → "Become a partner" → /register?next=…
 *                                    (brand-claim/aanmaak is Fase 2)
 *  3. Beheert al een brand     → "Manage your membership" → /dashboard
 *
 * VOORUIT-LOPEND:
 *  - De register-audience-toggle ("List your materials") bestaat in de
 *    live-build nog niet; de link gaat naar /register en wordt later
 *    voorgeselecteerd op manufacturer zodra die toggle landt.
 *  - /dashboard is Fase 2 en bestaat nog niet; bewust vooruit-lopend
 *    gelinkt (zelfde aanpak als de footer-links).
 */

import { Button } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'
import { getHighestBrandTier } from '@/lib/auth/user-helpers'

const REGISTER_HREF = '/register?next=/become-a-partner'
const DASHBOARD_HREF = '/dashboard'

export function PartnerCta() {
  const { user } = useAuth()
  const managesBrand = getHighestBrandTier(user) !== null

  if (managesBrand) {
    return (
      <div className="mkt-cta">
        <Button as="link" href={DASHBOARD_HREF} variant="primary" size="lg">
          Manage your membership
        </Button>
        <span className="mkt-cta-sub">Change your tier or add materials in your dashboard.</span>
      </div>
    )
  }

  return (
    <div className="mkt-cta">
      <Button as="link" href={REGISTER_HREF} variant="primary" size="lg">
        Become a partner
      </Button>
      <span className="mkt-cta-sub">List your brand for free — upgrade to publish materials whenever you&rsquo;re ready.</span>
    </div>
  )
}
