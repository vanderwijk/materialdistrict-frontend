'use client'

/**
 * ResetPasswordForm — completes the reset using the token from the URL.
 *
 * Submits to /api/auth/reset-password. On success replaces the form
 * with a confirmation that links back to /sign-in (per
 * `wordpress-instructions-auth.md` §5: no auto-login).
 *
 * The same client-side password rule as /register (min 10 chars) is
 * mirrored here. WordPress is authoritative — if the server rule grows
 * stricter, the route handler will surface `md_auth_weak_password` and
 * we'll display the server message verbatim.
 */

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  FieldGroup,
  FormStateProvider,
  Input,
  SubmitButton,
} from '@/components/ui/form'
import { parseAuthErrorResponse } from '@/app/_auth-components/auth-errors'

interface ResetPasswordFormProps {
  token: string
}

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

const MIN_PASSWORD_LENGTH = 10

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, setState] = useState<FormState>({ kind: 'idle' })
  const passwordValueRef = useRef<string>('')
  const passwordRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = String(formData.get('password') ?? '')
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '')

    if (!password || !passwordConfirm) return
    if (password !== passwordConfirm) return
    if (password.length < MIN_PASSWORD_LENGTH) return

    setState({ kind: 'submitting' })

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      if (!res.ok) {
        const err = await parseAuthErrorResponse(res)
        setState({ kind: 'error', message: err.message })
        // For weak-password errors, focus the field. For invalid-token,
        // the user can't recover here — they need a fresh link.
        if (err.code === 'md_auth_weak_password') {
          passwordRef.current?.focus()
          passwordRef.current?.select()
        }
        return
      }

      setState({ kind: 'success' })
    } catch (err) {
      console.error('[reset-password] request failed', err)
      setState({
        kind: 'error',
        message:
          'We could not reach the server. Check your connection and try again.',
      })
    }
  }

  if (state.kind === 'success') {
    return (
      <>
        <div
          className="form-banner is-success auth-form-success"
          role="status"
          aria-live="polite"
        >
          <p>Your password has been updated.</p>
          <p>You can now sign in with your new password.</p>
        </div>
        <Link
          className="btn btn-primary btn-lg auth-form-submit"
          href="/sign-in"
        >
          Go to sign in
        </Link>
      </>
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
            {state.message.toLowerCase().includes('token') ? (
              <>
                {' '}
                <Link className="auth-form-link" href="/forgot-password">
                  Request a new link
                </Link>
                .
              </>
            ) : null}
          </div>
        ) : null}

        <Input
          ref={passwordRef}
          name="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          required
          showFilledState
          autoFocus
          helper={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          validate={(value) => {
            if (value.length === 0) return undefined
            if (value.length < MIN_PASSWORD_LENGTH) {
              return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
            }
            return true
          }}
          onChange={(e) => {
            passwordValueRef.current = e.target.value
          }}
        />

        <Input
          name="passwordConfirm"
          type="password"
          label="Confirm new password"
          autoComplete="new-password"
          required
          showFilledState
          validate={(value) => {
            if (value.length === 0) return undefined
            if (value !== passwordValueRef.current) {
              return 'Passwords do not match.'
            }
            return true
          }}
        />

        <FieldGroup>
          <SubmitButton
            variant="primary"
            size="lg"
            disabled={state.kind === 'submitting'}
            className="auth-form-submit"
          >
            {state.kind === 'submitting' ? 'Updating…' : 'Update password'}
          </SubmitButton>
        </FieldGroup>
      </form>
    </FormStateProvider>
  )
}
