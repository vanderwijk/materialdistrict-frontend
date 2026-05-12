/**
 * Auth cookie helpers
 * ----------------------------------------------------------------------
 * Server-side helpers for reading, writing and clearing the JWT cookie
 * that proves a user is logged in.
 *
 * Why a cookie (not localStorage):
 *  - HttpOnly means JavaScript cannot read the token → XSS protection.
 *  - The token rides every request automatically, including the very
 *    first request of a fresh tab → no flash-of-logged-out before
 *    client-side hydration.
 *  - SameSite=Lax keeps the cookie on top-level navigations (deep links
 *    from email/social keep the user logged in) but blocks the cookie
 *    on cross-site sub-requests → CSRF protection.
 *
 * See `auth-strategy.md` v0.2 and `architecture-rules.md` for the
 * underlying rationale.
 *
 * Usage:
 *  - These functions only work inside a Server Component, Route Handler,
 *    or Server Action (anywhere the Next.js `cookies()` API is available).
 *  - For client components that need to know whether the user is logged
 *    in, read from `useAuth()` instead — the AuthContext is hydrated
 *    server-side from `getAuthCookie()` + `getCurrentUser()`.
 */

import { cookies } from 'next/headers'

// --------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------

/**
 * Cookie name. Prefixed with `md_` so it does not collide with the
 * WordPress `wordpress_logged_in_*` cookies that may live on the same
 * apex domain (e.g. when both systems run under `materialdistrict.com`).
 */
export const AUTH_COOKIE_NAME = 'md_auth_token'

/**
 * `Secure` is required in production but blocks the cookie in plain-HTTP
 * dev. We toggle on `NODE_ENV` so local development over http://localhost
 * still works.
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// --------------------------------------------------------------------
// Write
// --------------------------------------------------------------------

/**
 * Store the JWT in an HttpOnly cookie.
 *
 * @param token       JWT as returned by `/wp-json/md/v2/auth/login`
 * @param expiresAt   Unix timestamp (seconds) when the token expires.
 *                    Used to set the cookie `Expires` attribute so the
 *                    browser cleans it up at the same moment the token
 *                    becomes invalid server-side.
 */
export async function setAuthCookie(
  token: string,
  expiresAt: number,
): Promise<void> {
  const store = await cookies()

  // expiresAt is seconds since epoch; the cookies API takes a Date.
  const expires = new Date(expiresAt * 1000)

  store.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    expires,
    // No `domain` attribute — defaults to the exact host that set it,
    // which is safer than scoping to the apex domain.
  })
}

// --------------------------------------------------------------------
// Read
// --------------------------------------------------------------------

/**
 * Read the JWT from the cookie store. Returns `null` if the cookie is
 * absent or empty.
 *
 * Note: this does NOT validate the token — it only reads the raw value.
 * Validation happens server-side by passing the token to WordPress via
 * `getCurrentUser()`. If WordPress rejects it, the route handler should
 * clear the cookie via `clearAuthCookie()` so the next request is a
 * clean logged-out state.
 */
export async function getAuthCookie(): Promise<string | null> {
  const store = await cookies()
  const entry = store.get(AUTH_COOKIE_NAME)
  if (!entry?.value) return null
  return entry.value
}

// --------------------------------------------------------------------
// Clear
// --------------------------------------------------------------------

/**
 * Remove the auth cookie. Used on logout and when the server detects an
 * invalid or expired token.
 *
 * Implementation note: Next.js exposes `delete()` on the cookie store,
 * which sets `Max-Age=0` under the hood and instructs the browser to
 * drop the cookie immediately.
 */
export async function clearAuthCookie(): Promise<void> {
  const store = await cookies()
  store.delete(AUTH_COOKIE_NAME)
}
