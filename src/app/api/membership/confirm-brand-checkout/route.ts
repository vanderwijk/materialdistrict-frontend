/**
 * POST /api/membership/confirm-brand-checkout
 *
 * After Stripe redirects to
 * /dashboard/brands/[slug]/membership?checkout=success&session_id=…,
 * the client calls this to activate the brand tier without waiting for the
 * Stripe → CMS webhook.
 *
 * Proxies to WP `POST /md/v2/checkout/brand/confirm` with the auth cookie.
 */

import { NextResponse } from 'next/server'
import {
  confirmBrandCheckout,
  WordPressAuthError,
  WordPressError,
} from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'

interface ConfirmBody {
  session_id?: string
  brand_id?: number
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthenticated', message: 'Not signed in.' },
      { status: 401 },
    )
  }

  let body: ConfirmBody
  try {
    body = (await request.json()) as ConfirmBody
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_json', message: 'Invalid JSON body.' },
      { status: 400 },
    )
  }

  const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : ''
  const brandId = typeof body.brand_id === 'number' ? body.brand_id : Number(body.brand_id)

  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json(
      { code: 'md_checkout_invalid_request', message: 'Valid session_id required.' },
      { status: 400 },
    )
  }
  if (!Number.isFinite(brandId) || brandId <= 0) {
    return NextResponse.json(
      { code: 'md_checkout_invalid_request', message: 'Valid brand_id required.' },
      { status: 400 },
    )
  }

  try {
    const result = await confirmBrandCheckout(token, {
      sessionId,
      brandId,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof WordPressAuthError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: 401 },
      )
    }
    if (err instanceof WordPressError) {
      const bodyUnknown = err.body
      const code =
        typeof bodyUnknown === 'object' &&
        bodyUnknown !== null &&
        'code' in bodyUnknown &&
        typeof (bodyUnknown as { code: unknown }).code === 'string'
          ? (bodyUnknown as { code: string }).code
          : 'md_checkout_confirm_failed'
      return NextResponse.json(
        { code, message: err.message },
        { status: err.status || 502 },
      )
    }
    console.error('[api/membership/confirm-brand-checkout]', err)
    return NextResponse.json(
      { code: 'md_internal_error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
