'use client'

/**
 * ClaimAccountForm — turns a contact record into an account.
 *
 * Three states: checking the link, the form, and done. The check runs first so someone
 * with an expired link is told that straight away instead of after filling in a password.
 *
 * The account type is asked here for the same reason the register form asks it: a
 * registered account always carries one and a contact never does. Without it the claimed
 * account would be a half account that needs repairing later.
 *
 * The password rule mirrors /register and /reset-password (min 10). WordPress stays
 * authoritative — if the server rule grows stricter, `md_auth_weak_password` comes back
 * and we show the server message verbatim.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormStateProvider, Input, Select, SubmitButton } from '@/components/ui/form'
import { parseAuthErrorResponse } from '@/app/_auth-components/auth-errors'
import { useAuth } from '@/components/providers/AuthContext'

const MIN_PASSWORD_LENGTH = 10

type Phase =
  | { kind: 'checking' }
  | { kind: 'ready'; email: string; firstName: string; lastName: string }
  | { kind: 'invalid'; message: string }
  | { kind: 'done' }

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }

export function ClaimAccountForm({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'checking' })
  const [state, setState] = useState<FormState>({ kind: 'idle' })
  const checked = useRef(false)
  const { refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    if (!token) {
      setPhase({
        kind: 'invalid',
        message: 'This activation link is incomplete. Please open it directly from the email.',
      })
      return
    }

    void (async () => {
      try {
        const res = await fetch(`/api/auth/claim/check?token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { message?: string } | null
          setPhase({
            kind: 'invalid',
            message:
              data?.message ??
              'This link has expired or has already been used. You can request a new one from the sign-in page.',
          })
          return
        }
        const data = (await res.json()) as {
          email?: string
          first_name?: string
          last_name?: string
        }
        setPhase({
          kind: 'ready',
          email: data.email ?? '',
          firstName: data.first_name ?? '',
          lastName: data.last_name ?? '',
        })
      } catch {
        setPhase({
          kind: 'invalid',
          message: 'We could not reach the server. Check your connection and try again.',
        })
      }
    })()
  }, [token])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phase.kind !== 'ready') return

    const data = new FormData(e.currentTarget)
    const password = String(data.get('password') ?? '')
    const passwordConfirm = String(data.get('passwordConfirm') ?? '')

    if (!password || !passwordConfirm) return
    if (password !== passwordConfirm) {
      setState({ kind: 'error', message: 'The two passwords do not match.' })
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setState({
        kind: 'error',
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      })
      return
    }

    setState({ kind: 'submitting' })

    try {
      const res = await fetch('/api/auth/claim/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          accountType: String(data.get('accountType') ?? ''),
          firstName: String(data.get('firstName') ?? ''),
          lastName: String(data.get('lastName') ?? ''),
          profession: String(data.get('profession') ?? ''),
          organisation: String(data.get('organisation') ?? ''),
        }),
      })

      if (!res.ok) {
        const err = await parseAuthErrorResponse(res)
        setState({ kind: 'error', message: err.message })
        return
      }

      setPhase({ kind: 'done' })
      // The complete endpoint issues a session, same as register and login, so the
      // person is signed in when they land on the dashboard.
      await refreshUser()
      router.push('/dashboard')
    } catch {
      setState({
        kind: 'error',
        message: 'We could not reach the server. Check your connection and try again.',
      })
    }
  }

  if (phase.kind === 'checking') {
    return <p className="auth-card-footer-text">Checking your link…</p>
  }

  if (phase.kind === 'invalid') {
    return (
      <>
        <div className="form-banner is-error" role="alert">
          {phase.message}
        </div>
        <p className="auth-card-footer-text">
          <Link className="auth-card-footer-link" href="/sign-in">
            Go to sign in
          </Link>
        </p>
      </>
    )
  }

  if (phase.kind === 'done') {
    return (
      <div className="form-banner is-success" role="status">
        Your account is active. Taking you to your dashboard…
      </div>
    )
  }

  return (
    <FormStateProvider>
      <form onSubmit={handleSubmit} noValidate>
        {state.kind === 'error' && (
          <div className="form-banner is-error" role="alert">
            {state.message}
          </div>
        )}

        <p className="auth-card-footer-text">
          Activating <strong>{phase.email}</strong>
        </p>

        <div className="g2">
          <Input label="First name" name="firstName" defaultValue={phase.firstName} required />
          <Input label="Last name" name="lastName" defaultValue={phase.lastName} required />
        </div>

        <Select label="I want to" name="accountType" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          <option value="specifier">Discover materials</option>
          <option value="manufacturer">List materials</option>
        </Select>

        <Input label="Profession" name="profession" showFilledState />
        <Input label="Organisation" name="organisation" showFilledState />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          helper={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <Input
          label="Repeat password"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
        />

        <SubmitButton disabled={state.kind === 'submitting'}>
          {state.kind === 'submitting' ? 'Activating…' : 'Activate account'}
        </SubmitButton>
      </form>
    </FormStateProvider>
  )
}
