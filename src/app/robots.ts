import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getProductionSiteUrl, isNonProductionHost } from '@/lib/seo/host'

export const dynamic = 'force-dynamic'

const PRIVATE_PATHS = [
  '/dashboard/',
  '/checkout/',
  '/cart/',
  '/api/',
  '/mock/',
  '/sign-in',
  '/register',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host') ?? ''

  if (isNonProductionHost(host) || process.env.VERCEL_ENV === 'preview') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${getProductionSiteUrl()}/sitemap.xml`,
  }
}
