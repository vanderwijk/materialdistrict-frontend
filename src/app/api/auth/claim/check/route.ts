/**
 * GET /api/auth/claim/check?token=
 *
 * Anonymous peek of a claim token. Does not consume the token — mail scanners
 * must not burn the link before the person submits the form.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { claimCheck, WordPressAuthError, WordPressError } from '@/lib/api/wordpress'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  if (!token) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'This activation link is incomplete.' },
      { status: 400 },
    )
  }

  try {
    const data = await claimCheck(token)
    // Snake_case for the ClaimAccountForm client (matches WP response shape).
    return NextResponse.json(
      {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      },
      { status: 200 },
    )
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    if (err instanceof WordPressError) {
      return NextResponse.json({ code: 'md_wp_error', message: err.message }, { status: err.status })
    }
    console.error('[api/auth/claim/check]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
