/**
 * POST /api/auth/forgot-password
 *
 * Body: { email: string }
 *
 * Always returns a neutral 200 response regardless of whether the email
 * exists in WordPress — this is enforced by WordPress as well, and
 * prevents user enumeration. The client shows the same confirmation
 * message in every case.
 *
 * Rate limiting (3 requests per email per hour) lives in WordPress, not
 * here. If WordPress applies the limit it returns an `md_auth_*` error
 * which we forward verbatim.
 *
 * Status codes:
 *   200 { ok: true }              — request accepted (no info about email)
 *   400 md_invalid_request        — body shape is wrong (no WP call made)
 *   WP md_auth_*                  — forwarded verbatim
 *   500 md_internal_error         — unexpected backend failure
 */

import { NextResponse, type NextRequest } from 'next/server'
import { forgotPassword, WordPressAuthError } from '@/lib/api/wordpress'

interface ForgotBody {
  email: string
}

function parseForgotBody(raw: unknown): ForgotBody | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (typeof b.email !== 'string' || b.email.length === 0) return null
  return { email: b.email }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Email is required.' },
      { status: 400 },
    )
  }

  const body = parseForgotBody(raw)
  if (!body) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Email is required.' },
      { status: 400 },
    )
  }

  try {
    await forgotPassword(body.email)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/auth/forgot-password]', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}
