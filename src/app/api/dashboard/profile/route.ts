/**
 * POST /api/dashboard/profile
 *
 * Client → this route → WP `POST /md/v2/dashboard/profile`. The JWT lives in
 * an HttpOnly cookie the browser can't read, so writes proxy through here:
 * read the cookie, forward as Bearer. Mirrors the `/api/auth/*` pattern.
 *
 * Body: the camelCase `UserProfile` from the form; converted to the WP
 * snake_case shape here. Returns the updated `UserProfile`.
 */

import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'
import { mapUserProfile, toWpUserProfile } from '@/lib/dashboard/mappers'
import type { UserProfile } from '@/types/dashboard'

export async function POST(request: Request): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthenticated', message: 'Please sign in again.' },
      { status: 401 },
    )
  }

  let body: UserProfile
  try {
    body = (await request.json()) as UserProfile
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<Parameters<typeof mapUserProfile>[0]>(
      '/md/v2/dashboard/profile',
      { method: 'POST', bearer: token, body: toWpUserProfile(body) },
    )
    return NextResponse.json(mapUserProfile(raw), { status: 200 })
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    console.error('[api/dashboard/profile]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
