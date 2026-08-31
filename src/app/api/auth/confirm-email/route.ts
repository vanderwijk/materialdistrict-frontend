/**
 * POST /api/auth/confirm-email
 *
 * Body: { key: string, userId: number }
 *
 * Thin proxy to WordPress `/md/v2/auth/confirm-email`. Anonymous-safe on
 * purpose: the link is clicked from an email client that may not carry the
 * session, and often on a different device from the one that registered.
 * The key itself is the credential.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { confirmEmail, WordPressAuthError } from '@/lib/api/wordpress'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Invalid request.' },
      { status: 400 },
    )
  }

  const body = raw as Record<string, unknown>
  const key = typeof body?.key === 'string' ? body.key : ''
  const userId = Number(body?.userId)

  if (!key || !Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'This confirmation link is not valid.' },
      { status: 400 },
    )
  }

  try {
    const result = await confirmEmail(key, userId)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.status },
      )
    }
    console.error('[api/auth/confirm-email]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
