/**
 * GET /api/consent/region
 *
 * Resolves the visitor's consent region from Vercel geo
 * (`x-vercel-ip-country`) and stores it in the `md_region` cookie.
 *
 * Why this exists as a route instead of middleware: middleware stamped the
 * cookie on the response of every navigation, and a response carrying
 * `Set-Cookie` is never cached by the CDN. That made every HTML request a
 * cache MISS — including crawler traffic, which is the overwhelming majority
 * of requests and carries no cookies at all.
 *
 * Route handlers are dynamic by definition, so writing a cookie here is free.
 * `RegionBootstrap` calls this once, client-side, only when the cookie is
 * missing. Crawlers run no JavaScript and therefore never reach it.
 *
 * Response: 200 `{ region: 'eu' | 'row' }`
 */

import { NextResponse, type NextRequest } from 'next/server'
import { REGION_COOKIE, regionFromCountry } from '@/lib/consent/eu-region'

export const dynamic = 'force-dynamic'

/** One week — geo rarely changes, and the client re-asks when it lapses. */
const REGION_MAX_AGE = 60 * 60 * 24 * 7

export async function GET(request: NextRequest): Promise<NextResponse> {
  const country = request.headers.get('x-vercel-ip-country')
  const region = regionFromCountry(country)

  const response = NextResponse.json({ region }, { status: 200 })

  response.cookies.set({
    name: REGION_COOKIE,
    value: region,
    path: '/',
    sameSite: 'lax',
    maxAge: REGION_MAX_AGE,
  })

  // Never cache: the answer is per-visitor.
  response.headers.set('Cache-Control', 'no-store')

  return response
}
