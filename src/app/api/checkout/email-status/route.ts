/**
 * POST /api/checkout/email-status → WP `POST /md/v2/checkout/email-status`
 */

import { NextResponse } from 'next/server'
import { WP_API_URL } from '@/lib/api/wordpress'

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Email is required.' },
      { status: 400 },
    )
  }

  const email = typeof (body as { email?: unknown })?.email === 'string'
    ? (body as { email: string }).email.trim()
    : ''

  if (!email) {
    return NextResponse.json(
      { code: 'md_invalid_request', message: 'Email is required.' },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${WP_API_URL}/md/v2/checkout/email-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  })

  const payload = await upstream.json().catch(() => ({}))
  return NextResponse.json(payload, { status: upstream.status })
}
