/**
 * Global SearchWP-backed site search.
 *
 * GET /md/v2/search?q=…&page=1&per_page=24
 */

import { wpFetch } from './wordpress'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'
import type { ContentType } from '@/components/ui/Tag'

export type SearchResultType = Extract<
  ContentType,
  'material' | 'article' | 'brand' | 'event' | 'talk'
>

export interface SearchResultItem {
  type: SearchResultType
  id: number
  slug: string
  title: string
  thumbnail: string | null
  excerpt: string
  href: string
}

export interface SearchResults {
  q: string
  page: number
  perPage: number
  total: number
  totalPages: number
  items: SearchResultItem[]
}

interface WPSearchItemRaw {
  type?: string
  id?: number
  slug?: string
  title?: string
  thumbnail?: string | null
  excerpt?: string
}

interface WPSearchResponseRaw {
  q?: string
  page?: number
  per_page?: number
  total?: number
  total_pages?: number
  items?: WPSearchItemRaw[]
}

const SEARCH_TYPES: readonly SearchResultType[] = [
  'material',
  'article',
  'brand',
  'event',
  'talk',
]

function isSearchType(value: unknown): value is SearchResultType {
  return typeof value === 'string' && (SEARCH_TYPES as readonly string[]).includes(value)
}

function hrefFor(type: SearchResultType, slug: string): string {
  switch (type) {
    case 'material':
      return `/material/${slug}`
    case 'article':
      return `/article/${slug}`
    case 'brand':
      return `/brand/${slug}`
    case 'event':
      return `/event/${slug}`
    case 'talk':
      return `/talk/${slug}`
  }
}

function mapItem(raw: WPSearchItemRaw): SearchResultItem | null {
  if (!isSearchType(raw.type)) return null
  const id = Number(raw.id)
  const slug = typeof raw.slug === 'string' ? raw.slug : ''
  const title = typeof raw.title === 'string' ? raw.title : ''
  if (!Number.isFinite(id) || id <= 0 || !slug || !title) return null

  return {
    type: raw.type,
    id,
    slug,
    title: decodeHtmlEntities(title),
    thumbnail: normalizeMediaUrl(
      typeof raw.thumbnail === 'string' ? raw.thumbnail : null,
    ),
    excerpt:
      typeof raw.excerpt === 'string' ? decodeHtmlEntities(raw.excerpt) : '',
    href: hrefFor(raw.type, slug),
  }
}

/**
 * Site-wide search via SearchWP on CMS (`GET /md/v2/search`).
 * Empty `q` returns an empty result set (no request).
 */
export async function searchSite(
  q: string,
  opts: { page?: number; perPage?: number; type?: SearchResultType } = {},
): Promise<SearchResults> {
  const query = q.trim()
  const page = Math.max(1, opts.page ?? 1)
  const perPage = Math.min(48, Math.max(1, opts.perPage ?? 24))

  if (!query) {
    return {
      q: '',
      page,
      perPage,
      total: 0,
      totalPages: 0,
      items: [],
    }
  }

  const params = new URLSearchParams({
    q: query,
    page: String(page),
    per_page: String(perPage),
  })
  if (opts.type) {
    params.set('type', opts.type)
  }

  try {
    const raw = await wpFetch<WPSearchResponseRaw>(
      `/md/v2/search?${params.toString()}`,
      { revalidate: 60 },
    )
    const items = Array.isArray(raw.items)
      ? raw.items.map(mapItem).filter((i): i is SearchResultItem => i !== null)
      : []

    return {
      q: typeof raw.q === 'string' ? raw.q : query,
      page: Number(raw.page) || page,
      perPage: Number(raw.per_page) || perPage,
      total: Number(raw.total) || 0,
      totalPages: Number(raw.total_pages) || 0,
      items,
    }
  } catch {
    return {
      q: query,
      page,
      perPage,
      total: 0,
      totalPages: 0,
      items: [],
    }
  }
}
