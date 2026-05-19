/**
 * POST /api/auth/register
 *
 * Body: { email: string, password: string, firstName: string, lastName: string }
 *
 * On success:
 *   - sets the HttpOnly auth cookie (persistent — a freshly created
 *     account behaves like a fresh login with "remember me" ticked)
 *   - returns 200 with `{ user }` so the client can hydrate the UI
 *     without an extra round trip to /api/auth/me
 *
 * Error responses use the shape `{ code, message }`:
 *   - 400 md_invalid_request     — body shape is wrong (no WP call made)
 *   - WP md_auth_* errors are forwarded verbatim with the original status
 *     (md_auth_invalid_request, md_auth_invalid_email, md_auth_email_taken,
 *     md_auth_weak_password)
 *   - 500 md_internal_error      — unexpected backend failure
 *
 * Note: the WordPress register endpoint is not yet implemented at the
 * time this route was written (session 6A). See
 * `wordpress-instructions-register.md` for the contract Johan is to
 * implement. Until Johan ships, this route will fail with a generic
 * WordPressError → 500 to the user. That is expected and intentional —
 * the contract is fixed; only the WP side is pending.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { registerUser, WordPressAuthError } from '@/lib/api/wordpress'
import { setAuthCookie } from '@/lib/auth/cookies'

interface RegisterBody {
  email: string
  password: string
  firstName: string
  lastName: string
}

function parseRegisterBody(raw: unknown): RegisterBody | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (typeof b.email !== 'string' || b.email.length === 0) return null
  if (typeof b.password !== 'string' || b.password.length === 0) return null
  if (typeof b.firstName !== 'string' || b.firstName.length === 0) return null
  if (typeof b.lastName !== 'string' || b.lastName.length === 0) return null
  return {
    email: b.email,
    password: b.password,
    firstName: b.firstName,
    lastName: b.lastName,
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      {
        code: 'md_invalid_request',
        message: 'All fields are required.',
      },
      { status: 400 },
    )
  }

  const body = parseRegisterBody(raw)
  if (!body) {
    return NextResponse.json(
      {
        code: 'md_invalid_request',
        message: 'All fields are required.',
      },
      { status: 400 },
    )
  }

  try {
    const auth = await registerUser(body)
    // Persistent cookie — same as login with "remember me" ticked.
    // A user who just created an account expects to stay signed in.
    await setAuthCookie(auth.token, auth.expiresAt, true)
    return NextResponse.json({ user: auth.user }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/auth/register]', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}
