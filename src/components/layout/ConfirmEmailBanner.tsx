'use client'

/**
 * Persistent nudge for accounts whose email address is not confirmed yet.
 *
 * Renders nothing for anonymous visitors and for confirmed accounts — which is
 * every account created before confirmation shipped, since the server
 * grandfathers those (see md_user_email_confirmed()). So this is invisible to
 * the existing user base by construction.
 */

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'

type SendState = 'idle' | 'sending' | 'sent' | 'error'

export function ConfirmEmailBanner() {
  const { user, isLoggedIn } = useAuth()
  const [state, setState] = useState<SendState>('idle')

  if (!isLoggedIn || user?.emailConfirmed !== false) return null

  async function handleResend() {
    setState('sending')
    try {
      const res = await fetch('/api/auth/resend-confirmation', { method: 'POST' })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="confirm-email-banner" role="status">
      <p className="confirm-email-banner-text">
        <strong>Confirm your email address</strong> — we sent a link to{' '}
        {user?.email ?? 'your inbox'}. Until you do, we cannot send you anything
        and some parts of the site stay closed.
      </p>
      {state === 'sent' ? (
        <span className="confirm-email-banner-note">New link sent.</span>
      ) : (
        <button
          type="button"
          className="confirm-email-banner-action"
          onClick={handleResend}
          disabled={state === 'sending'}
        >
          {state === 'sending' ? 'Sending…' : 'Resend the link'}
        </button>
      )}
      {state === 'error' && (
        <span className="confirm-email-banner-note">
          That did not work — please try again in a moment.
        </span>
      )}
    </div>
  )
}
