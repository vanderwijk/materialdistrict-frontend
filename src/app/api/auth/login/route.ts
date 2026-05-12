/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 *
 * On success:
 *   - sets the HttpOnly auth cookie
 *   - returns 200 with `{ user }` so the client can hydrate the UI
 *     without an extra round trip to /api/auth/me
 *
 * Error responses use the shape `{ code, message }`:
 *   - 400 md_invalid_request  — body shape is wrong (no WP call made)
 *   - WP md_auth_* errors are forwarded verbatim with the original status
 *   - 500 md_internal_error   — unexpected backend failure
 *
 * The cookie is the single source of truth for token expiry; we do not
 * echo `expiresAt` back to the client.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { loginUser, WordPressAuthError } from '@/lib/api/wordpress'
import { setAuthCookie } from '@/lib/auth/cookies'

interface LoginBody {
  email: string
  password: string
}

function parseLoginBody(raw: unknown): LoginBody | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (typeof b.email !== 'string' || typeof b.password !== 'string') return null
  if (b.email.length === 0 || b.password.length === 0) return null
  return { email: b.email, password: b.password }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Email and password are required.' },
      { status: 400 },
    )
  }

  const body = parseLoginBody(raw)
  if (!body) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Email and password are required.' },
      { status: 400 },
    )
  }

  try {
    const auth = await loginUser(body.email, body.password)
    await setAuthCookie(auth.token, auth.expiresAt)
    return NextResponse.json({ user: auth.user }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/auth/login]', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}
