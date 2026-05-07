'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import type { User } from '@/types'

/**
 * AuthProvider — echte WP-integratie via de Next.js auth-routes.
 *
 * Architectuur:
 *  - Server-side fetcht `layout.tsx` de huidige user via `getCurrentUser()`
 *    en geeft die mee als `initialUser`. Geen FOUC, geen flicker.
 *  - Mutaties (signIn, signOut, refresh) gaan via `/api/auth/*`. De JWT zit
 *    in een httpOnly cookie op het Next.js-domein; de browser ziet 'm nooit.
 *  - Membership wordt afgeleid van `user.membership.tier === 'insider'`.
 *    Tot de Stripe-sync er is, geeft WP altijd `tier: 'free'`.
 */

export interface SignInResult {
  ok: boolean
  error?: string
}

export interface AuthContextValue {
  user: User | null
  isLoggedIn: boolean
  isMember: boolean
  /**
   * Logt in via `/api/auth/login`. Returnt `{ ok: true }` of
   * `{ ok: false, error }`. Gooit niet — UI kan veilig op `result.error`
   * acteren.
   */
  signIn: (email: string, password: string) => Promise<SignInResult>
  /** Wist de cookie via `/api/auth/logout` en zet user op null. */
  signOut: () => Promise<void>
  /**
   * Re-fetch van `/api/auth/me`. Aanroepen na profile-updates of na
   * tabwissel als je achterdocht hebt over staleness.
   */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode
  initialUser?: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          let message = 'Login failed.'
          try {
            const data = (await res.json()) as { error?: string }
            if (data?.error) message = data.error
          } catch {
            // ignore — generieke message blijft
          }
          return { ok: false, error: message }
        }
        const data = (await res.json()) as { user: User }
        setUser(data.user)
        return { ok: true }
      } catch {
        return { ok: false, error: 'Network error.' }
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore — cookie wordt ook server-side weggetrokken; client-state altijd resetten
    } finally {
      setUser(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { user: User | null }
      setUser(data.user)
    } catch {
      // ignore — laat de huidige user staan, gebruiker krijgt 'm bij volgende navigatie
    }
  }, [])

  const value: AuthContextValue = {
    user,
    isLoggedIn: user !== null,
    isMember: user?.membership.tier === 'insider',
    signIn,
    signOut,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
