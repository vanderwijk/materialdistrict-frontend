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
 * Persistence (since session 6A — "Remember me" support):
 *  - `persistent = true` (default): set an explicit `Expires` attribute
 *    derived from `expiresAt`. The cookie survives browser restarts and
 *    expires at the same moment the JWT becomes invalid server-side.
 *  - `persistent = false`: omit the `Expires` attribute → the browser
 *    treats this as a session cookie and drops it when the user closes
 *    the browser. The token itself still expires after 7 days
 *    server-side as a safety net.
 *
 * Why session-cookie instead of a short max-age (e.g. 1 day):
 *  - "Remember me unchecked" universally maps to "forget me when I close
 *    the browser" in user expectation, not "forget me after N hours".
 *  - Avoids a second policy knob (cookie-lifetime vs token-lifetime).
 *
 * @param token       JWT as returned by `/wp-json/md/v2/auth/login`
 * @param expiresAt   Unix timestamp (seconds) when the token expires.
 *                    Used to set the cookie `Expires` attribute when
 *                    `persistent` is true.
 * @param persistent  Whether the cookie survives browser restarts.
 *                    Defaults to `true` for backward compatibility with
 *                    callers that don't pass the flag (e.g. registration
 *                    auto-login, where we want the same behaviour as a
 *                    fresh login with "remember me" ticked).
 */
export async function setAuthCookie(
  token: string,
  expiresAt: number,
  persistent: boolean = true,
): Promise<void> {
  const store = await cookies()

  store.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    // expiresAt is seconds since epoch; the cookies API takes a Date.
    // Omit `expires` entirely when non-persistent so the browser treats
    // it as a session cookie.
    ...(persistent ? { expires: new Date(expiresAt * 1000) } : {}),
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
