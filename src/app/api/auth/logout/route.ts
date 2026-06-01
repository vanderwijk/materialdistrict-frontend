/**
 * POST /api/auth/logout
 *
 * Clears the auth cookie (`md_auth_token`) and returns 204 No Content.
 *
 * Idempotent: clearing an absent cookie is a no-op, so calling logout when
 * already logged out is safe — `AuthContext.signOut()` relies on this.
 *
 * Flow: the client (`AuthContext.signOut`) awaits this request, then drops
 * local state and calls `router.refresh()`. The next server render hydrates
 * a clean anonymous state because the cookie is gone (see
 * `app/layout.tsx` `getInitialUser`).
 *
 * Documented in `auth-strategy.md` §3 ("Uitloggen") and session-log r944
 * (POST → cookie wissen → 204).
 */

import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/cookies'

export async function POST(): Promise<NextResponse> {
  await clearAuthCookie()
  return new NextResponse(null, { status: 204 })
}
