'use client'

/**
 * BrandDetailInfoCard
 * ----------------------------------------------------------------------
 * Sidebar-paneel met bedrijfsgegevens op de brand-detail-page. Volgt de
 * mockup `renderBrandDetail()` (sidebar, "Brand details"):
 *
 *   Brand details
 *   ────────────────────────────
 *   Website     materialdistrict…   ← als bekend, klikbare link
 *   Address     …
 *   City        …
 *   Country     …
 *   Founded     1923
 *   Employees   51-200
 *   Materials   12
 *
 * Gating (mockup-conform):
 *  - Anoniem:   het detail-blok is verborgen; toont "Sign in to view
 *               full brand details." + sign-in-knop.
 *  - Ingelogd:  alle ingevulde rijen zichtbaar. Lege velden worden
 *               weggelaten (geen "—"-ruis).
 *
 * Login-required, NIET Insider-only — consistent met sessie 4
 * brand-info-card op material-detail.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { logInteractionEvent } from '@/lib/api/interactions'

export interface BrandDetailInfoCardProps {
  brandSlug: string
  /** Brand-id voor website_click-logging. */
  brandId: number
  website: string | null
  address: string | null
  city: string | null
  country: string | null
  founded: string | null
  employees: string | null
  materialCount: number
}

function displayWebsite(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

interface Row {
  label: string
  value: React.ReactNode
}

export function BrandDetailInfoCard({
  brandSlug,
  brandId,
  website,
  address,
  city,
  country,
  founded,
  employees,
  materialCount,
}: BrandDetailInfoCardProps) {
  const { isLoggedIn } = useAuth()
  const signInHref = `/sign-in?next=${encodeURIComponent(`/brand/${brandSlug}`)}`

  const rows: Row[] = []
  if (website) {
    rows.push({
      label: 'Website',
      value: (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="brand-info-link"
          onClick={() => logInteractionEvent({ type: 'website_click', brandId })}
        >
          {displayWebsite(website)}
        </a>
      ),
    })
  }
  if (address) rows.push({ label: 'Address', value: address })
  if (city) rows.push({ label: 'City', value: city })
  if (country) rows.push({ label: 'Country', value: country })
  if (founded) rows.push({ label: 'Founded', value: founded })
  if (employees) rows.push({ label: 'Employees', value: employees })
  rows.push({ label: 'Materials', value: String(materialCount) })

  return (
    <section className="brand-info-card" aria-labelledby="brand-info-title">
      <h2 id="brand-info-title" className="brand-info-card-head">
        Brand details
      </h2>

      {isLoggedIn ? (
        <dl className="brand-info-rows">
          {rows.map((row) => (
            <div className="brand-info-row" key={row.label}>
              <dt className="brand-info-row-label">{row.label}</dt>
              <dd className="brand-info-row-value">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="brand-info-gated">
          <p className="brand-info-gated-msg">
            Sign in to view full brand details and contact information.
          </p>
          <a href={signInHref} className="brand-info-gated-cta">
            Sign in
          </a>
        </div>
      )}
    </section>
  )
}
