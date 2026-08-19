import { NextResponse, type NextRequest } from 'next/server'
import { PATHNAME_HEADER } from '@/lib/auth/request-path'

/**
 * One job now: stamp the request path.
 *
 * **Request path.** Server components cannot read the pathname. Auth gates
 * that redirect anonymous visitors therefore could not send them back to the
 * page they asked for. Stamping the path on the *request* headers makes it
 * readable via `headers()` in any server component — see
 * `lib/auth/request-path.ts`. Read-only signal: nothing depends on it,
 * every consumer falls back when it is missing.
 *
 * **Why the consent region moved out (edge caching).** This middleware used
 * to stamp `md_region` on the *response* of every navigation. A response
 * carrying `Set-Cookie` is never stored by the CDN, and a crawler — which
 * carries no cookies — triggered that branch on every single request. The
 * result was a permanent `x-vercel-cache: MISS` on all HTML, so every hit
 * re-rendered and re-queried WordPress.
 *
 * The region is now resolved by `GET /api/consent/region`, called once from
 * `RegionBootstrap` when the cookie is absent. Route handlers are dynamic by
 * definition, so setting a cookie there costs nothing, and clients without
 * JavaScript (crawlers) never ask for it. `/api/events` falls back to the
 * Vercel geo header directly, so event gating no longer depends on the
 * cookie having been written first.
 */
export function middleware(request: NextRequest) {
  // Forward the original headers plus our own; `NextResponse.next({ request })`
  // is what makes them visible to server components (response headers are not).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    PATHNAME_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  )

  return NextResponse.next({ request: { headers: requestHeaders } })
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
