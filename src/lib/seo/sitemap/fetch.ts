import { wpFetchPaginated } from '@/lib/api/wordpress'
import { getSitemapPageConcurrency } from '@/lib/api/upstream-guard'

import type { WPSitemapPost } from './types'

const WP_MAX_PER_PAGE = 100

/**
 * How many pages to request at once.
 *
 * The old loop walked pages one at a time: 33 pages of materials meant 33
 * round trips end to end, and a cold build of sitemap-materials.xml took
 * over forty seconds. WordPress answers a `_fields`-trimmed page in
 * 150-400 ms, so that wall-clock cost was almost entirely waiting.
 *
 * Eight keeps the win without hammering a single WordPress box - the same
 * ceiling used elsewhere for bulk reads. Higher numbers stop helping:
 * upstream becomes the limit. During an incident, `WP_LOAD_SHIELD` lowers
 * this via `getSitemapPageConcurrency()`.
 */
const PAGE_CONCURRENCY = getSitemapPageConcurrency()

interface FetchPublishedPostsOptions {
  revalidate: number
}

async function fetchPage(
  endpoint: string,
  page: number,
  revalidate: number,
): Promise<{ items: WPSitemapPost[]; totalPages: number }> {
  return wpFetchPaginated<WPSitemapPost[]>(endpoint, {
    revalidate,
    params: {
      per_page: WP_MAX_PER_PAGE,
      page,
      status: 'publish',
      _fields: ['slug', 'modified'],
    },
  })
}

/**
 * Haal alle gepubliceerde posts op voor een WP REST CPT-endpoint.
 * Gebruikt `_fields=slug,modified` om de payload minimaal te houden.
 *
 * Page 1 is fetched on its own because it is what tells us how many pages
 * there are; the remainder is fetched in bounded parallel batches. Order is
 * preserved - results are reassembled by page number, not by whichever
 * request happened to return first, so the XML stays stable between builds.
 */
export async function fetchAllPublishedPosts(
  endpoint: string,
  options: FetchPublishedPostsOptions,
): Promise<WPSitemapPost[]> {
  const first = await fetchPage(endpoint, 1, options.revalidate)

  const totalPages = Math.max(1, first.totalPages)
  if (totalPages === 1) return first.items

  // Slot 0 holds page 1; slot n holds page n+1.
  const pages: WPSitemapPost[][] = new Array(totalPages)
  pages[0] = first.items

  const remaining: number[] = []
  for (let page = 2; page <= totalPages; page += 1) remaining.push(page)

  for (let i = 0; i < remaining.length; i += PAGE_CONCURRENCY) {
    const batch = remaining.slice(i, i + PAGE_CONCURRENCY)

    const results = await Promise.all(
      batch.map(async (page) => ({
        page,
        items: (await fetchPage(endpoint, page, options.revalidate)).items,
      })),
    )

    for (const { page, items } of results) {
      pages[page - 1] = items
    }
  }

  // `flat()` over a fixed-length array skips any slot a failed page left
  // empty; a partial sitemap beats none, and the next revalidate fills it in.
  return pages.flat()
}
