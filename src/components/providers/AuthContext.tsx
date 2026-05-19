'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
 *   3. On subsequent soft navigations (router.push, Link clicks), the
 *      root layout re-renders, `getInitialUser()` runs again on the
 *      server, and a fresh `initialUser` is passed in. The provider
 *      keeps client state in sync with this server-authoritative value
 *      via a sync-effect (see below) — fixes the "auto-logout on
 *      navigation" issue that occurred before session 6A's follow-up.
 *
 * Login flow (session 6A — `signIn` added):
 *   The /sign-in and /register pages POST credentials directly to
 *   /api/auth/login or /api/auth/register. Those routes set the
 *   HttpOnly cookie AND return `{ user }` in the response body. The
 *   page then calls `signIn(user)` so this context's local state
 *   updates immediately — no flash of logged-out header between the
 *   redirect and the next server render.
 *
 *   After `signIn(user)`, the page navigates with `router.push(next) +
 *   router.refresh()`. The refresh re-runs the Server Components, and
 *   the sync-effect below reconciles client state with the new
 *   `initialUser` once it arrives.
 *
 *   Note: `signIn` only manages local context state. It does NOT call
 *   /api/auth/login itself — credentials never flow through this file.
 *
 * Logout:
 *   Performed through this context. `signOut()` clears the cookie via
 *   /api/auth/logout, drops local state, and calls `router.refresh()`
 *   so RSCs re-render with the empty auth state.
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
   * Seed the context with a freshly-authenticated user. Called by the
   * /sign-in and /register pages after `/api/auth/login` (or `/register`)
   * has already set the HttpOnly cookie and returned `{ user }` in its
   * response body.
   *
   * This does NOT make network calls. The cookie is already set; this
   * just brings the React tree in sync so the header / gated UI flips
   * to the logged-in state without waiting for the next server render.
   */
  signIn: (user: User) => void
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
   *
   * Re-evaluated on every server render (e.g. soft navigations,
   * router.refresh()), so this prop changes as the cookie state
   * changes server-side. The sync-effect below propagates those
   * changes into client state.
   */
  initialUser: User | null
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(initialUser)

  /**
   * Server-state sync.
   *
   * Why this exists:
   *   `useState(initialUser)` only consumes `initialUser` on the FIRST
   *   render. On subsequent navigations React keeps the existing state
   *   even if the prop changes. That caused two real bugs:
   *
   *   - "Auto-logout on navigation": a session cookie that expired or
   *     was revoked server-side → server hydrates `initialUser = null`
   *     on the next page → client still showed logged-in header. Gated
   *     actions then failed with 401. The UI was lying.
   *
   *   - "Stays logged-out after login on a stale tab": browser tab open
   *     since before login → AuthProvider mounted with `initialUser =
   *     null` → user logs in elsewhere (or via signIn here) → on
   *     navigation, server now gives a User but client state was stuck
   *     at null.
   *
   * The optimistic-update path (`signIn(user)`) still works first —
   * this effect only catches the case where the prop and state drift
   * apart. To avoid an unnecessary re-render when they already agree,
   * we compare by user-id (cheap and sufficient — User is replaced
   * atomically server-side, never mutated in place).
   *
   * The first-render case is handled by `useState(initialUser)` itself,
   * so we skip the effect on the initial mount. This avoids a redundant
   * setUser call that React would otherwise short-circuit anyway, but
   * also makes the intent explicit.
   */
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setUser((prev) => {
      // Same user (or both null) → don't trigger a re-render.
      if (prev === initialUser) return prev
      if (prev && initialUser && prev.id === initialUser.id) return prev
      return initialUser
    })
  }, [initialUser])

  const signIn = useCallback((nextUser: User) => {
    setUser(nextUser)
    // No router.refresh() here — the caller is expected to navigate
    // immediately (router.push(next) + router.refresh()) so the next
    // render reconciles with the cookie that was just set server-side.
  }, [])

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
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
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
