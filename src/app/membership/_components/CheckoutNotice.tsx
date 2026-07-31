'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthContext'
import { isInsider } from '@/lib/auth/user-helpers'
import type { User } from '@/types/shared'

/**
 * Post-checkout notices on /membership (`?checkout=…`).
 *
 * success: poll `/api/auth/me` until Insider meta is present (Stripe webhook),
 * update AuthContext so MembershipCta flips, then show a welcome banner.
 */
export function CheckoutNotice() {
  const params = useSearchParams()
  const router = useRouter()
  const { isMember, signIn } = useAuth()
  const status = params.get('checkout')

  const [confirmed, setConfirmed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (status === 'success' && isMember) {
      setConfirmed(true)
    }
  }, [status, isMember])

  useEffect(() => {
    if (status !== 'success') return
    if (isMember || confirmed) return

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
          if (data.user && isInsider(data.user)) {
            if (!cancelled) {
              signIn(data.user)
              setConfirmed(true)
              router.refresh()
              // Drop session_id from the URL; keep checkout=success for the banner.
              router.replace('/membership?checkout=success', { scroll: false })
            }
            return
          }
        }
      } catch {
        // Ignore transient network errors and keep polling.
      }

      if (cancelled) return

      if (attempts >= maxAttempts) {
        setTimedOut(true)
        return
      }

      const delay = attempts < 4 ? 700 : 1500
      timer = window.setTimeout(poll, delay)
    }

    void poll()

    return () => {
      cancelled = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [status, isMember, confirmed, signIn, router])

  if (!status) return null

  if (status === 'success') {
    if (confirmed || isMember) {
      return (
        <div className="form-banner is-success" role="status">
          <strong>Welcome to Insider.</strong> Your membership is active — you
          have full access.
        </div>
      )
    }

    if (timedOut) {
      return (
        <div className="form-banner is-success" role="status">
          <strong>Payment received.</strong> Your membership should be active —
          refresh the page if you still see Free access.
        </div>
      )
    }

    return (
      <div className="form-banner is-success" role="status">
        <strong>Payment received.</strong> Activating your membership…
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
        You already have an active Insider membership.
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="form-banner is-error" role="alert">
        <strong>Something went wrong starting checkout.</strong> Please try
        again in a moment.
      </div>
    )
  }

  if (status === 'unavailable') {
    return (
      <div className="form-banner is-error" role="alert">
        <strong>Checkout isn&rsquo;t available right now.</strong> Please try
        again in a moment.
      </div>
    )
  }

  return null
}
