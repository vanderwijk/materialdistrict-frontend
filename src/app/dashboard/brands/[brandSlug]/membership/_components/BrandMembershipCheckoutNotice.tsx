'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthContext'
import type { User } from '@/types/shared'
import type { ManufacturerTier } from '@/lib/config/membership'

/**
 * Post-checkout banners on brand membership (`?checkout=success|cancel|…`).
 * On success, poll `/api/auth/me` until the brand tier updates, then refresh.
 */
export function BrandMembershipCheckoutNotice({
  brandId,
  brandSlug,
}: {
  brandId: number
  brandSlug: string
}) {
  const params = useSearchParams()
  const router = useRouter()
  const { signIn, user } = useAuth()
  const status = params.get('checkout')

  const [confirmed, setConfirmed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const currentTier = user?.brands?.find(
    (b) => b.id === brandId || b.slug === brandSlug,
  )?.tier as ManufacturerTier | undefined

  useEffect(() => {
    if (status === 'success' && currentTier && currentTier !== 'free') {
      setConfirmed(true)
    }
  }, [status, currentTier])

  useEffect(() => {
    if (status !== 'success') return
    if (confirmed) return

    let cancelled = false
    let attempts = 0
    const maxAttempts = 12
    let timer: number | undefined

    async function poll() {
      attempts += 1
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as { user: User | null }
          const brand = data.user?.brands?.find(
            (b) => b.id === brandId || b.slug === brandSlug,
          )
          if (data.user && brand && brand.tier !== 'free') {
            if (!cancelled) {
              signIn(data.user)
              setConfirmed(true)
              router.refresh()
              router.replace(
                `/dashboard/brands/${encodeURIComponent(brandSlug)}/membership?checkout=success`,
                { scroll: false },
              )
            }
            return
          }
          // Keep auth tree warm even before tier flips.
          if (data.user && !cancelled) {
            signIn(data.user)
          }
        }
      } catch {
        // keep polling
      }

      if (cancelled) return
      if (attempts >= maxAttempts) {
        setTimedOut(true)
        return
      }
      timer = window.setTimeout(poll, attempts < 4 ? 700 : 1500)
    }

    void poll()
    return () => {
      cancelled = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [status, confirmed, brandId, brandSlug, signIn, router])

  if (!status) return null

  if (status === 'success') {
    if (confirmed || (currentTier && currentTier !== 'free')) {
      return (
        <div className="form-banner is-success" role="status">
          <strong>Payment received.</strong> Your brand plan is active.
        </div>
      )
    }
    if (timedOut) {
      return (
        <div className="form-banner is-success" role="status">
          <strong>Payment received.</strong> Refresh if your plan has not updated
          yet.
        </div>
      )
    }
    return (
      <div className="form-banner is-success" role="status">
        <strong>Payment received.</strong> Activating your brand plan…
      </div>
    )
  }

  if (status === 'cancel') {
    return (
      <div className="form-banner" role="status">
        Checkout was cancelled. No charge was made — you can try again whenever
        you like.
      </div>
    )
  }

  if (status === 'already') {
    return (
      <div className="form-banner is-success" role="status">
        This brand already has this plan or a higher plan.
      </div>
    )
  }

  if (status === 'error' || status === 'unavailable') {
    return (
      <div className="form-banner is-error" role="alert">
        <strong>Checkout isn&rsquo;t available right now.</strong> Please try
        again in a moment.
      </div>
    )
  }

  return null
}
