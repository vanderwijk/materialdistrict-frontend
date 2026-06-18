'use client'

import { useState } from 'react'
import type { ManufacturerTier } from '@/lib/config/membership'

/**
 * Interim upgrade-request CTA (review point 12.4).
 *
 * Full self-service tier switching is parked (it belongs to the upsell/checkout
 * build). Until then a tier change is "handled by our team" — but instead of a
 * dead-end sentence, each higher plan gets an actionable button that files an
 * upgrade request. The request is posted to a backend endpoint which notifies
 * the team by email (same "request → notify team" pattern as the brand request
 * in 14.2). The endpoint itself is a Johan/backend action item.
 */
export function UpgradeRequestButton({
  brandId,
  brandSlug,
  targetTier,
  targetLabel,
}: {
  brandId: number
  brandSlug: string
  targetTier: ManufacturerTier
  targetLabel: string
}) {
  const [state, setState] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')

  async function request() {
    if (state === 'pending' || state === 'done') return
    setState('pending')
    try {
      const res = await fetch('/api/dashboard/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, brandSlug, targetTier }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <span className="memb-upgrade-done" aria-live="polite">
        Requested ✓
      </span>
    )
  }

  return (
    <span className="memb-upgrade-cell">
      <button
        type="button"
        className="btn btn-outline btn-sm memb-upgrade-btn"
        onClick={request}
        disabled={state === 'pending'}
      >
        {state === 'pending' ? 'Sending…' : `Request ${targetLabel}`}
      </button>
      {state === 'error' && (
        <span className="memb-upgrade-error" role="alert">
          Could not send — please try again.
        </span>
      )}
    </span>
  )
}
