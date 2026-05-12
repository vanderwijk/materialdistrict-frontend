/**
 * POST /api/auth/reset-password
 *
 * Body: { token: string, newPassword: string }
 *
 * Completes the password reset using the one-time token from the
 * password-reset email link. WordPress validates the token (must exist,
 * must not be expired, must not have been used) and checks the new
 * password against the server-side strength rules before updating the
 * user.
 *
 * Note on the body shape: we accept camelCase (`newPassword`) at the
 * Next.js layer — that is our API. The `wordpress.ts` client converts
 * it to snake_case (`new_password`) for the WordPress endpoint.
 *
 * Status codes:
 *   200 { ok: true }                — password successfully reset
 *   400 md_invalid_request          — body shape is wrong (no WP call)
 *   WP md_auth_invalid_token (400/410) — token unknown / expired / used
 *   WP md_auth_weak_password (400)  — new password fails strength rules
 *   500 md_internal_error           — unexpected backend failure
 *
 * Successful reset does NOT log the user in — they navigate to the
 * login page and sign in with the new password. Keeps the reset flow
 * decoupled from the login flow and makes the security boundary
 * clearer (the reset email link is a one-shot capability, not a
 * session grant).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { resetPassword, WordPressAuthError } from '@/lib/api/wordpress'

interface ResetBody {
  token: string
  newPassword: string
}

function parseResetBody(raw: unknown): ResetBody | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (typeof b.token !== 'string' || b.token.length === 0) return null
  if (typeof b.newPassword !== 'string' || b.newPassword.length === 0) return null
  return { token: b.token, newPassword: b.newPassword }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      {
        code: 'md_invalid_request',
        message: 'Token and new password are required.',
      },
      { status: 400 },
    )
  }

  const body = parseResetBody(raw)
  if (!body) {
    return NextResponse.json(
      {
        code: 'md_invalid_request',
        message: 'Token and new password are required.',
      },
      { status: 400 },
    )
  }

  try {
    await resetPassword(body.token, body.newPassword)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/auth/reset-password]', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}
