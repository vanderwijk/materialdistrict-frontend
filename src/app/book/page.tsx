/**
 * `/book` — boekenoverzicht.
 *
 * Spiegelt de materials-overzichtsshell (channelbalk + filter-sidebar + grid).
 * De boekcatalogus is klein, dus we halen alle boeken één keer op en leiden
 * daaruit de facetten af — channels (voor de balk) en Format/Publisher/On sale
 * (voor de sidebar) — elk mét tellingen, en filteren/zoeken/pagineren server-
 * side in JS. Zo werken de filters en channels écht, zonder op extra Store-API-
 * filterparameters te wachten.
 *
 * Categorieën (design-disciplines) volgen in de sidebar zodra Johan ze als
 * taxonomie aanmaakt; de structuur is identiek aan materials.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ChannelBarNav, EmptyState } from '@/components/ui'
import type { FilterSection, FilterSelection } from '@/components/ui'
import type { Channel } from '@/lib/api/channels'
import { listBooks } from '@/lib/api/books'
import type { BookListItem } from '@/types/book'
import { JsonLd, buildBreadcrumbList, canonicalPath } from '@/lib/seo'
import { BooksFilterSidebar } from './_components/BooksFilterSidebar'
import { BooksGrid } from './_components/BooksGrid'
import { BooksPagination } from './_components/BooksPagination'

const pagePath = canonicalPath('/book')
const PER_PAGE = 24

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Browse books, exhibition catalogues and publications on innovative and sustainable materials. Insider members save on every title.',
  alternates: { canonical: pagePath },
  openGraph: {
    title: 'Books | MaterialDistrict',
    description:
      'Books, exhibition catalogues and publications on innovative and sustainable materials.',
    type: 'website',
    url: pagePath,
  },
}

interface BooksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function asArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return []
  return (Array.isArray(v) ? v : [v]).map((s) => s.trim()).filter(Boolean)
}
function asSingle(v: string | string[] | undefined): string | undefined {
  const a = asArray(v)
  return a[0]
}

/** Tel opties (waarde→aantal) over een set boeken, geef gesorteerde FilterOptions. */
function countOptions(
  books: BookListItem[],
  pick: (b: BookListItem) => string | null,
): Array<{ value: string; label: string; count: number }> {
  const counts = new Map<string, number>()
  for (const b of books) {
    const v = pick(b)
    if (!v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams

  const search = asSingle(params.q)
  const channel = asSingle(params.channel)
  const formatSel = asArray(params.format)
  const publisherSel = asArray(params.publisher)
  const labelSel = asArray(params.label)
  const page = Math.max(1, Number.parseInt(asSingle(params.page) ?? '1', 10) || 1)

  // Hele (kleine) catalogus ophalen — basis voor channels + facetten.
  const all = (await listBooks({ page: 1, perPage: 100 })).items

  // Channels (gesorteerd, met tellingen) voor de balk.
  const channelCounts = new Map<string, { id: number; label: string; count: number }>()
  for (const b of all) {
    for (const c of b.channels) {
      const cur = channelCounts.get(c.slug)
      if (cur) cur.count += 1
      else channelCounts.set(c.slug, { id: c.id, label: c.name, count: 1 })
    }
  }
  const channels: Channel[] = [...channelCounts.entries()]
    .map(([slug, v]) => ({ id: v.id, slug, label: v.label, count: v.count }))
    .sort((a, b) => a.label.localeCompare(b.label))

  // Zoek + channel = de basis waarop de facet-tellingen worden berekend.
  const q = search?.toLowerCase()
  const facetBase = all.filter((b) => {
    if (q) {
      const hay = `${b.title} ${b.publisher ?? ''} ${b.author ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (channel && !b.channels.some((c) => c.slug === channel)) return false
    return true
  })

  const formatOptions = countOptions(facetBase, (b) => b.format)
  const publisherOptions = countOptions(facetBase, (b) => b.publisher)
  const saleCount = facetBase.filter((b) => b.onSale).length

  // Sidebar-secties (Publisher bewust ZONDER zoekbox).
  const sections: FilterSection[] = []
  if (formatOptions.length > 0)
    sections.push({ key: 'format', title: 'Format', options: formatOptions })
  if (publisherOptions.length > 0)
    sections.push({ key: 'publisher', title: 'Publisher', options: publisherOptions })
  if (saleCount > 0)
    sections.push({
      key: 'label',
      title: 'Labels',
      options: [{ value: 'sale', label: 'On sale', count: saleCount }],
    })

  const selection: FilterSelection = {
    format: formatSel,
    publisher: publisherSel,
    label: labelSel,
  }

  // Definitieve filtering voor het grid.
  const filtered = facetBase.filter((b) => {
    if (formatSel.length > 0 && !(b.format && formatSel.includes(b.format)))
      return false
    if (
      publisherSel.length > 0 &&
      !(b.publisher && publisherSel.includes(b.publisher))
    )
      return false
    if (labelSel.includes('sale') && !b.onSale) return false
    return true
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const hasActiveFilters = Boolean(
    search ||
      channel ||
      formatSel.length ||
      publisherSel.length ||
      labelSel.length,
  )

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Books' }]} />
          <h1 className="t-display-lg">Books</h1>
        </div>
      </header>

      <ChannelBarNav
        channels={channels}
        activeSlug={channel}
        initialSearch={search ?? ''}
        searchPlaceholder={
          all.length > 0
            ? `Search ${all.length.toLocaleString('en-US')} books`
            : 'Search books…'
        }
      />

      <div className="ov-wrap">
        <BooksFilterSidebar sections={sections} selected={selection} />

        <div>
          {pageItems.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No books match your filters"
                description="Try different filters or clear them to see all books."
                actions={
                  <Button as="link" href="/book" variant="outline" size="sm">
                    Clear filters
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
                <BooksGrid items={pageItems} />
              </Suspense>

              {totalPages > 1 && (
                <div className="ov-pagination">
                  <BooksPagination currentPage={safePage} totalPages={totalPages} />
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
