/**
 * POST /api/auth/register
 *
 * Body: { email, password, firstName?, lastName?, accountType?, profession?, organisation? }
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
 * The WordPress register endpoint is live (handoff S12) and accepts an
 * optional `account_type` (specifier | manufacturer). A manufacturer
 * registration creates a connected brand (tier: free) in the response.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { registerUser, WordPressAuthError } from '@/lib/api/wordpress'
import { setAuthCookie } from '@/lib/auth/cookies'

interface RegisterBody {
  email: string
  password: string
  firstName: string
  lastName: string
  accountType: 'specifier' | 'manufacturer'
  profession?: string
  organisation?: string
}

function parseRegisterBody(raw: unknown): RegisterBody | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (typeof b.email !== 'string' || b.email.length === 0) return null
  if (typeof b.password !== 'string' || b.password.length === 0) return null
  const accountType =
    b.accountType === 'manufacturer' ? 'manufacturer' : 'specifier'
  return {
    email: b.email,
    password: b.password,
    firstName: typeof b.firstName === 'string' ? b.firstName : '',
    lastName: typeof b.lastName === 'string' ? b.lastName : '',
    accountType,
    profession: typeof b.profession === 'string' ? b.profession : undefined,
    organisation: typeof b.organisation === 'string' ? b.organisation : undefined,
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
