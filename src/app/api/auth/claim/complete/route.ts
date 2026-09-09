/**
 * POST /api/auth/claim/complete
 *
 * Consumes the claim token, activates the contact as a subscriber, and issues
 * a session cookie — same shape as register/login.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { claimComplete, WordPressAuthError, WordPressError } from '@/lib/api/wordpress'
import { setAuthCookie } from '@/lib/auth/cookies'

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

  const body = raw as Record<string, unknown>
  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const accountType = typeof body.accountType === 'string' ? body.accountType : ''

  if (!token || !password || !accountType) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Token, password and account type are required.' },
      { status: 400 },
    )
  }

  try {
    const auth = await claimComplete({
      token,
      password,
      accountType,
      firstName: typeof body.firstName === 'string' ? body.firstName : '',
      lastName: typeof body.lastName === 'string' ? body.lastName : '',
      profession: typeof body.profession === 'string' ? body.profession : undefined,
      organisation: typeof body.organisation === 'string' ? body.organisation : undefined,
    })
    await setAuthCookie(auth.token, auth.expiresAt, true)
    return NextResponse.json({ user: auth.user }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    if (err instanceof WordPressError) {
      return NextResponse.json({ code: 'md_wp_error', message: err.message }, { status: err.status })
    }
    console.error('[api/auth/claim/complete]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
