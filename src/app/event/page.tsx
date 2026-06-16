/**
 * `/event` — events-overzichtspagina.
 *
 * Sessie 8.
 *
 * Server Component. Haalt events op (ruime enkele fetch), resolve't heroes,
 * en sorteert server-side: aankomende events eerst (oplopend op start), daarna
 * voorbije events (aflopend). Filtering op channel + tekst gebeurt client-side
 * in `EventsBrowser` — bewuste keuze:
 *
 *   WP kan niet `orderby` op de meta-datum `date_start` (geen meta-orderby op
 *   het standaard-endpoint), dus een correcte chronologische volgorde óver
 *   WP-paginatie heen is niet mogelijk. De events-set is bescheiden, dus we
 *   halen 'm in één keer op en sorteren/filteren in de app. Dit matcht ook de
 *   mockup (`renderEventsOverview` filtert client-side). Een meta-orderby-
 *   endpoint met echte paginatie kan later, zonder de UI te raken.
 *
 * Shell: `ov-page-header` + `ov-wrap` (design-system §6.1), net als de andere
 * overzichten. De ChannelBar + search zitten in de client-component.
 */

import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ChannelBarNav } from '@/components/ui'
import { listEvents, getChannelCatalog } from '@/lib/api'
import { JsonLd, buildBreadcrumbList } from '@/lib/seo'
import { sortEventsByDate } from './_lib/events-order'
import { EventsBrowser } from './_components/EventsBrowser'

/** Ruime bovengrens voor de enkele fetch. Events zijn een bescheiden set. */
const EVENTS_FETCH_LIMIT = 100

export const metadata: Metadata = {
  title: 'Events',
  description:
    'MaterialDistrict events, tradeshows, lectures and workshops worldwide — fairs, exhibitions and online sessions on materials and the built environment.',
  alternates: { canonical: '/event' },
  openGraph: {
    title: 'Events | MaterialDistrict',
    description:
      'MaterialDistrict events, tradeshows, lectures and workshops worldwide.',
    type: 'website',
    url: '/event',
  },
}

/**
 * Splits + sorteer: aankomend (eind ≥ nu) oplopend op start, daarna voorbij
 * aflopend op start. Zie `_lib/events-order` voor de gedeelde logica (ook
 * gebruikt door de detailpagina voor prev/next + "other events").
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const channelSlug =
    (Array.isArray(params.channel) ? params.channel[0] : params.channel)?.trim() || undefined
  const search =
    (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() || undefined

  const [{ items }, channels] = await Promise.all([
    listEvents({ perPage: EVENTS_FETCH_LIMIT, page: 1 }),
    getChannelCatalog(),
  ])
  const events = sortEventsByDate(items)

  return (
    <>
      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Events' }]} />
          <h1 className="t-display-lg">Events</h1>
        </div>
      </header>

      <ChannelBarNav
        channels={channels}
        activeSlug={channelSlug}
        initialSearch={search ?? ''}
        searchPlaceholder={
          events.length > 0 ? `Search ${events.length} events` : 'Search events…'
        }
      />

      <EventsBrowser events={events} channelSlug={channelSlug} search={search} />

      <JsonLd
        data={[
          buildBreadcrumbList([{ label: 'Home', url: '/' }, { label: 'Events' }]),
        ]}
      />
    </>
  )
}
