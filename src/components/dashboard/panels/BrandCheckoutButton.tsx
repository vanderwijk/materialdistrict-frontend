'use client'

import { Button } from '@/components/ui'
import type { ManufacturerTier } from '@/lib/config/membership'

/**
 * Self-service Stripe checkout CTA for brand tier upgrades (Basis / Plus / Partner).
 * Lands on `/checkout?plan=brand&…` which creates the WP Checkout Session and redirects.
 */
export function BrandCheckoutButton({
  brandId,
  brandSlug,
  targetTier,
  targetLabel,
}: {
  brandId: number
  brandSlug: string
  targetTier: Exclude<ManufacturerTier, 'free'>
  targetLabel: string
}) {
  const href =
    `/checkout?plan=brand` +
    `&brandId=${encodeURIComponent(String(brandId))}` +
    `&tier=${encodeURIComponent(targetTier)}` +
    `&brandSlug=${encodeURIComponent(brandSlug)}`

  return (
    <Button as="link" href={href} variant="outline" size="sm" className="memb-upgrade-btn">
      Upgrade to {targetLabel}
    </Button>
  )
}
