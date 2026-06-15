/**
 * Proxies WooCommerce Stripe `wc_stripe_update_order_status` AJAX.
 * Used after client-side PaymentIntent confirmation (iDEAL / 3DS).
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function wpAjaxBase(): string {
  const api = (process.env.WP_API_URL ?? 'https://materialdistrict.com/wp-json/').replace(
    /\/wp-json\/?$/,
    '',
  )
  return api.replace(/\/+$/, '')
}

export async function POST(request: Request): Promise<NextResponse> {
  const incoming = await request.text()
  const upstream = await fetch(`${wpAjaxBase()}/?wc-ajax=wc_stripe_update_order_status`, {
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
