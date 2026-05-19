'use client'

/**
 * RegisterForm — client-side form for /register.
 *
 * Submits to /api/auth/register. On success that route has already set
 * the auth cookie and returns `{ user }` — same shape as login. We then
 * `signIn(user)` and navigate to `next` (default /materials), exactly
 * like /sign-in.
 *
 * Password rules (frontend mirror of server-side rule, see
 * `wordpress-instructions-auth.md` §5.2 / `wordpress-instructions-register.md`):
 *  - Minimum 10 characters.
 *  - No upper/lower/digit/symbol requirements (NIST-aligned).
 *  - The server is authoritative — frontend rule is for UX only.
 *
 * The "confirm password" field validates client-side only; the server
 * never sees it.
 */

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Checkbox,
  FieldGroup,
  FormStateProvider,
  Input,
  SubmitButton,
} from '@/components/ui/form'
import { useAuth } from '@/components/providers/AuthContext'
import { parseAuthErrorResponse, focusFieldForCode } from '@/app/_auth-components/auth-errors'

interface RegisterFormProps {
  next: string
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }

const MIN_PASSWORD_LENGTH = 10

export function RegisterForm({ next }: RegisterFormProps) {
  const router = useRouter()
  const { signIn } = useAuth()
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })

  // Keep the latest password value in a ref so the confirm-password
  // field's validator can compare against it without re-rendering.
  const passwordValueRef = useRef<string>('')

  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '')
    const acceptedTerms = formData.get('acceptTerms') === 'on'

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !passwordConfirm ||
      !acceptedTerms
    ) {
      // FormStateProvider drives the visual cues; defensive return.
      return
    }
    if (password !== passwordConfirm) return
    if (password.length < MIN_PASSWORD_LENGTH) return

    setState({ kind: 'submitting' })

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      if (!res.ok) {
        const err = await parseAuthErrorResponse(res)
        setState({ kind: 'error', message: err.message })
        const focusTarget = focusFieldForCode(err.code)
        if (focusTarget === 'email') {
          emailRef.current?.focus()
          emailRef.current?.select()
        } else if (focusTarget === 'password') {
          passwordRef.current?.focus()
          passwordRef.current?.select()
        }
        return
      }

      const body = (await res.json()) as { user: import('@/types/shared').User }
      signIn(body.user)
      router.push(next)
      router.refresh()
    } catch (err) {
      console.error('[register] request failed', err)
      setState({
        kind: 'error',
        message:
          'We could not reach the server. Check your connection and try again.',
      })
    }
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

        <div className="auth-form-grid-2">
          <Input
            ref={firstNameRef}
            name="firstName"
            type="text"
            label="First name"
            autoComplete="given-name"
            required
            showFilledState
            autoFocus
          />
          <Input
            ref={lastNameRef}
            name="lastName"
            type="text"
            label="Last name"
            autoComplete="family-name"
            required
            showFilledState
          />
        </div>

        <Input
          ref={emailRef}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          showFilledState
        />

        <Input
          ref={passwordRef}
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          required
          showFilledState
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
          label="Confirm password"
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

        <Checkbox
          name="acceptTerms"
          required
          label={
            <>
              I agree to the{' '}
              <a className="auth-form-link" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="auth-form-link" href="#">
                Privacy Policy
              </a>
              .
            </>
          }
        />

        <FieldGroup>
          <SubmitButton
            variant="primary"
            size="lg"
            disabled={state.kind === 'submitting'}
            className="auth-form-submit"
          >
            {state.kind === 'submitting' ? 'Creating account…' : 'Create account'}
          </SubmitButton>
        </FieldGroup>
      </form>
    </FormStateProvider>
  )
}
