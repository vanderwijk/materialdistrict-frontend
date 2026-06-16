/**
 * `/talk` — talks-overzichtspagina met channel/zoek (server) + een LINKER
 * filter-sidebar voor jaar/spreker/insider (client) en client-side paginatie.
 *
 * Sessie 7; §F2.10 P14.1: van server-paginatie naar load-all + <TalksBrowser>.
 * §F2.11 P7: de jaar/spreker-filter (voorheen een bovenbalk) verhuist naar een
 * linker sidebar, consistent met materials/brands — de twee-koloms .ov-wrap.
 * §F2.11 P8: er komt een "Insider only"-optie bij in dezelfde sidebar.
 *
 * Channel (`?channel=`) en zoekterm (`?q=`) blijven server-/URL-gedreven via de
 * gedeelde ChannelBarNav; de volledige matchende set wordt in één keer geladen
 * en client-side gefilterd (jaar + spreker + insider) en gepagineerd.
 *
 * EmptyState bij 0 server-resultaten op channel/zoek (single-column) — geen
 * 404. Het sidebar-filter heeft zijn eigen lege-staat binnen TalksBrowser.
 */

import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button, ChannelBarNav, EmptyState } from '@/components/ui'
import { listTalks, getChannelCatalog, resolveChannelId } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, canonicalPath } from '@/lib/seo'
import { TalksBrowser, type TalksBrowserItem } from './_components/TalksBrowser'

// De volledige matchende set wordt in één keer geladen (WP-max per page),
// daarna client-side gefilterd/gepagineerd. Talks is een bescheiden,
// curated set; 100 dekt de catalogus ruim.
const TALKS_LOAD_ALL = 100

const pagePath = canonicalPath('/talk')

export const metadata: Metadata = {
  title: 'Talks',
  description:
    'Lectures, panels and conversations on materials and the built environment — watch the latest talks from MaterialDistrict.',
  alternates: { canonical: pagePath },
  openGraph: {
    title: 'Talks | MaterialDistrict',
    description:
      'Lectures, panels and conversations on materials and the built environment.',
    type: 'website',
    url: pagePath,
  },
}

interface TalksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TalksPage({ searchParams }: TalksPageProps) {
  const params = await searchParams

  const search =
    (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined
  const channelSlug =
    (Array.isArray(params.channel) ? params.channel[0] : params.channel)?.trim() ||
    undefined

  const channels = await getChannelCatalog()
  const themeId = resolveChannelId(channels, channelSlug) ?? undefined

  const result = await listTalks({
    perPage: TALKS_LOAD_ALL,
    page: 1,
    search,
    theme: themeId,
  })

  const total = result.total
  const hasActiveFilters = Boolean(search) || Boolean(channelSlug)

  const browserTalks: TalksBrowserItem[] = result.items.map((talk) => ({
    id: talk.id,
    slug: talk.slug,
    title: talk.title,
    date: talk.date,
    heroUrl: talk.hero?.sourceUrl,
    heroAlt: talk.hero?.alt ?? talk.title,
    speakerNames: talk.speakers.map((s) => s.name),
    insiderOnly: talk.insiderOnly,
  }))

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Talks' }]} />
          <h1 className="t-display-lg">Talks</h1>
        </div>
      </header>

      <ChannelBarNav
        channels={channels}
        activeSlug={channelSlug}
        initialSearch={search ?? ''}
        searchPlaceholder={
          total > 0 ? `Search ${total.toLocaleString('en-US')} talks` : 'Search talks…'
        }
      />

      {result.items.length === 0 ? (
        <div className="ov-wrap-single">
          {hasActiveFilters ? (
            <EmptyState
              title="No talks match your search"
              description="Try a different search term to see more."
              actions={
                <Button as="link" href="/talk" variant="outline" size="sm">
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No talks available"
              description="There are currently no talks to show. Please check back later."
            />
          )}
        </div>
      ) : (
        <div className="ov-wrap">
          <TalksBrowser talks={browserTalks} />
        </div>
      )}

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
