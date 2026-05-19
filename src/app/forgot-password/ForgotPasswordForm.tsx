'use client'

/**
 * ForgotPasswordForm — posts an email to /api/auth/forgot-password and
 * shows a neutral success state regardless of whether the email exists.
 *
 * The neutral response is enforced server-side (both at our route and
 * by WordPress per `wordpress-instructions-auth.md` §4) to prevent user
 * enumeration. The frontend mirrors that: same green confirmation
 * message in every case, no "we found you" or "we didn't find you".
 *
 * Rate limiting (3 requests per email per hour) lives in WordPress.
 * If the limit is hit, WP returns `md_auth_failed` with HTTP 429 and
 * the route forwards it verbatim — we render the WP message inline.
 */

import { useRef, useState, type FormEvent } from 'react'
import {
  FieldGroup,
  FormStateProvider,
  Input,
  SubmitButton,
} from '@/components/ui/form'
import { parseAuthErrorResponse } from '@/app/_auth-components/auth-errors'

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; email: string }
  | { kind: 'error'; message: string }

export function ForgotPasswordForm() {
  const [state, setState] = useState<FormState>({ kind: 'idle' })
  const emailRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    if (!email) return

    setState({ kind: 'submitting' })

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const err = await parseAuthErrorResponse(res)
        setState({ kind: 'error', message: err.message })
        emailRef.current?.focus()
        return
      }

      setState({ kind: 'success', email })
    } catch (err) {
      console.error('[forgot-password] request failed', err)
      setState({
        kind: 'error',
        message:
          'We could not reach the server. Check your connection and try again.',
      })
    }
  }

  // Success state replaces the form entirely — there's nothing useful
  // for the user to do here except check their inbox or go back.
  if (state.kind === 'success') {
    return (
      <div
        className="form-banner is-success auth-form-success"
        role="status"
        aria-live="polite"
      >
        <p>
          If an account exists for <strong>{state.email}</strong>, we’ve sent a
          link to reset your password.
        </p>
        <p>The link is valid for one hour. Check your spam folder if you don’t see it.</p>
      </div>
    )
  }

  return (
    <FormStateProvider>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {state.kind === 'error' ? (
          <div
            className="form-banner is-error"
            role="alert"
            aria-live="assertive"
          >
            {state.message}
          </div>
        ) : null}

        <Input
          ref={emailRef}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          showFilledState
          autoFocus
        />

        <FieldGroup>
          <SubmitButton
            variant="primary"
            size="lg"
            disabled={state.kind === 'submitting'}
            className="auth-form-submit"
          >
            {state.kind === 'submitting' ? 'Sending…' : 'Send reset link'}
          </SubmitButton>
        </FieldGroup>
      </form>
    </FormStateProvider>
  )
}
