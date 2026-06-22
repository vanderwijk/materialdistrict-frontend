'use client'

/**
 * Inline sign-in panel shown on checkout when the entered email belongs to
 * an existing account. After login: merge cart, refresh Insider pricing,
 * and prefill billing from the profile.
 */

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/form'
import { useAuth } from '@/components/providers/AuthContext'
import { parseAuthErrorResponse } from '@/app/_auth-components/auth-errors'
import { getCartToken } from '@/lib/api/cart'
import { mergeCheckoutCart } from '@/lib/api/checkout-account'
import { profileToCheckoutPrefill } from '@/lib/checkout/profile-prefill'
import type { StoreAddress } from '@/lib/api/cart'
import type { UserProfile } from '@/types/dashboard'
import type { User } from '@/types/shared'

interface CheckoutSignInPanelProps {
  email: string
  onSignedIn: (data: { email: string; billing: StoreAddress; vatNumber?: string }) => void
}

export function CheckoutSignInPanel({ email, onSignedIn }: CheckoutSignInPanelProps) {
  const router = useRouter()
  const { signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe: true }),
      })

      if (!res.ok) {
        const err = await parseAuthErrorResponse(res)
        setError(err.message)
        return
      }

      const { user } = (await res.json()) as { user: User }
      signIn(user)

      const cartToken = getCartToken()
      if (cartToken) {
        try {
          await mergeCheckoutCart(cartToken)
        } catch {
          setError(
            'Signed in, but your cart could not be merged. Refresh the page or add items again.',
          )
        }
      }

      let billing: StoreAddress | null = null
      try {
        const profileRes = await fetch('/api/dashboard/profile')
        if (profileRes.ok) {
          const profile = (await profileRes.json()) as UserProfile
          const prefill = profileToCheckoutPrefill(profile)
          billing = prefill.billing
          onSignedIn({ email: prefill.email, billing, vatNumber: prefill.vatNumber })
        }
      } catch {
        /* profile prefill is optional */
      }

      if (!billing) {
        onSignedIn({
          email: user.email,
          billing: {
            first_name: user.firstName ?? '',
            last_name: user.lastName ?? '',
            address_1: '',
            city: '',
            postcode: '',
            country: 'NL',
            state: '',
            email: user.email,
          },
        })
      }

      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout-account-panel">
      <p className="checkout-hint">
        You already have an account with this email. Sign in to use your saved address and
        Insider pricing.
      </p>
      <form className="checkout-account-form" onSubmit={handleSubmit}>
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={submitting}
        />
        {error && <p className="checkout-error">{error}</p>}
        <button type="submit" className="checkout-secondary-btn" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}
