'use client'

/**
 * CurrentPlanBanner — the navy "Current plan" banner at the top of the brand
 * profile. Tier-specific: shows the tier name + annual price and feature pills
 * (materials quota, featured placement, fair discount) derived from the
 * membership config (config is the source of truth for prices — not the
 * mockup). Partner shows "All features unlocked"; lower tiers get a compare /
 * upgrade link.
 */

import Link from 'next/link'
import {
  MANUFACTURER_PRICING,
  FAIR_DISCOUNT,
  getMaterialLimit,
  canManufacturerAccess,
  type ManufacturerTier,
} from '@/lib/config/membership'

const TIER_LABELS: Record<ManufacturerTier, string> = {
  free: 'Free',
  basis: 'Basis',
  plus: 'Plus',
  partner: 'Partner',
}

function priceLabel(tier: ManufacturerTier): string {
  const annual = MANUFACTURER_PRICING[tier].annual
  if (annual <= 0) return 'Free'
  return `€ ${annual.toLocaleString('en-US')} / year`
}

export function CurrentPlanBanner({
  tier,
  upgradeHref = './membership',
}: {
  tier: ManufacturerTier
  upgradeHref?: string
}) {
  const limit = getMaterialLimit(tier)
  const pills: string[] = []
  pills.push(limit === Infinity ? 'Unlimited materials' : `${limit} material${limit === 1 ? '' : 's'}`)
  if (canManufacturerAccess(tier, 'Featured placement')) pills.push('Featured placement')
  const fair = FAIR_DISCOUNT[tier]
  if (fair > 0) pills.push(`Fair ${Math.round(fair * 100)}% discount`)

  const isTop = tier === 'partner'

  return (
    <div className="plan-banner">
      <div className="plan-banner-main">
        <span className="plan-banner-label">Current plan</span>
        <span className="plan-banner-tier">
          {TIER_LABELS[tier]} — {priceLabel(tier)}
        </span>
        <span className="plan-banner-pills">
          {pills.map((p) => (
            <span key={p} className="plan-banner-pill">
              {p}
            </span>
          ))}
        </span>
      </div>
      {isTop ? (
        <span className="plan-banner-aside">All features unlocked</span>
      ) : (
        <Link href={upgradeHref} className="plan-banner-cta">
          Compare plans
        </Link>
      )}
    </div>
  )
}
