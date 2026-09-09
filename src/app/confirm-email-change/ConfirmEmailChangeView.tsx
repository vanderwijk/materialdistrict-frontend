'use client'

/**
 * Confirms a pending email change.
 *
 * Deliberately behind a button and not on mount. The token in this link can move an
 * account to a different address; a mail scanner or a link preview that fetches the URL
 * must not be able to do that on someone's behalf. /confirm-email can redeem on mount
 * because the worst it does is activate an account the person already asked for — here
 * the stakes are different.
 *
 * The new address is shown before confirming, so someone who did not request this sees
 * where their account was about to go and can close the page instead.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'

type Phase =
  | { kind: 'checking' }
  | { kind: 'ready'; newEmail: string }
  | { kind: 'invalid'; message: string }
  | { kind: 'working'; newEmail: string }
  | { kind: 'done'; email: string }
  | { kind: 'failed'; message: string }

export function ConfirmEmailChangeView({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'checking' })
  const checked = useRef(false)
  const { refreshUser } = useAuth()

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    if (!token) {
      setPhase({
        kind: 'invalid',
        message: 'This link is incomplete. Please open it directly from the email.',
      })
      return
    }

    void (async () => {
      try {
        const res = await fetch(
          `/api/dashboard/email-change/check?token=${encodeURIComponent(token)}`,
        )
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { message?: string } | null
          setPhase({
            kind: 'invalid',
            message:
              data?.message ??
              'This link has expired or has already been used. You can start the change again from your profile.',
          })
          return
        }
        const data = (await res.json()) as { new_email?: string }
        setPhase({ kind: 'ready', newEmail: data.new_email ?? '' })
      } catch {
        setPhase({
          kind: 'invalid',
          message: 'We could not reach the server. Check your connection and try again.',
        })
      }
    })()
  }, [token])

  async function confirm() {
    if (phase.kind !== 'ready') return
    const target = phase.newEmail
    setPhase({ kind: 'working', newEmail: target })

    try {
      const res = await fetch('/api/dashboard/email-change/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null
        setPhase({
          kind: 'failed',
          message: data?.message ?? 'We could not complete the change. Please try again.',
        })
        return
      }

      const data = (await res.json()) as { email?: string }
      setPhase({ kind: 'done', email: data.email ?? target })
      // Only useful when the link is opened in the same browser as the session; harmless
      // otherwise, which is the common case for a link clicked on a phone.
      await refreshUser()
    } catch {
      setPhase({
        kind: 'failed',
        message: 'We could not reach the server. Check your connection and try again.',
      })
    }
  }

  if (phase.kind === 'checking') {
    return <p className="auth-card-footer-text">Checking your link…</p>
  }

  if (phase.kind === 'invalid' || phase.kind === 'failed') {
    return (
      <>
        <div className="form-banner is-error" role="alert">
          {phase.message}
        </div>
        <p className="auth-card-footer-text">
          <Link className="auth-card-footer-link" href="/dashboard/profile">
            Go to your profile
          </Link>{' '}
          to start again.
        </p>
      </>
    )
  }

  if (phase.kind === 'done') {
    return (
      <>
        <div className="form-banner is-success" role="status">
          Your account now uses <strong>{phase.email}</strong>. Use it the next time you sign in.
        </div>
        <p className="auth-card-footer-text">
          <Link className="auth-card-footer-link" href="/dashboard/profile">
            Back to your profile
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <p className="auth-card-footer-text">
        Your account will move to <strong>{phase.newEmail}</strong>. Until you confirm, it keeps
        its current address.
      </p>
      <p className="auth-card-footer-text">
        If you did not ask for this, close this page and change your password.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={confirm}
        disabled={phase.kind === 'working'}
      >
        {phase.kind === 'working' ? 'Confirming…' : 'Confirm new address'}
      </button>
    </>
  )
}
