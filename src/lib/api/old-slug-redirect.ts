/**
 * 301 wanneer een bezoeker een oude WordPress-slug raakt.
 *
 * WP bewaart vorige `post_name`-waarden in `_wp_old_slug`. De klassieke
 * site volgde die zelf; headless doet dat niet. Zonder deze hop wordt een
 * titelcorrectie ná publicatie (nieuwsbrief, inbound link) een 404 zodra
 * de ISR-kopie van de oude URL vervalt.
 *
 * Config-redirects in `editorial-redirects.ts` winnen van ISR en blijven
 * nodig voor de eerste uren na een slugwijziging, en voor URL's die geen
 * WP-post zijn. Dit pad dekt de rest, zonder een deploy per correctie.
 *
 * Het CMS-endpoint mag ontbreken (frontend eerder live dan plugin): dan
 * gedragen we ons als "niet gevonden" en laat de pagina `notFound()` doen.
 */

import { permanentRedirect } from 'next/navigation'
import { listTag, POST_TYPE_ROUTES, recordTagBySlug } from './cache-tags'
import { wpFetch } from './wordpress'

export type OldSlugContentType =
  | 'talk'
  | 'article'
  | 'event'
  | 'material'
  | 'brand'
  | 'book'
  | 'product'
  | 'post'

const WP_POST_TYPE: Record<OldSlugContentType, string> = {
  talk: 'talk',
  article: 'article',
  post: 'article',
  event: 'event',
  material: 'material',
  brand: 'brand',
  book: 'product',
  product: 'product',
}

interface OldSlugResponse {
  found: boolean
  slug?: string | null
}

async function resolveCurrentSlugFromOld(
  type: OldSlugContentType,
  slug: string,
): Promise<string | null> {
  const wpType = WP_POST_TYPE[type]
  try {
    const data = await wpFetch<OldSlugResponse>('/md/v2/old-slug', {
      revalidate: 3600,
      params: { type: wpType, slug },
      tags: [recordTagBySlug(wpType, slug), listTag(wpType)],
    })
    const current = data.found ? data.slug?.trim() : ''
    if (!current || current === slug) return null
    return current
  } catch {
    return null
  }
}

/**
 * Redirect naar de huidige slug als WP deze `slug` als oude naam kent.
 * Doet niets wanneer er geen match is — de caller doet dan `notFound()`.
 */
export async function redirectIfOldSlug(
  type: OldSlugContentType,
  slug: string,
  suffix = '',
): Promise<void> {
  const current = await resolveCurrentSlugFromOld(type, slug)
  if (!current) return

  const base = POST_TYPE_ROUTES[type]
  if (!base) return

  const tail = suffix.replace(/^\/+|\/+$/g, '')
  permanentRedirect(tail ? `${base}/${current}/${tail}/` : `${base}/${current}/`)
}
