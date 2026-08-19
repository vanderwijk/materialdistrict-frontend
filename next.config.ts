import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

/**
 * MaterialDistrict — Next.js configuratie
 *
 * - Image domains: WordPress media-host
 * - Security headers: CSP, frame-ancestors, X-Content-Type-Options
 * - Redirects: legacy WordPress-URLs → Next (sitemap-meting 31-07-2026; 424 van 10.901)
 */

const WP_HOST = process.env.WP_API_URL
  ? new URL(process.env.WP_API_URL).hostname
  : 'cms.materialdistrict.com'

const isDevelopment = process.env.NODE_ENV === 'development'

function parseDevOrigins(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const privateNetworkDevOrigins = [
  '192.168.*.*',
  '10.*.*.*',
  ...Array.from({ length: 16 }, (_, index) => `172.${16 + index}.*.*`),
]

const allowedDevOrigins = isDevelopment
  ? [
      '*.local',
      ...privateNetworkDevOrigins,
      ...parseDevOrigins(process.env.ALLOWED_DEV_ORIGINS),
    ]
  : undefined

const connectSrc = [
  "'self'",
  `https://${WP_HOST}`,
  'https://api.stripe.com',
  // Google Ad Manager / GPT
  'https://securepubads.g.doubleclick.net',
  'https://*.doubleclick.net',
  'https://*.googlesyndication.com',
  'https://*.google.com',
  'https://fundingchoicesmessages.google.com',
  'https://*.adtrafficquality.google',
  'https://csi.gstatic.com',
  // Plausible Analytics
  'https://plausible.io',
  // Sentry (tunnel `/monitoring` is same-origin; ingest as fallback)
  'https://*.ingest.sentry.io',
  'https://*.ingest.de.sentry.io',
]

if (isDevelopment) {
	connectSrc.push('ws:', 'wss:')
}

const ContentSecurityPolicy = [
  "default-src 'self'",
  // GPT + Stripe + Funding Choices (Privacy & messaging CMP); 'unsafe-eval' remains required by Next/GPT tooling paths.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://securepubads.g.doubleclick.net https://www.googletagservices.com https://www.google.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://plausible.io",
  // Funding Choices / IAB TCF wall loads Google Fonts CSS + webfonts.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: https://${WP_HOST} https://cms.materialdistrict.com https://media.materialdistrict.com https://secure.gravatar.com https://securepubads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://*.gstatic.com https://*.googleusercontent.com`,
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src ${connectSrc.join(' ')}`,
  // Session Replay uses a web worker from a blob URL
  "worker-src 'self' blob:",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://securepubads.g.doubleclick.net https://tpc.googlesyndication.com https://*.doubleclick.net https://*.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://*.adtrafficquality.google",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: true,
  allowedDevOrigins,
  // Smaller serverless bundles — tree-shake icon barrels (Vercel cold-start KB).
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: WP_HOST,
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'materialdistrict.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.materialdistrict.com',
        pathname: '/wp-content/**',
      },
      {
        // CDN-host voor media: de S3-offload mu-plugin herschrijft alle
        // upload-URL's naar dit domein (zie mu-plugins/md-s3-media-offload.php).
        protocol: 'https',
        hostname: 'media.materialdistrict.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },

  /**
   * Legacy redirects — WordPress permalinks → Next.js routes.
   * Derived from the live sitemap on 31-07-2026: 10.901 indexed URLs measured
   * against the new frontend. 10.477 (96,1%) already resolve unchanged; the
   * 424 that break fall into the groups below. All permanent (301).
   */
  async redirects() {
    return [
      // ------------------------------------------------------------------
      // 0. Legacy WordPress search links inside article bodies.
      //     2.547 published articles contain keyword links pointing at
      //     cms.materialdistrict.com/?s=term. Those redirect to our home
      //     page carrying a `?s=` the new site does not use, so the reader
      //     lands on the homepage instead of a result list. The article
      //     bodies get rewritten in WordPress separately (one-off WP-CLI);
      //     this catches the parameter wherever it still arrives — old
      //     bookmarks, external links, cached pages.
      //
      //     `s` is captured with :query so the term survives the hop.
      // ------------------------------------------------------------------
      {
        source: '/',
        has: [{ type: 'query', key: 's', value: '(?<term>.*)' }],
        destination: '/search/?q=:term',
        permanent: false,
      },
      // ------------------------------------------------------------------
      // 0a. Production Vercel alias → canonical apex.
      //     Keeps hashed preview/deployment URLs (*.vercel.app) usable for
      //     testing; those stay noindex via vercel.json X-Robots-Tag.
      // ------------------------------------------------------------------
      {
        source: '/',
        has: [
          { type: 'host', value: 'materialdistrict-frontend.vercel.app' },
        ],
        destination: 'https://materialdistrict.com/',
        permanent: true,
      },
      {
        source: '/:path+/',
        has: [
          { type: 'host', value: 'materialdistrict-frontend.vercel.app' },
        ],
        destination: 'https://materialdistrict.com/:path+/',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 0b. books.materialdistrict.com → materialdistrict.com/book/
      //     Old WP Engine bookstore decommissioned; DNS points here after
      //     cutover. Slug remaps first, then 1:1 product, then catch-all.
      // ------------------------------------------------------------------
      {
        source: '/product/mx2014-exhibition-catalogue',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/mx2014-show-catalogue',
        permanent: true,
      },
      {
        source: '/product/mx2015-exhibition-catalogue',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/mx2015-show-catalogue',
        permanent: true,
      },
      {
        source: '/product/mx2016-exhibition-catalogue',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/mx2016-show-catalogue',
        permanent: true,
      },
      {
        source: '/product/mx2017-exhibition-catalogue',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/mx2017-show-catalogue',
        permanent: true,
      },
      {
        source: '/product/material-revolution-2',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/material-revolution-ii',
        permanent: true,
      },
      {
        source: '/product/tomorrows-timber-booming-bamboo',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/product/:slug',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/:slug',
        permanent: true,
      },
      {
        source: '/product-category/:path*',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/shop',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/cart',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/checkout',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/my-account',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'books.materialdistrict.com' }],
        destination: 'https://materialdistrict.com/book/',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 0. Media / uploads — after apex DNS → Vercel, old image URLs
      //    (Google Images, e-mails, hotlinks) must 301 to the CDN.
      // ------------------------------------------------------------------
      {
        source: '/wp-content/uploads/:path*',
        destination:
          'https://media.materialdistrict.com/wp-content/uploads/:path*',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 0c. WordPress admin / login on apex → CMS host.
      //     After cutover, materialdistrict.com is Next.js; editors and
      //     bookmarks still hit /wp-admin and *.php on the apex. Keep
      //     specific root entry points first, then /wp-admin/*, then any
      //     other root-level *.php (legacy admin deep-links without the
      //     /wp-admin/ prefix, e.g. /options-permalink.php).
      //     Note: Vercel system mitigations may still 403 some
      //     /wp-admin/*.php probes before Next — firewall redirects cover
      //     those (see vercel firewall rules).
      // ------------------------------------------------------------------
      {
        source: '/wp-login.php',
        destination: 'https://cms.materialdistrict.com/wp-login.php',
        permanent: true,
      },
      {
        source: '/wp-register.php',
        destination:
          'https://cms.materialdistrict.com/wp-login.php?action=register',
        permanent: true,
      },
      {
        source: '/xmlrpc.php',
        destination: 'https://cms.materialdistrict.com/xmlrpc.php',
        permanent: true,
      },
      {
        source: '/wp-cron.php',
        destination: 'https://cms.materialdistrict.com/wp-cron.php',
        permanent: true,
      },
      {
        source: '/wp-admin',
        destination: 'https://cms.materialdistrict.com/wp-admin/',
        permanent: true,
      },
      {
        source: '/wp-admin/:path*',
        destination: 'https://cms.materialdistrict.com/wp-admin/:path*',
        permanent: true,
      },
      {
        source: '/:file.php',
        destination: 'https://cms.materialdistrict.com/wp-admin/:file.php',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 1. Books — WooCommerce products moved to /book/ (apex legacy paths)
      //    31 URLs. Verified: all 31 slugs resolve 1-on-1.
      // ------------------------------------------------------------------
      {
        source: '/product/:slug',
        destination: '/book/:slug',
        permanent: true,
      },
      {
        source: '/product-category/books/:path*',
        destination: '/book',
        permanent: true,
      },
      {
        source: '/product-category/:path*',
        destination: '/book',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 2. Sensory and technical archives → matching filter on /material
      //    ~50 URLs / 15 taxonomies. Verified 31-07-2026: all 48 old term
      //    slugs work as filter values. Hyphen in path → underscore in query.
      // ------------------------------------------------------------------
      {
        source: '/glossiness/:value',
        destination: '/material/?glossiness=:value',
        permanent: true,
      },
      {
        source: '/translucence/:value',
        destination: '/material/?translucence=:value',
        permanent: true,
      },
      {
        source: '/structure/:value',
        destination: '/material/?structure=:value',
        permanent: true,
      },
      {
        source: '/texture/:value',
        destination: '/material/?texture=:value',
        permanent: true,
      },
      {
        source: '/hardness/:value',
        destination: '/material/?hardness=:value',
        permanent: true,
      },
      {
        source: '/temperature/:value',
        destination: '/material/?temperature=:value',
        permanent: true,
      },
      {
        source: '/acoustics/:value',
        destination: '/material/?acoustics=:value',
        permanent: true,
      },
      {
        source: '/odeur/:value',
        destination: '/material/?odeur=:value',
        permanent: true,
      },
      {
        source: '/fire-resistance/:value',
        destination: '/material/?fire_resistance=:value',
        permanent: true,
      },
      {
        source: '/uv-resistance/:value',
        destination: '/material/?uv_resistance=:value',
        permanent: true,
      },
      {
        source: '/weather-resistance/:value',
        destination: '/material/?weather_resistance=:value',
        permanent: true,
      },
      {
        source: '/scratch-resistance/:value',
        destination: '/material/?scratch_resistance=:value',
        permanent: true,
      },
      {
        source: '/chemical-resistance/:value',
        destination: '/material/?chemical_resistance=:value',
        permanent: true,
      },
      {
        source: '/weight/:value',
        destination: '/material/?weight=:value',
        permanent: true,
      },
      {
        source: '/renewable/:value',
        destination: '/material/?renewable=:value',
        permanent: true,
      },
      // Bare archive roots have no filter value to carry over.
      {
        source:
          '/:taxonomy(glossiness|translucence|structure|texture|hardness|temperature|acoustics|odeur|fire-resistance|uv-resistance|weather-resistance|scratch-resistance|chemical-resistance|weight|renewable)',
        destination: '/material',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 2b. material_category slug aliases.
      //     WP term slug is plural `concretes` (name “Concrete”); old/guessed
      //     singular `/material-category/concrete/` 404s. Send to the materials
      //     listing with the live FacetWP filter applied.
      // ------------------------------------------------------------------
      {
        source: '/material-category/concrete',
        destination: '/material/?material_category=concretes',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 3. Editorial and event taxonomies (+ 242 location archives → /event)
      // ------------------------------------------------------------------
      {
        source: '/story-type/:slug*',
        destination: '/article',
        permanent: true,
      },
      {
        source: '/event-type/:slug*',
        destination: '/event',
        permanent: true,
      },
      {
        source: '/location/:slug*',
        destination: '/event',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 4. Speaker archives — 92 auto-generated person taxonomy pages → /talk
      // ------------------------------------------------------------------
      {
        source: '/person/:slug*',
        destination: '/talk',
        permanent: true,
      },

      // ------------------------------------------------------------------
      // 5. Jobs pages under /about — removed, no replacement
      // ------------------------------------------------------------------
      {
        source: '/about/jobs/:path*',
        destination: '/about',
        permanent: true,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry SaaS project: materialdistrict / javascript-nextjs
  org: process.env.SENTRY_ORG ?? 'materialdistrict',
  project: process.env.SENTRY_PROJECT ?? 'javascript-nextjs',
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Wider client file set → better production stack traces
  widenClientFileUpload: true,

  // Do NOT use tunnelRoute while trailingSlash:true — Next 308s /monitoring →
  // /monitoring/, which 404s via [pageSlug] and drops all browser events.
  // Client posts go to *.ingest.de.sentry.io (allowed in CSP connect-src).

  silent: !process.env.CI,
})
