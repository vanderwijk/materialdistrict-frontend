import { NextResponse, type NextRequest } from 'next/server'
import { REGION_COOKIE, regionFromCountry } from '@/lib/consent/eu-region'

/**
 * Stamp the visitor's consent region from Vercel geo (`x-vercel-ip-country`).
 * Privacy & messaging already geo-targets its CMP; this drives our soft-launch
 * bar and the ads/events gate outside the EU scope.
 */
export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')
  const region = regionFromCountry(country)
  const response = NextResponse.next()

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
     * Skip static assets and Next internals. Keep ads.txt / API / pages.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
