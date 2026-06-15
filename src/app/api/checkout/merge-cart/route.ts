/**
 * POST /api/checkout/merge-cart → WP `POST /md/v2/checkout/merge-cart`
 */

import { NextResponse } from 'next/server'
import { WP_API_URL } from '@/lib/api/wordpress'
import { getAuthCookie } from '@/lib/auth/cookies'

export async function POST(request: Request): Promise<NextResponse> {
  const token = await getAuthCookie()
  if (!token) {
    return NextResponse.json(
      { code: 'md_auth_unauthenticated', message: 'Please sign in again.' },
      { status: 401 },
    )
  }

  const cartToken = request.headers.get('cart-token') ?? request.headers.get('Cart-Token')
  if (!cartToken) {
    return NextResponse.json(
      { code: 'md_checkout_missing_cart_token', message: 'Cart session is missing.' },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${WP_API_URL}/md/v2/checkout/merge-cart`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Cart-Token': cartToken,
    },
    cache: 'no-store',
  })

  const payload = await upstream.json().catch(() => ({}))
  return NextResponse.json(payload, { status: upstream.status })
}
