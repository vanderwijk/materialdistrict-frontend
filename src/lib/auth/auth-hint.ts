/**
 * Auth hint — "is someone signed in?", readable by the client.
 * ----------------------------------------------------------------------
 * Deliberately separate from `cookies.ts`, which imports `next/headers`
 * and is therefore server-only. This module is isomorphic so both sides
 * can agree on one cookie name without dragging server APIs into the
 * client bundle.
 *
 * Why the hint exists: the root layout no longer reads the auth cookie
 * during render — that single read opted every route out of static
 * rendering and made the whole site uncacheable at the edge. Auth is now
 * hydrated client-side from `/api/auth/me`.
 *
 * The trade-off that creates: on first paint the client cannot tell an
 * anonymous visitor from a signed-in one, and would paint the logged-out
 * header for everybody. This flag answers that one question.
 *
 * **It is a rendering hint, never an authorisation signal.** It holds no
 * identity, no token and no membership state — only `1`. Anyone can set it
 * by hand; all that buys them is a header that briefly shows "Account"
 * before `/api/auth/me` returns `null` and the UI corrects itself. Every
 * gated action validates the HttpOnly token server-side, as before.
 */

/** Name of the readable companion flag to `md_auth_token`. */
export const AUTH_HINT_COOKIE_NAME = 'md_signed_in'

/**
 * True when the hint cookie is present in this browser.
 *
 * Returns `false` during server rendering (no `document`), which is the
 * correct default: the cached HTML must be identical for every visitor.
 */
export function hasAuthHint(): boolean {
  if (typeof document === 'undefined') return false

  return document.cookie
    .split('; ')
    .some((part) => part.startsWith(`${AUTH_HINT_COOKIE_NAME}=`))
}
