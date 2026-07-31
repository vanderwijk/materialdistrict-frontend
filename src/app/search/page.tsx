/**
 * `/search?q=` — global SearchWP-backed site search.
 *
 * Header search and WebSite SearchAction JSON-LD both point here. Empty or
 * no-hit queries render an EmptyState (not a 404).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ContentCard, EmptyState } from '@/components/ui'
import { searchSite } from '@/lib/api/search'
import { canonicalPath } from '@/lib/seo/urls'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
  alternates: { canonical: canonicalPath('/search') },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const page = parsePage(params.page)

  const results = q
    ? await searchSite(q, { page, perPage: 24 })
    : {
        q: '',
        page: 1,
        perPage: 24,
        total: 0,
        totalPages: 0,
        items: [],
      }

  const hasQuery = q.length > 0
  const totalLabel = results.total.toLocaleString('en-US')

  return (
    <main>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search' },
            ]}
          />
          <h1 className="t-display-lg">Search</h1>
          {hasQuery ? (
            <p className="ov-page-lede">
              {results.total > 0
                ? `${totalLabel} result${results.total === 1 ? '' : 's'} for “${results.q}”`
                : `No results for “${results.q}”`}
            </p>
          ) : (
            <p className="ov-page-lede">
              Search materials, stories, brands, events and more.
            </p>
          )}
        </div>
      </header>

      <div className="ov-wrap-single">
        {!hasQuery && (
          <EmptyState
            title="Enter a search term"
            description="Use the search field in the header, or try one of the suggestions below."
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

        {hasQuery && results.items.length === 0 && (
          <EmptyState
            title="No results found"
            description="Try a different spelling, a broader term, or browse materials and stories."
            actions={
              <>
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
            <div className="ov-grid">
              {results.items.map((item) => (
                <ContentCard
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  contentType={item.type}
                  thumbSrc={item.thumbnail ?? undefined}
                  thumbAlt={item.title}
                  title={item.title}
                  meta={item.excerpt || undefined}
                  thumbRatio={item.type === 'brand' ? 'square' : 'default'}
                />
              ))}
            </div>

            {results.totalPages > 1 && (
              <nav className="ov-pagination" aria-label="Search results pages">
                {page > 1 && (
                  <Link
                    className="btn btn-outline btn-sm"
                    href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
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
                    href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
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
