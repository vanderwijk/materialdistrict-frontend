import type { NextConfig } from 'next'

/**
 * MaterialDistrict — Next.js configuratie
 *
 * - Image domains: WordPress media-host
 * - Security headers: CSP, frame-ancestors, X-Content-Type-Options
 * - Redirects: legacy WordPress-URLs blijven werken (toe te voegen in latere sessie
 *   wanneer we de exacte mapping van de huidige site kennen)
 */

const WP_HOST = process.env.WP_API_URL
  ? new URL(process.env.WP_API_URL).hostname
  : 'materialdistrict.com'

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

const connectSrc = ["'self'", `https://${WP_HOST}`]

if (isDevelopment) {
	connectSrc.push('ws:', 'wss:')
}

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://${WP_HOST} https://secure.gravatar.com`,
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(' ')}`,
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
  allowedDevOrigins,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: WP_HOST,
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

  // Legacy redirects — wordt gevuld zodra we de huidige WP-permalinks
  // hebben gemapt op de Next.js routes. Voorlopig leeg.
  async redirects() {
    return []
  },
}

export default nextConfig
