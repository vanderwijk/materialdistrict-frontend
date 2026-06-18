import type { CSSProperties } from 'react'
import {
  MANUFACTURER_PRICING,
  MANUFACTURER_TIER_COLORS,
  canManufacturerAccess,
  getMaterialLimit,
  type ManufacturerTier,
  type ManufacturerFeature,
} from '@/lib/config/membership'
import { UNLIMITED_PUBLICATIONS } from '@/types/shared'
import type { BrandMembership } from '@/types/shared'
import { UpgradeRequestButton } from './UpgradeRequestButton'

const TIERS: ManufacturerTier[] = ['free', 'basis', 'plus', 'partner']
const TIER_LABEL: Record<ManufacturerTier, string> = {
  free: 'Free',
  basis: 'Basis',
  plus: 'Plus',
  partner: 'Partner',
}

const FEATURE_ROWS: ManufacturerFeature[] = [
  'Individual Brand Page',
  'Individual Material Pages',
  'Receive Sample & Info Requests',
  'Access to Statistics',
  'Keywords',
  'PDF & EPD downloads',
  'Geo-based Lead Routing',
  'Featured placement',
  'Exclusive Networking Events',
]

// Review 12.5 — Free-model: deze features zijn voor Free conditioneel; ze worden
// pas zichtbaar/actief zodra de brand minstens één materiaal publiceert. In de
// tabel tonen we ze daarom met een "* met publicatie"-markering, niet als
// onvoorwaardelijk vinkje.
const FREE_CONDITIONAL = new Set<ManufacturerFeature>([
  'Individual Brand Page',
  'Individual Material Pages',
  'Receive Sample & Info Requests',
])

function fmtPrice(amount: number): string {
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function materialsLabel(tier: ManufacturerTier): string {
  const n = getMaterialLimit(tier)
  if (!isFinite(n) || n < 0) return 'Unlimited'
  if (n === 0) return `Pay per material (€${MANUFACTURER_PRICING.free.materialPrice})`
  return `${n} included`
}

/**
 * Brand membership panel. Current tier + publication quota, then a tier
 * comparison table. All prices and the feature matrix come from
 * `membership.ts` — never hardcoded. The active tier column is highlighted.
 */
export function BrandMembershipPanel({ brand }: { brand: BrandMembership }) {
  const quota = brand.publicationQuota
  const unlimited = quota === UNLIMITED_PUBLICATIONS
  const used = brand.publicationsUsed
  const pct = unlimited || quota <= 0 ? 0 : Math.min(100, Math.round((used / quota) * 100))
  const fill = { '--progress': `${pct}%` } as CSSProperties

  return (
    <>
      <div className="dash-panel">
        <h2 className="panel-section-title">Current plan</h2>
        <div className="memb-current">
          <span
            className="badge tier-badge"
            style={{ '--tier-color': MANUFACTURER_TIER_COLORS[brand.tier] } as CSSProperties}
          >
            {TIER_LABEL[brand.tier]}
          </span>
          <span className="field-helper">
            {unlimited
              ? `${used} materials published · unlimited`
              : `${used} of ${quota} materials published`}
          </span>
        </div>
        {!unlimited && quota > 0 && (
          <div className="progress-track memb-quota">
            <div className="progress-fill" style={fill} />
          </div>
        )}
      </div>

      <div className="dash-panel">
        <h2 className="panel-section-title">Compare plans</h2>
        <div className="table-wrap memb-table-wrap">
          <table className="memb-table">
            <thead>
              <tr>
                <th>Feature</th>
                {TIERS.map((t) => (
                  <th key={t} className={t === brand.tier ? 'plan-active-col' : undefined}>
                    {t === brand.tier && <span className="plan-current-tag">Current</span>}
                    <span className="plan-name">{TIER_LABEL[t]}</span>
                    <span className="plan-price">{fmtPrice(MANUFACTURER_PRICING[t].annual)}</span>
                    {MANUFACTURER_PRICING[t].annual > 0 && <small className="plan-per">/year</small>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Materials</td>
                {TIERS.map((t) => (
                  <td key={t} className={t === brand.tier ? 'plan-active-col' : undefined}>
                    {materialsLabel(t)}
                  </td>
                ))}
              </tr>
              {FEATURE_ROWS.map((feature) => (
                <tr key={feature}>
                  <td>{feature}</td>
                  {TIERS.map((t) => {
                    const included = canManufacturerAccess(t, feature)
                    const conditional =
                      t === 'free' && included && FREE_CONDITIONAL.has(feature)
                    return (
                      <td key={t} className={t === brand.tier ? 'plan-active-col' : undefined}>
                        {conditional ? (
                          <span
                            className="memb-cond"
                            aria-label="Included once you publish at least one material"
                          >
                            ✓<sup>*</sup>
                          </span>
                        ) : included ? (
                          <span className="memb-yes" aria-label="Included">✓</span>
                        ) : (
                          <span className="memb-no" aria-label="Not included">–</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="memb-cta-row">
                <td aria-hidden="true"></td>
                {TIERS.map((t) => {
                  const isCurrent = t === brand.tier
                  const isHigher = TIERS.indexOf(t) > TIERS.indexOf(brand.tier)
                  return (
                    <td key={t} className={isCurrent ? 'plan-active-col' : undefined}>
                      {isCurrent ? (
                        <span className="memb-current-cell">Current plan</span>
                      ) : isHigher ? (
                        <UpgradeRequestButton
                          brandId={brand.id}
                          brandSlug={brand.slug}
                          targetTier={t}
                          targetLabel={TIER_LABEL[t]}
                        />
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="field-helper memb-note">
          <sup>*</sup> Your free brand page, material pages and sample &amp; info
          requests become visible once you publish at least one material.
        </p>
        <p className="field-helper memb-note-sub">
          Plan changes are reviewed by our team — request an upgrade above and
          we’ll be in touch.
        </p>
      </div>
    </>
  )
}
