/**
 * POST /api/auth/resend-confirmation
 *
 * Re-sends the confirmation email for the signed-in user. Requires the auth
 * cookie — unlike the confirm route, there is no key to act as a credential,
 * so the session is what identifies who to mail.
 */

import { NextResponse } from 'next/server'
import { resendConfirmation, WordPressAuthError } from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'

export async function POST(): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthorized', message: 'You must be signed in to do that.' },
      { status: 401 },
    )
  }

  try {
    await resendConfirmation(token)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/auth/resend-confirmation]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
