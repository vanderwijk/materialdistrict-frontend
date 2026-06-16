import { STATIC_PAGE_SLUGS } from '@/lib/config/static-pages'
import { getPageBySlug, wpFetch, wpFetchPaginated } from '@/lib/api/wordpress'
import { absolutePageUrl, canonicalPath } from '@/lib/seo/urls'

import { fetchAllPublishedPosts } from './fetch'
import type { SitemapEntry, WPSitemapPost } from './types'

const MATERIAL_REVALIDATE = 6 * 3600
const BRAND_REVALIDATE = 24 * 3600
const EDITORIAL_REVALIDATE = 3600
const BOOK_REVALIDATE = 1800

const STORE_PRODUCTS = '/wc/store/v1/products'
const BOOKS_CATEGORY_SLUG = 'books'

function pageUrl(path: string): string {
  return absolutePageUrl(canonicalPath(path))
}

function postsToEntries(posts: WPSitemapPost[], pathPrefix: string): SitemapEntry[] {
  return posts
    .filter((post) => post.slug)
    .map((post) => ({
      loc: pageUrl(`${pathPrefix}/${post.slug}`),
      lastmod: post.modified,
    }))
}

async function getBooksCategoryId(): Promise<number | null> {
  const override = process.env.BOOKS_CATEGORY_ID
  if (override) {
    const n = Number(override)
    if (Number.isFinite(n)) return n
  }

  try {
    const cats = await wpFetch<Array<{ id: number; slug: string }>>(
      '/wc/store/v1/products/categories',
      {
        revalidate: 3600,
        params: { per_page: 100 },
      },
    )
    return cats.find((cat) => cat.slug === BOOKS_CATEGORY_SLUG)?.id ?? null
  } catch {
    return null
  }
}

interface BookStoreItem {
  slug: string
  /** ISO-datum van laatste wijziging, beschikbaar via WC Store API. */
  date_updated?: string
}

async function fetchAllBooks(): Promise<BookStoreItem[]> {
  const categoryId = await getBooksCategoryId()
  const books: BookStoreItem[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const { items, totalPages: pages } = await wpFetchPaginated<BookStoreItem[]>(
      STORE_PRODUCTS,
      {
        revalidate: BOOK_REVALIDATE,
        params: {
          ...(categoryId ? { category: categoryId } : {}),
          per_page: 100,
          page,
        },
      },
    )

    books.push(...items.filter((item) => item.slug))
    totalPages = pages
    page += 1
  }

  return books
}

/** Vaste routes: home, archieven en marketingpagina's zonder WP lastmod. */
const FIXED_STATIC_PATHS = [
  '/',
  '/material/',
  '/article/',
  '/brand/',
  '/event/',
  '/talk/',
  '/book/',
  '/channel/',
  '/become-a-partner/',
  '/membership/',
]

export async function getStaticSitemapEntries(): Promise<SitemapEntry[]> {
  const fixedEntries: SitemapEntry[] = FIXED_STATIC_PATHS.map((path) => ({
    loc: pageUrl(path),
  }))

  const wpPageEntries = (
    await Promise.all(
      STATIC_PAGE_SLUGS.map(async (slug) => {
        const page = await getPageBySlug(slug)
        if (!page) return null

        const entry: SitemapEntry = {
          loc: pageUrl(`/${slug}/`),
          lastmod: page.modified,
        }
        return entry
      }),
    )
  ).filter((entry): entry is SitemapEntry => entry !== null)

  return [...fixedEntries, ...wpPageEntries]
}

export async function getMaterialsSitemapEntries(): Promise<SitemapEntry[]> {
  const posts = await fetchAllPublishedPosts('/wp/v2/material', {
    revalidate: MATERIAL_REVALIDATE,
  })
  return postsToEntries(posts, '/material')
}

export async function getArticlesSitemapEntries(): Promise<SitemapEntry[]> {
  const posts = await fetchAllPublishedPosts('/wp/v2/article', {
    revalidate: EDITORIAL_REVALIDATE,
  })
  return postsToEntries(posts, '/article')
}

export async function getBrandsSitemapEntries(): Promise<SitemapEntry[]> {
  const posts = await fetchAllPublishedPosts('/wp/v2/brand', {
    revalidate: BRAND_REVALIDATE,
  })
  return postsToEntries(posts, '/brand')
}

export async function getEventsSitemapEntries(): Promise<SitemapEntry[]> {
  const posts = await fetchAllPublishedPosts('/wp/v2/event', {
    revalidate: EDITORIAL_REVALIDATE,
  })
  return postsToEntries(posts, '/event')
}

export async function getTalksSitemapEntries(): Promise<SitemapEntry[]> {
  const posts = await fetchAllPublishedPosts('/wp/v2/talk', {
    revalidate: EDITORIAL_REVALIDATE,
  })
  return postsToEntries(posts, '/talk')
}

export async function getBooksSitemapEntries(): Promise<SitemapEntry[]> {
  const books = await fetchAllBooks()
  return books.map((book) => ({
    loc: pageUrl(`/book/${book.slug}`),
    ...(book.date_updated ? { lastmod: book.date_updated } : {}),
  }))
}
