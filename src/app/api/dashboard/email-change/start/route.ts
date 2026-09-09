/**
 * POST /api/dashboard/email-change/start
 *
 * Authenticated: mails a confirmation link to the new address and a notice to
 * the current one. Does not change user_email until complete.
 */

import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth/cookies'
import { wpDashboardFetch, DashboardApiError } from '@/lib/api/dashboard'

export async function POST(request: Request): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthenticated', message: 'Please sign in again.' },
      { status: 401 },
    )
  }

  let body: { email?: string }
  try {
    body = (await request.json()) as { email?: string }
  } catch {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    )
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!email) {
    return NextResponse.json(
      { code: 'md_dashboard_invalid_request', message: 'A valid email address is required.' },
      { status: 400 },
    )
  }

  try {
    const raw = await wpDashboardFetch<{ pending_email?: string; message?: string }>(
      '/md/v2/dashboard/email-change/start',
      { method: 'POST', bearer: token, body: { email } },
    )
    return NextResponse.json(raw, { status: 200 })
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    console.error('[api/dashboard/email-change/start]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
