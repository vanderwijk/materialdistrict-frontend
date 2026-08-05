/**
 * Serve ads.txt at the domain root for Google Ad Manager / buyers.
 *
 * A file in `public/` alone can lose to the catch-all `[pageSlug]` route
 * (live previously returned the HTML 404). An App Router handler wins.
 */

const ADS_TXT = 'google.com, pub-4227265118307619, DIRECT, f08c47fec0942fa0\n'

export function GET() {
  return new Response(ADS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
