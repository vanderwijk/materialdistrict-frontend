'use client'

/**
 * RegisterForm — client-side form for /register.
 *
 * Lage-drempel reframe (sessie 18-06):
 *  - Account-type-keuze (Discover / List) bovenaan en verplicht — bepaalt het
 *    account-type (specifier vs. manufacturer; manufacturer → connect-brand
 *    vervolgstap). Init uit de query-param, maar door de gebruiker te wijzigen.
 *  - Alleen e-mail + wachtwoord verplicht. Voornaam/achternaam/profession/
 *    organisatie zijn optioneel (uitvragen mag, hoeft niet) — de rest wordt
 *    just-in-time uitgevraagd bij contact/sample.
 *  - Confirm-password is verwijderd (lagere drempel; de server is autoritatief).
 *  - Social login (Google/LinkedIn) als snelle route bovenaan.
 *
 * Password: minimaal 10 tekens (frontend-mirror; server is autoritatief).
 */

import { useRef, useState, type FormEvent } from 'react'
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

type AccountType = 'specifier' | 'manufacturer'

interface RegisterFormProps {
  next: string
  accountType: AccountType
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }

const MIN_PASSWORD_LENGTH = 10

const ACCOUNT_TYPES: ReadonlyArray<{
  value: AccountType
  title: string
  sub: string
}> = [
  { value: 'specifier', title: 'Discover materials', sub: 'Architect, designer or specifier' },
  { value: 'manufacturer', title: 'List your materials', sub: 'Manufacturer or brand' },
]

export function RegisterForm({ next, accountType }: RegisterFormProps) {
  const router = useRouter()
  const { signIn } = useAuth()
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })
  const [selectedType, setSelectedType] = useState<AccountType>(accountType)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const profession = String(formData.get('profession') ?? '').trim()
    const organisation = String(formData.get('organisation') ?? '').trim()
    const acceptedTerms = formData.get('acceptTerms') === 'on'

    // Alleen e-mail + wachtwoord + voorwaarden zijn verplicht.
    if (!email || !password || !acceptedTerms) return
    if (password.length < MIN_PASSWORD_LENGTH) return

    setState({ kind: 'submitting' })

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          profession,
          organisation,
          accountType: selectedType,
        }),
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
      <SocialAuthButtons next={next} verb="Continue" />

      <fieldset className="auth-accounttype" aria-label="What brings you here?">
        {ACCOUNT_TYPES.map((opt) => {
          const isSelected = selectedType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              className={`auth-at-card${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => setSelectedType(opt.value)}
            >
              <span className="auth-at-title">{opt.title}</span>
              <span className="auth-at-sub">{opt.sub}</span>
            </button>
          )
        })}
      </fieldset>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {state.kind === 'error' ? (
          <div className="form-banner is-error" role="alert" aria-live="assertive">
            {state.message}
          </div>
        ) : null}

        <div className="auth-form-grid-2">
          <Input name="firstName" type="text" label="First name" autoComplete="given-name" optional showFilledState />
          <Input name="lastName" type="text" label="Last name" autoComplete="family-name" optional showFilledState />
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
        />

        <Input name="profession" type="text" label="Profession" autoComplete="organization-title" optional showFilledState />
        <Input name="organisation" type="text" label="Organisation" autoComplete="organization" optional showFilledState />

        <Checkbox
          name="acceptTerms"
          required
          label={
            <>
              I agree to the{' '}
              <a className="auth-form-link" href="#">Terms of Service</a>{' '}
              and{' '}
              <a className="auth-form-link" href="#">Privacy Policy</a>.
            </>
          }
        />

        <SubmitButton
          variant="primary"
          size="lg"
          disabled={state.kind === 'submitting'}
          className="auth-form-submit"
        >
          {state.kind === 'submitting' ? 'Creating account…' : 'Create account'}
        </SubmitButton>
      </form>
    </FormStateProvider>
  )
}
