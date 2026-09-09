/**
 * POST /api/dashboard/email-change/cancel
 *
 * Authenticated: clears the pending-email meta. The one-time token still
 * expires on its own (1 day).
 */

import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'

export async function POST(): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthenticated', message: 'Please sign in again.' },
      { status: 401 },
    )
  }

  try {
    const raw = await wpDashboardFetch<{ message?: string }>(
      '/md/v2/dashboard/email-change/cancel',
      { method: 'POST', bearer: token },
    )
    return NextResponse.json(raw ?? { message: 'Cancelled.' }, { status: 200 })
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    console.error('[api/dashboard/email-change/cancel]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
