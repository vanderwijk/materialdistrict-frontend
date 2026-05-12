/**
 * GET /api/auth/me
 *
 * Returns the current user, or `null` if no one is logged in.
 *
 * Status codes (see batch 4 reasoning in session log):
 *   200 { user: User | null }  — normal cases (logged in OR anonymous).
 *                                Anonymous is a successful lookup, not an
 *                                error; the client gets one clean shape.
 *   401 { code, message }      — there WAS a cookie but WordPress rejected
 *                                it (expired / revoked). The cookie is
 *                                cleared so the next request is a clean
 *                                anonymous state.
 *   500 { code, message }      — unexpected backend failure.
 *
 * Distinguishing "no cookie" (200/null) from "bad cookie" (401) lets the
 * client tell apart "the user was never logged in" from "the user was
 * logged in but the session ended" — different UX (silent vs. nudge to
 * re-authenticate).
 */

import { NextResponse } from 'next/server'
import { getCurrentUser, WordPressAuthError } from '@/lib/api/wordpress'
import { clearAuthCookie, getAuthCookie } from '@/lib/auth/cookies'

export async function GET(): Promise<NextResponse> {
  const token = await getAuthCookie()

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  try {
    const auth = await getCurrentUser(token)
    return NextResponse.json({ user: auth.user }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      // Cookie present but rejected. Clear it so the client starts fresh
      // on the next request, and signal the rejection with 401.
      await clearAuthCookie()
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: 401 },
      )
    }
    console.error('[api/auth/me]', err)
    return NextResponse.json(
      {
        code: 'md_internal_error',
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 },
    )
  }
}
