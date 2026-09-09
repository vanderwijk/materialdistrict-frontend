/**
 * GET /api/dashboard/email-change/check?token=
 *
 * Anonymous peek — shows the proposed new address without consuming the token.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { emailChangeCheck, WordPressAuthError, WordPressError } from '@/lib/api/wordpress'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  if (!token) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'This link is incomplete.' },
      { status: 400 },
    )
  }

  try {
    const data = await emailChangeCheck(token)
    return NextResponse.json({ new_email: data.newEmail }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.status })
    }
    if (err instanceof WordPressError) {
      return NextResponse.json({ code: 'md_wp_error', message: err.message }, { status: err.status })
    }
    console.error('[api/dashboard/email-change/check]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
