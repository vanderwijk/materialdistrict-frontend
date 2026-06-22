/**
 * Shared server-side auth hydration.
 *
 * Reads the HttpOnly auth cookie and resolves the current `User` (or `null`).
 * Extracted so route segments beyond the root layout — notably the dashboard
 * layout, which must redirect anonymous visitors — read auth the same way the
 * root layout does, with the same error handling and request-level dedup.
 *
 * Wrapped in React.cache() so the layout and any nested Server Components that
 * call it within one render trigger a single WordPress request. `cache()`
 * resets per request, so there is no cross-request staleness.
 */

import { cache } from 'react'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'
import type { User } from '@/types/shared'

export const getInitialUser = cache(async (): Promise<User | null> => {
  const token = await getAuthCookie()
  if (!token) return null

  try {
    const auth = await getCurrentUser(token)
    return auth.user
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      // Invalid/expired token. We deliberately do NOT clear the cookie here:
      // getInitialUser runs during render (root/dashboard layout hydration),
      // and Next.js forbids cookie mutation outside a Server Action or Route
      // Handler. Treat the visitor as logged-out instead — the stale cookie is
      // re-validated on every request and is overwritten on the next login or
      // cleared explicitly via the logout / /api/auth/me route handlers.
      return null
    }
    console.error('[auth] hydration failed', err)
    return null
  }
})
