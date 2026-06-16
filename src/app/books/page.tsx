/**
 * `/books` — boekenoverzicht.
 *
 * Spiegelt de materials-overzichtsshell 1-op-1 zodat /books één familie is met
 * de rest van de catalogus:
 *   ov-page-header (breadcrumb + h1)
 *   ChannelBarNav  (zoek + kolomkeuze; books heeft nog geen channels → alleen "All")
 *   ov-wrap        (FilterSidebar links + grid + pagination rechts)
 *
 * Server Component: leest searchParams (q, page), haalt de boeken op via
 * `listBooks`, en rendert de shell rond een client-grid + pagination.
 *
 * Filters: de sidebar-STRUCTUUR staat er in de huisstijl; de opties + functioneel
 * filteren volgen met Johans boek-taxonomie en de filterbron-keuze (FacetWP vs
 * Store-API). Prijzen op de tegels zijn ex btw (B2B-conventie).
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ChannelBarNav, EmptyState } from '@/components/ui'
import { listBooks } from '@/lib/api/books'
import { JsonLd, buildBreadcrumbList } from '@/lib/seo'
import { BooksFilterSidebar } from './_components/BooksFilterSidebar'
import { BooksGrid } from './_components/BooksGrid'
import { BooksPagination } from './_components/BooksPagination'

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Browse books, exhibition catalogues and publications on innovative and sustainable materials. Insider members save on every title.',
  alternates: { canonical: '/books' },
  openGraph: {
    title: 'Books | MaterialDistrict',
    description:
      'Books, exhibition catalogues and publications on innovative and sustainable materials.',
    type: 'website',
    url: '/books',
  },
}

interface BooksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams

  const search =
    (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined
  const pageRaw = Array.isArray(params.page) ? params.page[0] : params.page
  const page = Math.max(1, Number.parseInt(pageRaw ?? '1', 10) || 1)

  const result = await listBooks({ page, search })
  const total = result.total
  const hasActiveFilters = Boolean(search)

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Books' }]} />
          <h1 className="t-display-lg">Books</h1>
        </div>
      </header>

      {/* Books heeft (nog) geen channels — de bar levert hier de zoek + kolomkeuze,
          exact als op materials. Channels volgen zodra Johan boek-categorieën levert. */}
      <ChannelBarNav
        channels={[]}
        initialSearch={search ?? ''}
        searchPlaceholder={
          total > 0
            ? `Search ${total.toLocaleString('en-US')} books`
            : 'Search books…'
        }
      />

      <div className="ov-wrap">
        <BooksFilterSidebar />

        <div>
          {result.items.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No books match your search"
                description="Try a different search term, or clear it to see all books."
                actions={
                  <Button as="link" href="/books" variant="outline" size="sm">
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No books available"
                description="There are currently no books to show. Please check back later."
              />
            )
          ) : (
            <>
              <Suspense fallback={null}>
                <BooksGrid items={result.items} />
              </Suspense>

              {result.totalPages > 1 && (
                <div className="ov-pagination">
                  <BooksPagination
                    currentPage={page}
                    totalPages={result.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Books' },
          ]),
        ]}
      />
    </>
  )
}
