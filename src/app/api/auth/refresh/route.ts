import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { WP_API_URL } from '@/lib/api/wordpress'
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  mapWPUser,
  type WPAuthLoginResponse,
} from '@/lib/auth'
import { getSessionToken } from '@/lib/auth/server'

/**
 * POST /api/auth/refresh
 *
 * Vraagt een nieuwe JWT bij WP op basis van de huidige cookie en zet die
 * cookie terug. Geeft `{ user }` terug zodat de client direct kan refreshen.
 *
 * Wordt voorlopig niet automatisch aangeroepen door de AuthProvider — er is
 * nog geen front-end UI voor "session is bijna verlopen". Deze route ligt
 * klaar zodat we 'm later kunnen activeren (bijv. via een client-side
 * scheduler vlak voor exp).
 */
export async function POST() {
  const token = await getSessionToken()
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  let wpRes: Response
  try {
    wpRes = await fetch(`${WP_API_URL}/md/v2/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the authentication service.' },
      { status: 502 },
    )
  }

  if (!wpRes.ok) {
    return NextResponse.json(
      { error: 'Refresh failed.' },
      { status: wpRes.status },
    )
  }

  const data = (await wpRes.json()) as WPAuthLoginResponse
  if (!data?.token || !data?.user) {
    return NextResponse.json(
      { error: 'Unexpected response from authentication service.' },
      { status: 502 },
    )
  }

  const user = mapWPUser(data.user)

  const nowSec = Math.floor(Date.now() / 1000)
  const lifetime = Math.max(60, data.expires_at - nowSec)

  const store = await cookies()
  store.set(SESSION_COOKIE, data.token, getSessionCookieOptions(lifetime))

  return NextResponse.json({ user })
}
