'use client'

/**
 * TalkDetailSidebar
 * ----------------------------------------------------------------------
 * Sticky sidebar voor de talk-detailpagina, conform de mockup-aside: een
 * "Talk details"-card (speaker(s), company, date, duration) + een Insider-
 * upsell (niet-member) of volledige-toegang-card (member), met een
 * "All talks"-link.
 *
 * Sessie 7. Client-component omdat de upsell van `useAuth().isMember`
 * afhangt. Speakers = namen (C11; role/photo vervallen); company = platte
 * tekst zonder brand-link (C12). Rijen zonder waarde worden overgeslagen
 * (frontend-fallback, geen lege key/value-regels). Hergebruikt de gedeelde
 * `article-detail-sidebar` / `article-side-*`-CSS.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { Button } from '@/components/ui'

export interface TalkDetailSidebarProps {
  speakerNames: string[]
  companyName: string | null
  dateLabel: string
  durationLabel: string | null
}

export function TalkDetailSidebar({
  speakerNames,
  companyName,
  dateLabel,
  durationLabel,
}: TalkDetailSidebarProps) {
  const { isMember } = useAuth()

  const rows: Array<{ label: string; value: string }> = []
  if (speakerNames.length > 0) {
    rows.push({
      label: speakerNames.length === 1 ? 'Speaker' : 'Speakers',
      value: speakerNames.join(', '),
    })
  }
  if (companyName) rows.push({ label: 'Company', value: companyName })
  rows.push({ label: 'Date', value: dateLabel })
  if (durationLabel) rows.push({ label: 'Duration', value: durationLabel })

  return (
    <aside className="article-detail-sidebar">
      {/* Talk details */}
      <div className="article-side-card">
        <div className="article-side-eyebrow">Talk details</div>
        {rows.map((row) => (
          <div key={row.label} className="talk-meta-row">
            <span className="talk-meta-row-key">{row.label}</span>
            <span className="talk-meta-row-value">{row.value}</span>
          </div>
        ))}
      </div>

      {!isMember ? (
        /* Insider upsell — niet-members */
        <div className="article-side-upsell">
          <div className="article-side-upsell-eyebrow">Unlock all talks</div>
          <div className="article-side-upsell-title">Watch every recording</div>
          <p className="article-side-upsell-body">
            Insiders watch every talk, read every in-depth article, get
            quarterly trend reports and 1 free event entry per year.
          </p>
          <Button
            as="link"
            href="/membership"
            variant="insider"
            size="sm"
            className="article-side-upsell-btn"
          >
            Become an Insider — €10/mo
          </Button>
        </div>
      ) : (
        /* Member — volledige toegang */
        <div className="article-side-card">
          <div className="talk-side-access">You have full access ✓</div>
          <p className="talk-side-access-body">
            All talks are unlocked for Insiders.
          </p>
          <Button as="link" href="/talks" variant="outline" size="sm">
            All talks →
          </Button>
        </div>
      )}
    </aside>
  )
}
