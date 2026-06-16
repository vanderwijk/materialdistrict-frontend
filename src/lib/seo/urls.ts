/**
 * Canonical URL helpers — trailing slashes matchen WordPress-productie.
 *
 * Gebruik `canonicalPath` voor relatieve frontend-routes (metadata).
 * Gebruik `absolutePageUrl` voor absolute page-URLs in JSON-LD (@id, url).
 */

export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://materialdistrict.com').replace(
    /\/$/,
    '',
  )
}

/** Relatief pad met trailing slash (root blijft `/`). */
export function canonicalPath(path: string): string {
  if (!path || path === '/') return '/'

  const hashIndex = path.indexOf('#')
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path

  const [pathname, search] = withoutHash.split('?', 2)
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`
  const normalized =
    withLeading.endsWith('/') ? withLeading : `${withLeading}/`

  const pathWithSearch = search ? `${normalized}?${search}` : normalized
  return `${pathWithSearch}${hash}`
}

function hasFileExtension(pathname: string): boolean {
  const last = pathname.split('/').pop() ?? ''
  return /\.[a-z0-9]{2,8}$/i.test(last)
}

/** Absolute page-URL; laat bestaande http(s)-URLs en bestandspaden ongemoeid. */
export function absolutePageUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const origin = getSiteOrigin()
  const [pathname, search] = path.split('?', 2)
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (hasFileExtension(withLeading)) {
    return search ? `${origin}${withLeading}?${search}` : `${origin}${withLeading}`
  }

  const normalized = canonicalPath(withLeading)
  const absolute = normalized === '/' ? `${origin}/` : `${origin}${normalized}`
  return search ? `${absolute}?${search}` : absolute
}
