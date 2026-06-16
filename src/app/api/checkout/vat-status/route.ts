/**
 * POST /api/checkout/vat-status -> WP `POST /md/v2/checkout/vat-status`
 */

import { NextResponse } from 'next/server'
import { WP_API_URL } from '@/lib/api/wordpress'

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Country and VAT number are required.' },
      { status: 400 },
    )
  }

  const country =
    typeof (body as { country?: unknown })?.country === 'string'
      ? (body as { country: string }).country.trim()
      : ''
  const vat_number =
    typeof (body as { vat_number?: unknown })?.vat_number === 'string'
      ? (body as { vat_number: string }).vat_number.trim()
      : ''

  if (!country || !vat_number) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Country and VAT number are required.' },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${WP_API_URL}/md/v2/checkout/vat-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ country, vat_number }),
    cache: 'no-store',
  })

  const payload = await upstream.json().catch(() => ({}))
  return NextResponse.json(payload, { status: upstream.status })
}

