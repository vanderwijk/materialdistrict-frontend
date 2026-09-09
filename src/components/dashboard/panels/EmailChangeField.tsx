'use client'

/**
 * The email row in the profile form.
 *
 * The address is no longer part of the profile save. `POST /md/v2/dashboard/profile`
 * refuses a changed address with `md_dashboard_email_needs_confirmation`, because an
 * address that changes without proof lets anyone holding a session move the account and
 * then take it over through forgot-password — with no notice to the address losing it.
 *
 * So the field is read-only and the change runs as its own small flow: enter the new
 * address, we mail a link there, and the account keeps its current address until that
 * link is clicked. A notice goes to the old address at the same time, so a takeover is
 * visible to the person it happens to.
 */

import { useState } from 'react'
import { Input } from '@/components/ui/form'

interface EmailChangeFieldProps {
  /** The address currently on the account. */
  email: string
  /** Masked address of a change already in flight, from the profile GET. */
  pendingEmail?: string | null
}

type State =
  | { kind: 'idle' }
  | { kind: 'editing' }
  | { kind: 'sending' }
  | { kind: 'sent'; masked: string }
  | { kind: 'error'; message: string }

export function EmailChangeField({ email, pendingEmail }: EmailChangeFieldProps) {
  const [state, setState] = useState<State>(() =>
    pendingEmail ? { kind: 'sent', masked: pendingEmail } : { kind: 'idle' },
  )
  const [nextEmail, setNextEmail] = useState('')

  async function start() {
    if (!nextEmail.trim()) return
    setState({ kind: 'sending' })

    try {
      const res = await fetch('/api/dashboard/email-change/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nextEmail.trim() }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null
        setState({
          kind: 'error',
          message: data?.message ?? 'We could not send the confirmation. Please try again.',
        })
        return
      }

      const data = (await res.json()) as { pending_email?: string }
      setState({ kind: 'sent', masked: data.pending_email ?? nextEmail.trim() })
      setNextEmail('')
    } catch {
      setState({
        kind: 'error',
        message: 'We could not reach the server. Check your connection and try again.',
      })
    }
  }

  async function cancel() {
    try {
      await fetch('/api/dashboard/email-change/cancel', { method: 'POST' })
    } catch {
      // A failed cancel is not worth an error state: the link expires on its own.
    }
    setState({ kind: 'idle' })
  }

  return (
    <div className="field-group">
      <Input label="Email" type="email" value={email} readOnly disabled />

      {state.kind === 'sent' && (
        <div className="form-banner is-info" role="status">
          A confirmation link is on its way to <strong>{state.masked}</strong>. Your account keeps
          using {email} until you click it.{' '}
          <button type="button" className="link-button" onClick={cancel}>
            Cancel this change
          </button>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="form-banner is-error" role="alert">
          {state.message}
        </div>
      )}

      {state.kind === 'idle' && (
        <button type="button" className="link-button" onClick={() => setState({ kind: 'editing' })}>
          Change email address
        </button>
      )}

      {(state.kind === 'editing' || state.kind === 'sending') && (
        <div className="g2">
          <Input
            label="New email address"
            type="email"
            value={nextEmail}
            onChange={(e) => setNextEmail(e.target.value)}
            helper="We send a link there. Your account only moves once you click it."
          />
          <div className="field-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={start}
              disabled={state.kind === 'sending' || !nextEmail.trim()}
            >
              {state.kind === 'sending' ? 'Sending…' : 'Send confirmation'}
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setNextEmail('')
                setState({ kind: 'idle' })
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
