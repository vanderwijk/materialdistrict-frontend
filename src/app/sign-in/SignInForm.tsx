'use client'

/**
 * SignInForm — client-side form for /sign-in.
 *
 * Submits to /api/auth/login. On success:
 *  1. The route handler has already set the HttpOnly cookie.
 *  2. We receive `{ user }` in the response body.
 *  3. We call `signIn(user)` on AuthContext so the React tree flips
 *     to the logged-in state immediately (no flash of logged-out
 *     header between redirect and server re-render).
 *  4. We `router.push(next)` to navigate to the original destination,
 *     followed by `router.refresh()` so RSCs re-render with the fresh
 *     cookie. The next AuthProvider mount seeds with the same user —
 *     server hydration reconciles client state.
 *
 * Errors:
 *  - WP `md_auth_*` codes → display the WP-provided message inline
 *    (English copy lives in WordPress, per design).
 *  - `md_invalid_request` from our own route → same.
 *  - Network failure → generic message.
 *  - In all cases focus the relevant field (email or password) so the
 *    user can correct without grabbing the mouse.
 */

import { useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Checkbox,
  FormStateProvider,
  Input,
  SubmitButton,
} from '@/components/ui/form'
import { useAuth } from '@/components/providers/AuthContext'
import { parseAuthErrorResponse, focusFieldForCode } from '@/app/_auth-components/auth-errors'
import { SocialAuthButtons } from '@/app/_auth-components/SocialAuthButtons'

interface SignInFormProps {
  /** Sanitised target path for the post-login redirect. */
  next: string
  /** OAuth callback error code from `?error=`. */
  oauthError?: string
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }

function oauthErrorMessage(code: string | undefined): string | null {
  if (!code) return null
  switch (code) {
    case 'oauth_not_configured':
      return 'Social login is not configured yet. Please use email and password, or try again later.'
    case 'oauth_denied':
      return 'Social login was cancelled. You can try again or use email and password.'
    case 'oauth_invalid_state':
      return 'Social login expired or was invalid. Please try again.'
    case 'oauth_email_required':
    case 'oauth_email_unverified':
      return 'Your social account must have a verified email address to continue.'
    case 'oauth_registration_disabled':
      return 'New account registration is currently disabled.'
    case 'oauth_failed':
    case 'oauth_provider_error':
    default:
      if (code.startsWith('oauth_')) {
        return 'Social login failed. Please try again or use email and password.'
      }
      return null
  }
}

export function SignInForm({ next, oauthError }: SignInFormProps) {
  const router = useRouter()
  const { signIn } = useAuth()
  const initialOauth = oauthErrorMessage(oauthError)
  const [state, setState] = useState<SubmitState>(
    initialOauth ? { kind: 'error', message: initialOauth } : { kind: 'idle' },
  )
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const rememberMe = formData.get('rememberMe') === 'on'

    if (!email || !password) {
      // Form-state validation already covers this visually; defensive
      // guard for the network call.
      return
    }

    setState({ kind: 'submitting' })

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
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
      // Update context immediately so the header flips before navigation.
      signIn(body.user)
      // Navigate to the original destination and let RSCs re-render
      // against the fresh cookie.
      router.push(next)
      router.refresh()
    } catch (err) {
      console.error('[sign-in] login failed', err)
      setState({
        kind: 'error',
        message:
          'We could not reach the server. Check your connection and try again.',
      })
    }
  }

  return (
    <FormStateProvider>
      <SocialAuthButtons next={next} verb="Log in" />
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

        <Input
          ref={passwordRef}
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          showFilledState
        />

        <div className="auth-form-row">
          <Checkbox
            name="rememberMe"
            defaultChecked
            label="Keep me signed in"
          />
          <Link className="auth-form-link" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <SubmitButton
          variant="primary"
          size="lg"
          disabled={state.kind === 'submitting'}
          className="auth-form-submit"
        >
          {state.kind === 'submitting' ? 'Logging in…' : 'Login'}
        </SubmitButton>
      </form>
    </FormStateProvider>
  )
}
