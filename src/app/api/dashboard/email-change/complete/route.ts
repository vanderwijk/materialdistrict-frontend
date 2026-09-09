/**
 * POST /api/dashboard/email-change/complete
 *
 * Anonymous consume of the email-change token (clicked from the new inbox).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { emailChangeComplete, WordPressAuthError, WordPressError } from '@/lib/api/wordpress'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Invalid request.' },
      { status: 400 },
    )
  }

  const token = typeof (raw as { token?: unknown })?.token === 'string'
    ? (raw as { token: string }).token
    : ''

  if (!token) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Token is required.' },
      { status: 400 },
    )
  }

  try {
    const data = await emailChangeComplete(token)
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    if (err instanceof WordPressError) {
      return NextResponse.json({ code: 'md_wp_error', message: err.message }, { status: err.status })
    }
    console.error('[api/dashboard/email-change/complete]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
