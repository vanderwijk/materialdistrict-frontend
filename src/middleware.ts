import { NextResponse, type NextRequest } from 'next/server'
import { REGION_COOKIE, regionFromCountry } from '@/lib/consent/eu-region'
import { PATHNAME_HEADER } from '@/lib/auth/request-path'

/**
 * Two jobs, one pass.
 *
 * 1. **Consent region.** Stamp the visitor's consent region from Vercel geo
 *    (`x-vercel-ip-country`). Privacy & messaging already geo-targets its CMP;
 *    this drives our soft-launch bar and the ads/events gate outside the EU scope.
 * 2. **Request path.** Server components cannot read the pathname. Auth gates
 *    that redirect anonymous visitors therefore could not send them back to the
 *    page they asked for. Stamping the path on the *request* headers makes it
 *    readable via `headers()` in any server component — see
 *    `lib/auth/request-path.ts`. Read-only signal: nothing depends on it,
 *    every consumer falls back when it is missing.
 */
export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')
  const region = regionFromCountry(country)

  // Forward the original headers plus our own; `NextResponse.next({ request })`
  // is what makes them visible to server components (response headers are not).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    PATHNAME_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  )

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  const existing = request.cookies.get(REGION_COOKIE)?.value
  if (existing !== region) {
    response.cookies.set({
      name: REGION_COOKIE,
      value: region,
      path: '/',
      sameSite: 'lax',
      // One week — geo rarely changes; middleware refreshes when it does.
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Skip static assets, Next internals, and the Sentry tunnel.
     * Keep ads.txt / API / pages.
     */
    '/((?!monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
