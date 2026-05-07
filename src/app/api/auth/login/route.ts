import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { WP_API_URL } from '@/lib/api/wordpress'
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  mapWPUser,
  type WPAuthLoginResponse,
  type WPRestError,
} from '@/lib/auth'

/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 *
 * Proxyt naar WP `/md/v2/auth/login`. Bij success:
 *   - JWT als httpOnly cookie op het Next.js-domein
 *   - response body bevat alleen de mapped User (nooit de JWT)
 */
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 },
    )
  }

  let wpRes: Response
  try {
    wpRes = await fetch(`${WP_API_URL}/md/v2/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the authentication service.' },
      { status: 502 },
    )
  }

  if (!wpRes.ok) {
    let payload: WPRestError = {}
    try {
      payload = (await wpRes.json()) as WPRestError
    } catch {
      // ignore — we vallen terug op een generieke melding
    }
    const message =
      payload.message ||
      (wpRes.status === 401 ? 'Invalid credentials.' : 'Login failed.')
    return NextResponse.json({ error: message }, { status: wpRes.status })
  }

  const data = (await wpRes.json()) as WPAuthLoginResponse
  if (!data?.token || !data?.user) {
    return NextResponse.json(
      { error: 'Unexpected response from authentication service.' },
      { status: 502 },
    )
  }

  const user = mapWPUser(data.user)

  // Cookie maxAge afstemmen op de echte JWT-expiry (in seconden)
  const nowSec = Math.floor(Date.now() / 1000)
  const lifetime = Math.max(60, data.expires_at - nowSec)

  const store = await cookies()
  store.set(SESSION_COOKIE, data.token, getSessionCookieOptions(lifetime))

  return NextResponse.json({ user })
}
