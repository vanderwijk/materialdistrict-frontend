import type { NextConfig } from 'next'

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
  'https://*.adtrafficquality.google',
  'https://csi.gstatic.com',
  // Plausible Analytics
  'https://plausible.io',
]

if (isDevelopment) {
	connectSrc.push('ws:', 'wss:')
}

const ContentSecurityPolicy = [
  "default-src 'self'",
  // GPT + Stripe; 'unsafe-eval' remains required by Next/GPT tooling paths.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://securepubads.g.doubleclick.net https://www.googletagservices.com https://www.google.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://${WP_HOST} https://cms.materialdistrict.com https://media.materialdistrict.com https://secure.gravatar.com https://securepubads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://*.gstatic.com`,
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(' ')}`,
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://securepubads.g.doubleclick.net https://tpc.googlesyndication.com https://*.doubleclick.net https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google",
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
      // 1. Books — WooCommerce products moved to /book/
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

export default nextConfig
