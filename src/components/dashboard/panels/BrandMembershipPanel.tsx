import type { CSSProperties } from 'react'
import Link from 'next/link'
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
                  {TIERS.map((t) => (
                    <td key={t} className={t === brand.tier ? 'plan-active-col' : undefined}>
                      {canManufacturerAccess(t, feature) ? (
                        <span className="memb-yes" aria-label="Included">✓</span>
                      ) : (
                        <span className="memb-no" aria-label="Not included">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field-helper memb-note">
          Plan changes are handled by our team — they cannot be switched here.{' '}
          <Link href="/become-a-partner">Contact us about upgrading</Link>.
        </p>
      </div>
    </>
  )
}
