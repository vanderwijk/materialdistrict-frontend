/**
 * Helpers for translating `/api/auth/*` error responses into UI state.
 *
 * Used by /sign-in, /register, /forgot-password and /reset-password so
 * they all handle the WP error envelope (`{ code, message }`) the same
 * way.
 *
 * The frontend renders the `message` field directly (English copy lives
 * in WordPress, per `wordpress-instructions-auth.md` §6). The `code` is
 * used for UI branching — currently only to decide which field to focus
 * after an error.
 */

import type { AuthErrorCode } from '@/types/shared'

/**
 * Shape returned by every `/api/auth/*` route on failure. Subset of
 * `AuthErrorResponse` from `@/types/shared` (the Next.js routes strip
 * the `data.status` mirror since the HTTP status already carries it).
 */
export interface ApiAuthError {
  code: AuthErrorCode | 'md_invalid_request' | 'md_internal_error'
  message: string
}

/**
 * Best guess at JSON-parsing a fetch response into an ApiAuthError.
 * Falls back to a generic message if the body is missing or malformed.
 *
 * Why this exists: every page does the same `await res.json().catch(…)`
 * dance otherwise.
 */
export async function parseAuthErrorResponse(
  res: Response,
): Promise<ApiAuthError> {
  try {
    const body = (await res.json()) as Partial<ApiAuthError>
    if (typeof body.code === 'string' && typeof body.message === 'string') {
      return body as ApiAuthError
    }
  } catch {
    // Fall through to generic error below.
  }
  return {
    code: 'md_internal_error',
    message: 'Something went wrong. Please try again.',
  }
}

/**
 * Which input should receive focus after a given error code.
 * Returns `null` for codes that don't map to a single field.
 */
export function focusFieldForCode(
  code: ApiAuthError['code'],
): 'email' | 'password' | 'firstName' | 'lastName' | null {
  switch (code) {
    case 'md_auth_invalid_email':
    case 'md_auth_email_taken':
      return 'email'
    case 'md_auth_weak_password':
    case 'md_auth_failed':
      return 'password'
    default:
      return null
  }
}
