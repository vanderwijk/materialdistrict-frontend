/**
 * Proxies WooCommerce Stripe `wc_stripe_update_order_status` AJAX.
 * Used after client-side PaymentIntent confirmation (iDEAL / 3DS).
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function wpAjaxBase(): string {
  const api = process.env.WP_API_URL?.replace(/\/wp-json\/?$/, '').replace(/\/+$/, '')
  if (!api) {
    throw new Error('WP_API_URL is not configured')
  }
  return api
}

export async function POST(request: Request): Promise<NextResponse> {
  let ajaxBase: string
  try {
    ajaxBase = wpAjaxBase()
  } catch {
    return NextResponse.json(
      { code: 'md_config_error', message: 'WP_API_URL is not configured' },
      { status: 503 },
    )
  }

  const incoming = await request.text()
  const upstream = await fetch(`${ajaxBase}/?wc-ajax=wc_stripe_update_order_status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: incoming,
    cache: 'no-store',
  })

  const payload = await upstream.text()
  return new NextResponse(payload, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })
}
