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
import { hasAuthHint } from '@/lib/auth/auth-hint'
import { invalidateFollowsCache } from '@/lib/api/follows'

/**
 * AuthContext — auth state for the Next.js client.
 *
 * ## Why this is client-hydrated (changed — edge caching)
 *
 * Until now the root layout was a Server Component that read the auth
 * cookie on every render and passed the resolved User into this provider.
 * That gave a perfect first paint: the header was correct in the initial
 * HTML, no flash, no client fetch.
 *
 * It also made the entire site uncacheable. Reading `cookies()` during
 * render opts a route out of static rendering, and because the read sat in
 * the *root layout*, it opted out every route beneath it. The `revalidate`
 * values already declared on the content pages (material 6h, channel 1h,
 * home 10m) were configured correctly and never applied: production
 * answered `private, no-cache, no-store` with `x-vercel-cache: MISS` on
 * every HTML request. With crawler traffic running at multiples of real
 * traffic, every one of those hits re-rendered and re-queried WordPress.
 *
 * So auth moved here. The layout renders identically for everyone — which
 * is what makes the HTML cacheable — and this provider resolves the actual
 * user in the browser via `/api/auth/me`.
 *
 * ## Hydration flow
 *
 *   1. Server renders with no user. The HTML is visitor-independent and
 *      may be served from the edge cache to anyone.
 *   2. On mount we read the `md_signed_in` hint cookie (see
 *      `lib/auth/auth-hint.ts`). Absent → the visitor is anonymous, we
 *      settle immediately and make no network call. This is the path
 *      almost all traffic takes, so it stays free.
 *   3. Present → fetch `/api/auth/me` and adopt the result. Until it
 *      lands, `isAuthPending` is true and the header paints its
 *      signed-in shape without a name (see HeaderShell), so a member
 *      never watches a "Login" button flip into their avatar.
 *   4. A rejected session (401) is cleared server-side by that route; we
 *      settle on `null` and the UI is simply logged out.
 *
 * ## Revalidation
 *
 * The old implementation re-read auth on every server render, so a revoked
 * session corrected itself on the next navigation. Nothing re-renders on
 * the server now, so we re-check when the tab regains focus (throttled).
 * That covers the two cases that mattered: a session expiring while a tab
 * sits open, and signing in or out in another tab.
 *
 * ## Login / logout
 *
 * Unchanged. `/api/auth/login` and `/api/auth/register` set the HttpOnly
 * cookie (and now the hint alongside it) and return `{ user }`; the page
 * calls `signIn(user)` so the UI flips immediately. `signOut()` clears both
 * cookies via `/api/auth/logout` and refreshes any server-rendered routes
 * still in the tree (the dashboard, which stays dynamic).
 *
 * ## What did NOT change
 *
 * `isLoggedIn`, `isMember`, `user`, `signIn` and `signOut` keep their
 * meaning, so existing consumers (Header, FilterSidebar, DetailActions,
 * InsiderGate) work unchanged. `isMember` remains an alias for "is
 * Insider", calculated by WordPress and read off the user object, never
 * recomputed here (architecture-rules.md — "Derived fields").
 *
 * Security is unchanged: the hint cookie is a rendering signal with no
 * identity in it. Every gated action still presents the HttpOnly token to
 * WordPress, and Insider gating was already evaluated client-side through
 * `useAuth()` — no gated payload was ever embedded in the HTML that is now
 * cacheable.
 */

interface AuthContextValue {
  /** Convenience: is there a logged-in user? */
  isLoggedIn: boolean
  /** Convenience: is the current user an Insider? */
  isMember: boolean
  /** Full user object, or `null` when logged out. */
  user: User | null
  /**
   * True while we know a session probably exists (hint cookie present)
   * but `/api/auth/me` has not answered yet.
   *
   * Consumers that would otherwise paint a logged-out state should paint
   * a neutral or optimistic one instead. Never use this to grant access —
   * it means "unknown", not "allowed".
   */
  isAuthPending: boolean
  /**
   * Seed the context with a freshly-authenticated user. Called by the
   * /sign-in and /register pages after `/api/auth/login` (or `/register`)
   * has already set the cookies and returned `{ user }`.
   *
   * Makes no network call: the cookie is already set; this just brings the
   * React tree in sync.
   */
  signIn: (user: User) => void
  /**
   * Log the user out: clears the cookies server-side, drops local state,
   * and refreshes any server-rendered routes. Safe to call when already
   * logged out — `/api/auth/logout` is idempotent.
   */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Minimum gap between focus-triggered revalidations. */
const REVALIDATE_INTERVAL_MS = 60_000

type MeResponse = { user?: User | null }

async function fetchCurrentUser(signal?: AbortSignal): Promise<User | null> {
  const res = await fetch('/api/auth/me', {
    credentials: 'same-origin',
    // Never let a cached response decide who is logged in.
    cache: 'no-store',
    signal,
  })

  // 401 = cookie present but rejected; that route clears it. Anything else
  // unexpected is treated the same way: logged out, quietly.
  if (!res.ok) return null

  const data = (await res.json()) as MeResponse
  return data.user ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  /**
   * Starts `false` on both server and client so the first client render
   * matches the server HTML exactly — anything else is a hydration
   * mismatch. The mount effect flips it on immediately when the hint says
   * a session exists.
   */
  const [isAuthPending, setAuthPending] = useState(false)

  const lastCheckedRef = useRef<number>(0)
  const prevUserIdRef = useRef<number | null>(null)

  useEffect(() => {
    const nextUserId = user?.id ?? null
    if (prevUserIdRef.current !== nextUserId) {
      invalidateFollowsCache()
      prevUserIdRef.current = nextUserId
    }
  }, [user?.id])

  // ------------------------------------------------------------------
  // Initial hydration
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!hasAuthHint()) {
      // Anonymous visitor: settle without touching the network.
      lastCheckedRef.current = Date.now()
      return
    }

    const controller = new AbortController()
    setAuthPending(true)

    fetchCurrentUser(controller.signal)
      .then((resolved) => {
        setUser(resolved)
      })
      .catch(() => {
        // Aborted or offline — leave the user null; the focus handler
        // tries again when the tab comes back.
      })
      .finally(() => {
        lastCheckedRef.current = Date.now()
        setAuthPending(false)
      })

    return () => controller.abort()
  }, [])

  // ------------------------------------------------------------------
  // Revalidate on tab focus
  // ------------------------------------------------------------------
  useEffect(() => {
    function revalidate(): void {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastCheckedRef.current < REVALIDATE_INTERVAL_MS) return

      // No hint means signed out — including "signed out in another tab",
      // because logout clears the hint for the whole browser.
      if (!hasAuthHint()) {
        lastCheckedRef.current = Date.now()
        setUser((prev) => (prev === null ? prev : null))
        return
      }

      lastCheckedRef.current = Date.now()
      fetchCurrentUser()
        .then((resolved) => {
          setUser((prev) => {
            if (prev === resolved) return prev
            if (prev && resolved && prev.id === resolved.id) {
              // Same person: only re-render when something we display
              // actually moved (e.g. Insider status after a Stripe webhook).
              if (
                prev.membership?.isInsider === resolved.membership?.isInsider &&
                prev.membership?.tier === resolved.membership?.tier &&
                prev.membership?.status === resolved.membership?.status &&
                prev.brands?.length === resolved.brands?.length
              ) {
                return prev
              }
            }
            return resolved
          })
        })
        .catch(() => {
          // Network hiccup: keep showing what we have.
        })
    }

    document.addEventListener('visibilitychange', revalidate)
    window.addEventListener('focus', revalidate)

    return () => {
      document.removeEventListener('visibilitychange', revalidate)
      window.removeEventListener('focus', revalidate)
    }
  }, [])

  const signIn = useCallback((nextUser: User) => {
    setUser(nextUser)
    setAuthPending(false)
    lastCheckedRef.current = Date.now()
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      // Network failure on logout is a strange state — the cookie may or
      // may not be cleared. We drop local state anyway so the UI matches a
      // logged-out view, and the next revalidation reconciles.
      console.error('[auth] logout request failed', err)
    }
    setUser(null)
    setAuthPending(false)
    lastCheckedRef.current = Date.now()
    // Dashboard routes still render server-side; refresh so they re-run
    // their own auth gate instead of showing stale member content.
    router.refresh()
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: user !== null,
      isMember: userIsInsider(user),
      user,
      isAuthPending,
      signIn,
      signOut,
    }),
    [user, isAuthPending, signIn, signOut],
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
