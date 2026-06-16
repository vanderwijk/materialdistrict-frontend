import { wpFetchPaginated } from '@/lib/api/wordpress'

import type { WPSitemapPost } from './types'

const WP_MAX_PER_PAGE = 100

interface FetchPublishedPostsOptions {
  revalidate: number
}

/**
 * Haal alle gepubliceerde posts op voor een WP REST CPT-endpoint.
 * Gebruikt `_fields=slug,modified` om de payload minimaal te houden.
 */
export async function fetchAllPublishedPosts(
  endpoint: string,
  options: FetchPublishedPostsOptions,
): Promise<WPSitemapPost[]> {
  const all: WPSitemapPost[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const { items, totalPages: pages } = await wpFetchPaginated<WPSitemapPost[]>(endpoint, {
      revalidate: options.revalidate,
      params: {
        per_page: WP_MAX_PER_PAGE,
        page,
        status: 'publish',
        _fields: ['slug', 'modified'],
      },
    })

    all.push(...items)
    totalPages = pages
    page += 1
  }

  return all
}
