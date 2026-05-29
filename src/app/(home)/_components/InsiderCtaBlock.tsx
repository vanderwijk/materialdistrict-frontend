'use client'

/**
 * InsiderCtaBlock — marketing-CTA voor Insider-membership (sessie 10).
 *
 * Client-component omdat hij verborgen wordt voor actieve Insiders
 * (`useAuth().isMember`) — upsell-pijler: geen upsell tonen aan wie al
 * member is.
 *
 * Bewust GEEN prijs of kortingspercentage hardcoded: alle prijs-/korting-
 * waarden horen in `src/lib/config/membership.ts` (kwaliteitseis 5). Tot die
 * config beschikbaar is, verkoopt deze CTA op waarde en linkt door naar
 * `/membership` voor de details. Het concrete "€x/maand" + "x% korting" wordt
 * hier later uit de config ingehaakt.
 */

import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'

const FEATURES = [
  { title: 'Insider insights', desc: 'Quarterly trend reports' },
  { title: 'Boards', desc: 'Save materials per project' },
  { title: 'Free events', desc: 'Member access to select events' },
  { title: 'Book discount', desc: 'Member price on all books' },
] as const

export function InsiderCtaBlock() {
  const { isMember } = useAuth()
  if (isMember) return null

  return (
    <section className="insider-cta" aria-labelledby="insider-cta-title">
      <div>
        <p className="insider-cta-eyebrow">MaterialDistrict Insider</p>
        <h2 id="insider-cta-title" className="insider-cta-title">
          Become a MaterialDistrict Insider
        </h2>
        <p className="insider-cta-desc">
          In-depth articles, quarterly trend reports, boards and member event
          access — all in one subscription.
        </p>
        <div className="insider-cta-btns">
          <Link href="/membership" className="btn btn-lg btn-insider-solid">
            See Insider benefits
          </Link>
        </div>
      </div>
      <div className="insider-cta-cards">
        {FEATURES.map((f) => (
          <div className="insider-cta-card" key={f.title}>
            <div className="insider-cta-card-title">{f.title}</div>
            <div className="insider-cta-card-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
