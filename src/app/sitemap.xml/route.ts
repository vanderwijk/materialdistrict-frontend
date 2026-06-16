import { createSitemapIndexResponse } from '@/lib/seo/sitemap'

export function GET() {
  return createSitemapIndexResponse()
}
