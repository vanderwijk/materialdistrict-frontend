'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthContext'
import { isInsider } from '@/lib/auth/user-helpers'
import type { User } from '@/types/shared'

/**
 * Post-checkout notices on /membership (`?checkout=…`).
 *
 * success: confirm the Stripe session via `/api/membership/confirm-checkout`
 * (activates membership even if the Stripe→CMS webhook was delayed), then
 * refresh AuthContext from `/api/auth/me`. Polling remains as a fallback.
 */
export function CheckoutNotice() {
  const params = useSearchParams()
  const router = useRouter()
  const { isLoggedIn, isMember, signIn } = useAuth()
  const status = params.get('checkout')
  const sessionId = params.get('session_id')

  const [confirmed, setConfirmed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

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
    let confirmAttempted = false

    async function refreshUser(): Promise<boolean> {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return false
      const data = (await res.json()) as { user: User | null }
      if (data.user && isInsider(data.user)) {
        if (!cancelled) {
          signIn(data.user)
          setConfirmed(true)
          router.refresh()
          router.replace('/membership?checkout=success', { scroll: false })
        }
        return true
      }
      return false
    }

    async function confirmSession(): Promise<boolean> {
      if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) return false
      const res = await fetch('/api/membership/confirm-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
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

    if (!isLoggedIn && sessionId) {
      setNeedsLogin(true)
      return
    }

    void poll()

    return () => {
      cancelled = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [status, isMember, confirmed, isLoggedIn, sessionId, signIn, router])

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

    if (needsLogin) {
      const next = `/membership/?checkout=success${
        sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ''
      }`
      return (
        <div className="form-banner is-success" role="status">
          <strong>Payment received.</strong> Please{' '}
          <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>sign in</Link>{' '}
          to activate your membership on this device.
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
