import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, getSessionCookieOptions } from '@/lib/auth'

/**
 * POST /api/auth/logout
 *
 * Wist de session-cookie op het Next.js-domein. Geeft 204.
 *
 * Note: WP heeft geen blacklist — een uitgegeven JWT blijft technisch geldig
 * tot zijn `exp`. Voor een lezerssite is dat acceptabel; bij gevoeliger
 * acties kunnen we later een token-revocation-store overwegen.
 */
export async function POST() {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', { ...getSessionCookieOptions(0), maxAge: 0 })
  return new NextResponse(null, { status: 204 })
}
