'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthContext'
import type { User } from '@/types/shared'
import type { ManufacturerTier } from '@/lib/config/membership'

/**
 * Post-checkout banners on brand membership (`?checkout=success|cancel|…`).
 *
 * success: confirm the Stripe session via `/api/membership/confirm-brand-checkout`
 * (activates tier even if the Stripe→CMS webhook was delayed), then refresh
 * AuthContext from `/api/auth/me`. Polling remains as a fallback.
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
  const { isLoggedIn, signIn, user } = useAuth()
  const status = params.get('checkout')
  const sessionId = params.get('session_id')

  const [confirmed, setConfirmed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

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
    let confirmAttempted = false

    function brandActivated(dataUser: User | null): boolean {
      const brand = dataUser?.brands?.find(
        (b) => b.id === brandId || b.slug === brandSlug,
      )
      return Boolean(dataUser && brand && brand.tier !== 'free')
    }

    async function refreshUser(): Promise<boolean> {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return false
      const data = (await res.json()) as { user: User | null }
      if (brandActivated(data.user)) {
        if (!cancelled && data.user) {
          signIn(data.user)
          setConfirmed(true)
          router.refresh()
          router.replace(
            `/dashboard/brands/${encodeURIComponent(brandSlug)}/membership?checkout=success`,
            { scroll: false },
          )
        }
        return true
      }
      if (data.user && !cancelled) {
        signIn(data.user)
      }
      return false
    }

    async function confirmSession(): Promise<boolean> {
      if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) return false
      const res = await fetch('/api/membership/confirm-brand-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, brand_id: brandId }),
        cache: 'no-store',
      })
      if (res.status === 401) {
        if (!cancelled) setNeedsLogin(true)
        return false
      }
      if (!res.ok) return false
      return refreshUser()
    }

    async function poll() {
      attempts += 1
      try {
        if (!confirmAttempted && sessionId) {
          confirmAttempted = true
          if (await confirmSession()) return
          if (cancelled) return
        } else if (await refreshUser()) {
          return
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

    if (!isLoggedIn && sessionId) {
      setNeedsLogin(true)
      return
    }

    void poll()
    return () => {
      cancelled = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [status, confirmed, isLoggedIn, sessionId, brandId, brandSlug, signIn, router])

  if (!status) return null

  if (status === 'success') {
    if (confirmed || (currentTier && currentTier !== 'free')) {
      return (
        <div className="form-banner is-success" role="status">
          <strong>Payment received.</strong> Your brand plan is active.
        </div>
      )
    }
    if (needsLogin) {
      const next = `/dashboard/brands/${encodeURIComponent(brandSlug)}/membership?checkout=success${
        sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ''
      }`
      return (
        <div className="form-banner is-success" role="status">
          <strong>Payment received.</strong> Please{' '}
          <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>sign in</Link>{' '}
          to activate your brand plan on this device.
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
