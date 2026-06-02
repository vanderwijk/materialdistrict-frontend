/**
 * Shared helpers for the `/api/dashboard/*` route handlers: read the JWT from
 * the HttpOnly cookie, and turn a `DashboardApiError` into a `{ code, message }`
 * response with the right status. Keeps each route handler thin.
 */

import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { DashboardApiError } from '@/lib/api/dashboard'

/** Returns the token, or a ready-to-return 401 response when no cookie. */
export async function getTokenOr401(): Promise<
  { token: string; error: null } | { token: null; error: NextResponse }
> {
  const token = await getAuthCookie()
  if (!token) {
    return {
      token: null,
      error: NextResponse.json(
        { code: 'md_auth_unauthenticated', message: 'Please sign in again.' },
        { status: 401 },
      ),
    }
  }
  return { token, error: null }
}

/** Map a thrown error to a JSON response (forwards `md_dashboard_*` cleanly). */
export function dashboardError(err: unknown, tag: string): NextResponse {
  if (err instanceof DashboardApiError) {
    return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
  }
  console.error(`[api/dashboard/${tag}]`, err)
  return NextResponse.json(
    { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
    { status: 500 },
  )
}
