/**
 * `/books` — books-overzichtspagina met zoek, sortering, view-toggle, grid en
 * paginatie.
 *
 * Stap 2 (books-vertical). Server Component. Leest searchParams (q, sort, page),
 * haalt boeken op via `listBooks` en rendert de overzichts-shell rond een
 * `ContentCard`-grid (portrait-covers). Volgt dezelfde page-header en grid als
 * /talks en /articles (design-system §6.1 / §F2.3), maar met een lichte eigen
 * toolbar i.p.v. de ChannelBar: books heeft (nog) geen channels/taxonomie om op
 * te filteren — die zijn geparkeerd tot Johan de taxonomie bevestigt.
 *
 * Prijs: cards tonen de reguliere prijs (`formatEur`). De Insider-prijs is een
 * UI-afleiding via `getBookPrice()` en krijgt prominentie op de detailpagina
 * (stap 3), niet op de cards.
 *
 * URL-structuur:
 *   /books?q=biobased&sort=title&page=2
 *
 * Catalogus via WooCommerce Store API (`/wc/store/v1/products`, server-side).
 * Winkelmand: Store API-cart via `/api/store-cart` (JWT-proxy).
 */

import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ContentCard, EmptyState } from '@/components/ui'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { listBooks } from '@/lib/api/books'
import { formatEur } from '@/lib/utils/format-price'
import { JsonLd, buildBreadcrumbList } from '@/lib/seo'
import { BooksSearchInput } from './_components/BooksSearchInput'
import { BooksSort, type BooksSortValue } from './_components/BooksSort'
import { BooksPagination } from './_components/BooksPagination'

const BOOKS_PER_PAGE = 24

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Books on materials, design and the built environment — browse the MaterialDistrict bookshop.',
  alternates: { canonical: '/books' },
  openGraph: {
    title: 'Books | MaterialDistrict',
    description:
      'Books on materials, design and the built environment from the MaterialDistrict bookshop.',
    type: 'website',
    url: '/books',
  },
}

interface BooksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw
}

/** Parse `?page=` naar een 1-based paginanummer (default 1). */
function parsePage(raw: string | string[] | undefined): number {
  const n = Number.parseInt(firstParam(raw) ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Parse `?sort=` — alleen `title` is een afwijking; al het andere = newest. */
function parseSort(raw: string | string[] | undefined): BooksSortValue {
  return firstParam(raw) === 'title' ? 'title' : 'newest'
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams

  const search = firstParam(params.q)?.trim() || undefined
  const page = parsePage(params.page)
  const sort = parseSort(params.sort)

  const { orderby, order } =
    sort === 'title'
      ? ({ orderby: 'title', order: 'asc' } as const)
      : ({ orderby: 'date', order: 'desc' } as const)

  const result = await listBooks({
    perPage: BOOKS_PER_PAGE,
    page,
    search,
    orderby,
    order,
  })

  const total = result.total
  const hasSearch = Boolean(search)

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Books' }]} />
          <h1 className="t-display-lg">Books</h1>
        </div>
      </header>

      <div className="ov-wrap-single">
        <div className="books-toolbar">
          <BooksSearchInput
            initialValue={search ?? ''}
            placeholder={
              total > 0
                ? `Search ${total.toLocaleString('en-US')} books`
                : 'Search books…'
            }
          />
          <div className="books-toolbar-controls">
            <BooksSort value={sort} />
            <ViewToggle />
          </div>
        </div>

        {result.items.length === 0 ? (
          hasSearch ? (
            <EmptyState
              title="No books match your search"
              description="Try a different search term to see more."
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
            <div className="ov-grid-3">
              {result.items.map((book) => (
                <ContentCard
                  key={book.id}
                  href={`/books/${book.slug}`}
                  contentType="book"
                  showTypeBadge={false}
                  thumbRatio="portrait"
                  thumbSrc={book.cover?.thumbnailUrl ?? book.cover?.url}
                  thumbAlt={book.cover?.alt || book.title}
                  eyebrow={
                    book.author ??
                    (book.publicationYear
                      ? String(book.publicationYear)
                      : undefined)
                  }
                  title={book.title}
                  meta={
                    book.inStock
                      ? formatEur(book.price)
                      : [formatEur(book.price), 'Sold out']
                  }
                />
              ))}
            </div>

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

      <JsonLd
        data={[
          buildBreadcrumbList([{ label: 'Home', url: '/' }, { label: 'Books' }]),
        ]}
      />
    </>
  )
}
