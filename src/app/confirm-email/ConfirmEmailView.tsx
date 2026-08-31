'use client'

/**
 * Redeems the confirmation key and reports the outcome.
 *
 * Runs on mount rather than behind a button: the person already expressed
 * intent by clicking the link in their inbox, and asking them to click a second
 * time loses people for no gain. The one-shot guard matters — React Strict Mode
 * double-invokes effects in development, and the second call would arrive after
 * the key has been consumed.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'

type Phase =
  | { kind: 'working' }
  | { kind: 'done' }
  | { kind: 'error'; message: string }

export function ConfirmEmailView({
  confirmKey,
  userId,
}: {
  confirmKey: string
  userId: string
}) {
  const { refreshUser } = useAuth()
  const [phase, setPhase] = useState<Phase>({ kind: 'working' })
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    if (!confirmKey || !userId) {
      setPhase({
        kind: 'error',
        message: 'This confirmation link is incomplete. Please open it directly from the email.',
      })
      return
    }

    void (async () => {
      try {
        const res = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: confirmKey, userId: Number(userId) }),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { message?: string }
            | null
          setPhase({
            kind: 'error',
            message:
              data?.message ??
              'We could not confirm this link. It may have expired — you can request a new one from your account.',
          })
          return
        }

        setPhase({ kind: 'done' })
        // Pull the fresh user so the banner disappears and gated content opens
        // without a reload, for the common case where they clicked the link in
        // the same browser they registered in.
        await refreshUser()
      } catch {
        setPhase({
          kind: 'error',
          message: 'We could not reach the server. Check your connection and try again.',
        })
      }
    })()
  }, [confirmKey, userId, refreshUser])

  if (phase.kind === 'working') {
    return <p className="auth-card-footer-text">Confirming your email address…</p>
  }

  if (phase.kind === 'error') {
    return (
      <>
        <div className="form-banner is-error" role="alert">
          {phase.message}
        </div>
        <p className="auth-card-footer-text">
          <Link className="auth-card-footer-link" href="/dashboard/profile">
            Go to your profile
          </Link>{' '}
          to request a new link.
        </p>
      </>
    )
  }

  return (
    <>
      <div className="form-banner is-success" role="status">
        Your email address is confirmed — your account is fully active.
      </div>
      <p className="auth-card-footer-text">
        <Link className="auth-card-footer-link" href="/material">
          Start exploring materials
        </Link>
      </p>
    </>
  )
}
