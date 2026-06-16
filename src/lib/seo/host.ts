const PRODUCTION_HOSTS = new Set(['materialdistrict.com', 'www.materialdistrict.com'])

/**
 * Hosts that must never be indexed (preview/staging/local).
 * Used by middleware (X-Robots-Tag) and robots.ts.
 */
export function isNonProductionHost(host: string): boolean {
  const normalized = host.toLowerCase().split(':')[0]?.trim() ?? ''
  if (!normalized) return false

  if (PRODUCTION_HOSTS.has(normalized)) return false

  if (normalized.endsWith('.vercel.app')) return true
  if (normalized.startsWith('staging.')) return true
  if (normalized === 'localhost' || normalized === '127.0.0.1') return true

  return false
}

export { getSiteOrigin as getProductionSiteUrl } from './urls'
