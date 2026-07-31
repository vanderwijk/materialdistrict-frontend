/**
 * `/search?q=&type=` — global SearchWP-backed site search.
 *
 * Header search and WebSite SearchAction JSON-LD both point here. Empty or
 * no-hit queries render an EmptyState (not a 404).
 *
 * Type tabs use the server `type` param on `/md/v2/search` so totals and
 * pagination stay honest. Client-side filtering of a mixed page would lie.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SearchForm } from '@/components/search/SearchForm'
import { Button, EmptyState, Tag } from '@/components/ui'
import {
  searchSite,
  type SearchResultItem,
  type SearchResultType,
} from '@/lib/api/search'
import { canonicalPath } from '@/lib/seo/urls'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
  alternates: { canonical: canonicalPath('/search') },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>
}

const SEARCH_TYPES: readonly SearchResultType[] = [
  'material',
  'article',
  'brand',
  'event',
  'talk',
]

const TYPE_LABEL: Record<SearchResultType, string> = {
  material: 'Materials',
  article: 'Stories',
  brand: 'Brands',
  event: 'Events',
  talk: 'Talks',
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

function parseType(raw: string | undefined): SearchResultType | undefined {
  if (!raw) return undefined
  return (SEARCH_TYPES as readonly string[]).includes(raw)
    ? (raw as SearchResultType)
    : undefined
}

function searchHref(q: string, opts: { type?: SearchResultType; page?: number } = {}): string {
  const params = new URLSearchParams()
  params.set('q', q)
  if (opts.type) params.set('type', opts.type)
  if (opts.page && opts.page > 1) params.set('page', String(opts.page))
  return `/search?${params.toString()}`
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const page = parsePage(params.page)
  const type = parseType(params.type)

  const results = q
    ? await searchSite(q, { page, perPage: 24, type })
    : {
        q: '',
        page: 1,
        perPage: 24,
        total: 0,
        totalPages: 0,
        items: [] as SearchResultItem[],
      }

  const hasQuery = q.length > 0
  const totalLabel = results.total.toLocaleString('en-US')

  return (
    <main>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Search' }]} />
          <h1 className="t-display-lg">Search</h1>

          {/* key remounts when ?q= or ?type= changes from the header / tabs. */}
          <SearchForm
            key={`${q || 'empty'}-${type || 'all'}`}
            defaultQuery={q}
            type={type}
          />

          {hasQuery && (
            <p className="ov-page-lede">
              {results.total > 0
                ? `${totalLabel} result${results.total === 1 ? '' : 's'} for “${results.q}”${
                    type ? ` in ${TYPE_LABEL[type].toLowerCase()}` : ''
                  }`
                : `No results for “${results.q}”${
                    type ? ` in ${TYPE_LABEL[type].toLowerCase()}` : ''
                  }`}
            </p>
          )}
        </div>
      </header>

      <div className="ov-wrap-single">
        {!hasQuery && (
          <EmptyState
            title="Enter a search term"
            description="Use the field above, or try one of the suggestions below."
            actions={
              <>
                <Button as="link" href="/search?q=wood" variant="outline" size="sm">
                  wood
                </Button>
                <Button as="link" href="/search?q=biobased" variant="outline" size="sm">
                  biobased
                </Button>
                <Button as="link" href="/material" variant="outline" size="sm">
                  Browse materials
                </Button>
              </>
            }
          />
        )}

        {hasQuery && (
          <nav className="srch-tabs" aria-label="Filter by content type">
            <Link
              href={searchHref(q)}
              className={`srch-tab${!type ? ' is-active' : ''}`}
              aria-current={!type ? 'page' : undefined}
            >
              All
            </Link>
            {SEARCH_TYPES.map((tabType) => (
              <Link
                key={tabType}
                href={searchHref(q, { type: tabType })}
                className={`srch-tab${type === tabType ? ' is-active' : ''}`}
                aria-current={type === tabType ? 'page' : undefined}
              >
                {TYPE_LABEL[tabType]}
              </Link>
            ))}
          </nav>
        )}

        {hasQuery && results.items.length === 0 && (
          <EmptyState
            title="No results found"
            description={
              type
                ? `Nothing matched in ${TYPE_LABEL[type].toLowerCase()}. Try All, or a broader term.`
                : 'Try a different spelling, a broader term, or browse materials and stories.'
            }
            actions={
              <>
                {type && (
                  <Button as="link" href={searchHref(q)} variant="outline" size="sm">
                    Show all types
                  </Button>
                )}
                <Button as="link" href="/material" variant="outline" size="sm">
                  Browse materials
                </Button>
                <Button as="link" href="/article" variant="outline" size="sm">
                  Browse stories
                </Button>
              </>
            }
          />
        )}

        {results.items.length > 0 && (
          <>
            <ol className="srch-list">
              {results.items.map((item) => (
                <li className="srch-row" key={`${item.type}-${item.id}`}>
                  <Link href={item.href} className="srch-row-link">
                    <span
                      className={`srch-thumb srch-thumb-${item.type}`}
                      aria-hidden="true"
                    >
                      {item.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnail} alt="" loading="lazy" />
                      )}
                    </span>
                    <span className="srch-body">
                      <span className="srch-meta">
                        <Tag contentType={item.type} />
                      </span>
                      <span className="srch-title">{item.title}</span>
                      {item.excerpt && (
                        <span className="srch-excerpt">{item.excerpt}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>

            {results.totalPages > 1 && (
              <nav className="ov-pagination" aria-label="Search results pages">
                {page > 1 && (
                  <Link
                    className="btn btn-outline btn-sm"
                    href={searchHref(q, { type, page: page - 1 })}
                  >
                    Previous
                  </Link>
                )}
                <span className="ov-pagination-status">
                  Page {page} of {results.totalPages}
                </span>
                {page < results.totalPages && (
                  <Link
                    className="btn btn-outline btn-sm"
                    href={searchHref(q, { type, page: page + 1 })}
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}
