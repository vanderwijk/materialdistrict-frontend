'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/shared'
import { isInsider as userIsInsider } from '@/lib/auth/user-helpers'

/**
 * AuthContext — auth state for the Next.js client.
 *
 * Hydration flow (server-driven):
 *
 *   1. `app/layout.tsx` is a Server Component. On every page render it
 *      reads the auth cookie, calls `getCurrentUser(token)`, and passes
 *      the resulting User (or `null`) into <AuthProvider initialUser>.
 *   2. The provider seeds its state with `initialUser`. There is no
 *      client-side fetch on first render — the user shape is already
 *      present in the initial HTML, so components like Header render
 *      correctly without a flash of logged-out state.
 *   3. Login is NOT performed through this context. The /login page
 *      (built in session 11) POSTs to /api/auth/login directly, then
 *      redirects. The server-side hydration on the next render picks
 *      up the fresh cookie automatically.
 *   4. Logout IS performed through this context. `signOut()` clears the
 *      cookie via /api/auth/logout, then drops local state and calls
 *      `router.refresh()` so RSCs re-render with the empty auth state.
 *
 * Backward-compat:
 *  - The convenience flags `isLoggedIn` and `isMember` remain available.
 *    Existing consumers (Header, HeaderShell, FilterSidebar,
 *    DetailActions, InsiderGate) keep working unchanged.
 *  - `isMember` is an alias for "is Insider" — calculated by WordPress
 *    and read off the user object, never recomputed here (see
 *    architecture-rules.md "Derived fields — source of truth").
 */

interface AuthContextValue {
  /** Convenience: is there a logged-in user? */
  isLoggedIn: boolean
  /** Convenience: is the current user an Insider? */
  isMember: boolean
  /** Full user object, or `null` when logged out. */
  user: User | null
  /**
   * Log the user out: clears the cookie server-side, drops local state,
   * and refreshes RSCs. Safe to call when already logged out — the
   * /api/auth/logout endpoint is idempotent.
   */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  /**
   * Server-hydrated user. Set by `app/layout.tsx` after reading the
   * auth cookie. `null` means "logged out" (no cookie, or cookie was
   * rejected and cleared during the server render).
   */
  initialUser: User | null
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(initialUser)

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      // Network failure on logout is a strange state — the cookie may or
      // may not be cleared. We drop local state anyway so the UI matches
      // a logged-out view, and let the next request reconcile via the
      // server-side hydration.
      console.error('[auth] logout request failed', err)
    }
    setUser(null)
    router.refresh()
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: user !== null,
      isMember: userIsInsider(user),
      user,
      signOut,
    }),
    [user, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
