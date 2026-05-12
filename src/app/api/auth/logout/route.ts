/**
 * POST /api/auth/logout
 *
 * Clears the auth cookie. Always succeeds — even if there was no cookie
 * to begin with, the response is the same. Idempotent.
 *
 * Returns 204 No Content on success.
 */

import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/cookies'

export async function POST(): Promise<NextResponse> {
  await clearAuthCookie()
  return new NextResponse(null, { status: 204 })
}
