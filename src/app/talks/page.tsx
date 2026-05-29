/**
 * `/talks` — talks-overzichtspagina met search, grid en paginatie.
 *
 * Sessie 7. Server Component. Leest searchParams (q, page), haalt talks op en
 * rendert de overzichts-shell rond een `ContentCard`-grid. Volgt dezelfde
 * page-header als /articles en /brands (design-system §6.1: `ov-page-header`),
 * maar single-column (`ov-wrap-single`): talks heeft in v1 niks om op te
 * filteren (channels vastgehouden tot de aparte channel-sessie, geen
 * story-type, datum onbetrouwbaar voor past/upcoming).
 *
 * URL-structuur:
 *   /talks?q=biobased&page=2
 *
 * Insider-only (C14): `talk.insiderOnly` komt uit `meta.insider_only`
 * (talk-default true); cards tonen de InsiderMark voor Insider-only talks.
 *
 * Speakers (C11): `talk.speakers` (persons-taxonomy) voedt de card-meta-regel.
 *
 * EmptyState bij 0 resultaten — geen 404 (een zoek met 0 matches is een
 * geldige query). Twee varianten: met of zonder actieve zoekterm.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ContentCard, EmptyState } from '@/components/ui'
import { listTalks } from '@/lib/api'
import { JsonLd, buildBreadcrumbList } from '@/lib/seo'
import { TalksPagination } from './_components/TalksPagination'
import { TalksSearchInput } from './_components/TalksSearchInput'

const TALKS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Talks',
  description:
    'Lectures, panels and conversations on materials and the built environment — watch the latest talks from MaterialDistrict.',
  alternates: { canonical: '/talks' },
  openGraph: {
    title: 'Talks | MaterialDistrict',
    description:
      'Lectures, panels and conversations on materials and the built environment.',
    type: 'website',
    url: '/talks',
  },
}

interface TalksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Parse `?page=` naar een 1-based paginanummer (default 1). */
function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/** Datumlabel — en-GB, consistent met de andere detail/overzicht-pages. */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function TalksPage({ searchParams }: TalksPageProps) {
  const params = await searchParams

  const search =
    (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined
  const page = parsePage(params.page)

  const result = await listTalks({
    perPage: TALKS_PER_PAGE,
    page,
    search,
  })

  const total = result.total
  const hasActiveFilters = Boolean(search)

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Talks' }]} />
          <h1 className="t-display-lg">Talks</h1>
          {total > 0 && (
            <p className="t-body">
              {total.toLocaleString('en-US')} {total === 1 ? 'talk' : 'talks'}
              {hasActiveFilters ? ' matching your search' : ''}
            </p>
          )}
        </div>
        <div className="ov-page-header-aside">
          <TalksSearchInput initialValue={search ?? ''} />
        </div>
      </header>

      <div className="ov-wrap-single">
        {result.items.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              title="No talks match your search"
              description="Try a different search term to see more."
              actions={
                <Button as="link" href="/talks" variant="outline" size="sm">
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No talks available"
              description="There are currently no talks to show. Please check back later."
            />
          )
        ) : (
          <>
            <Suspense fallback={null}>
              <div className="ov-grid-3">
                {result.items.map((talk) => (
                  <ContentCard
                    key={talk.id}
                    href={`/talks/${talk.slug}`}
                    contentType="talk"
                    thumbSrc={talk.hero?.sourceUrl}
                    thumbAlt={talk.hero?.alt ?? talk.title}
                    eyebrow={formatDate(talk.date)}
                    title={talk.title}
                    meta={
                      talk.speakers.length > 0
                        ? talk.speakers.map((s) => s.name)
                        : undefined
                    }
                    isInsiderOnly={talk.insiderOnly}
                  />
                ))}
              </div>
            </Suspense>

            {result.totalPages > 1 && (
              <div className="ov-pagination">
                <TalksPagination
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
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Talks' },
          ]),
        ]}
      />
    </>
  )
}
