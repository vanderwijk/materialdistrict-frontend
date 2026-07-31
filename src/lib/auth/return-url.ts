/**
 * Build /sign-in or /register links that preserve where the user came from.
 *
 * The sign-in / register pages already honour `?next=` (and sanitize it
 * server-side). Callers only need to pass the current pathname.
 */

const AUTH_PATHS = new Set(['/sign-in', '/register', '/forgot-password'])

/** Refuse open redirects: only in-site paths starting with a single `/`. */
export function isSafeInternalPath(path: string): boolean {
  if (!path || path[0] !== '/') return false
  if (path.length > 1 && (path[1] === '/' || path[1] === '\\')) return false
  return true
}

function isAuthPage(pathname: string): boolean {
  if (AUTH_PATHS.has(pathname)) return true
  if (pathname.startsWith('/reset-password')) return true
  return false
}

/**
 * `/sign-in?next=/channel/foo/` (or plain `/sign-in` when next is unusable).
 */
export function authHref(
  authPath: '/sign-in' | '/register',
  nextPathname: string | null | undefined,
): string {
  if (!nextPathname || !isSafeInternalPath(nextPathname) || isAuthPage(nextPathname)) {
    return authPath
  }
  return `${authPath}?next=${encodeURIComponent(nextPathname)}`
}
