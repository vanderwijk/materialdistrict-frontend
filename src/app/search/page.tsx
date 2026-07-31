/**
 * `/search?q=` — global SearchWP-backed site search.
 *
 * Header search and WebSite SearchAction JSON-LD both point here. Empty or
 * no-hit queries render an EmptyState (not a 404).
 *
 * Vormgeving (31-07-2026). Zoekresultaten zijn een gerangschikte lijst, geen
 * bladercatalogus: daarom rijen i.p.v. een kaartraster. Een rij toont de
 * relevantievolgorde van SearchWP zoals hij is, met het contenttype als
 * label zodat je in één blik ziet wát je gevonden hebt. Verder: een eigen
 * zoekveld op de pagina (voorheen kon je alleen vanuit de header zoeken) en
 * een telling per type over de huidige pagina.
 *
 * Nog niet mogelijk: échte filtertabs per type. Dat vraagt een `type`-param
 * op `/md/v2/search`; zolang die er niet is zou filteren op de client een
 * gepagineerde set halveren en dus liegen. Zie de mail aan Johan.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, EmptyState, Tag } from '@/components/ui'
import { searchSite, type SearchResultItem } from '@/lib/api/search'
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

/** Leesbaar meervoud per contenttype, voor de telling boven de resultaten. */
const TYPE_PLURAL: Record<SearchResultItem['type'], string> = {
  material: 'materials',
  article: 'stories',
  brand: 'brands',
  event: 'events',
  talk: 'talks',
}

/** Telling per type over de resultaten van déze pagina, in vaste volgorde. */
function countByType(
  items: readonly SearchResultItem[]
): Array<{ type: SearchResultItem['type']; count: number }> {
  const order: Array<SearchResultItem['type']> = [
    'material',
    'article',
    'brand',
    'event',
    'talk',
  ]
  return order
    .map((type) => ({ type, count: items.filter((i) => i.type === type).length }))
    .filter((entry) => entry.count > 0)
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
  const typeCounts = countByType(results.items)

  return (
    <main>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
          <h1 className="t-display-lg">Search</h1>

          {/* Eigen zoekveld op de pagina. Bewust een echte GET-form: werkt
              zonder JavaScript en houdt de pagina een server-component. */}
          <form className="srch-form" action="/search" method="get" role="search">
            <label className="srch-form-label" htmlFor="srch-q">
              Search MaterialDistrict
            </label>
            <div className="srch-form-row">
              <input
                id="srch-q"
                className="srch-input"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search materials, stories, brands, events and talks"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary srch-submit">
                Search
              </button>
            </div>
          </form>

          {hasQuery && (
            <p className="ov-page-lede">
              {results.total > 0
                ? `${totalLabel} result${results.total === 1 ? '' : 's'} for “${results.q}”`
                : `No results for “${results.q}”`}
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
            {typeCounts.length > 1 && (
              <p className="srch-breakdown">
                On this page:{' '}
                {typeCounts.map((entry, i) => (
                  <span key={entry.type}>
                    {i > 0 && ' · '}
                    <span className="srch-breakdown-n">{entry.count}</span>{' '}
                    {TYPE_PLURAL[entry.type]}
                  </span>
                ))}
              </p>
            )}

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
