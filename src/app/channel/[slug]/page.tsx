/**
 * `/channel/[slug]` — gemengde cross-entity channel-hub (stap 12).
 *
 * Server Component. Resolved de slug via `getChannelHub`; onbekend of volledig
 * leeg channel → `notFound()` (keuze 6). Rendert een hero (naam + description +
 * `theme_thumbnail`) gevolgd door een strip per content-type in topmenu-volgorde
 * (Materials → Stories → Brands → Events → Talks; Books later, tussen Events en
 * Talks). Elke strip: de eerste 8 items + een "view all … in {channel}"-deeplink
 * naar het in-place gefilterde overzicht (`/material?channel=…`, enz.). Lege
 * types vallen weg. Materials-strip gebruikt WP REST (`?theme=<id>`), geen FacetWP.
 *
 * SEO: BreadcrumbList + CollectionPage (ItemList van de getoonde items als
 * interne cluster-links), unieke metadata + canonical per channel.
 *
 * Materials/stories/events/talks gebruiken de universele `ContentCard`; brands
 * de `BrandTile` (visueel distinct logo-tegel) — beide hergebruikt, geen nieuwe
 * kaarttypes.
 */

import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { BrandTile, ContentCard } from '@/components/ui'
import { getChannelHub, getChannelTerm } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildCollectionPage, canonicalPath } from '@/lib/seo'
import { ViewLogger } from '@/components/ui/ViewLogger'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import type { EventListItem } from '@/types/event'
import { ChannelHero } from './_components/ChannelHero'
import { ChannelStrip } from './_components/ChannelStrip'

/**
 * §BETA-FIX-24-08 (X1) — zelfde soft-404-fix als de detailroutes.
 *
 * `force-static` bakte ook de niet-gevonden-uitkomst voor, waardoor een
 * onbekend of leeg channel de 404-pagina toonde met status 200. Met
 * `dynamicParams` + `revalidate` blijft de ISR-caching intact en levert
 * `notFound()` weer een echte 404. Lees in deze subtree geen request-data
 * server-side; dat zou de route alsnog dynamisch maken.
 */
export const dynamicParams = true

/**
 * Leeg, maar noodzakelijk. Samen met `dynamicParams` markeert dit de route als
 * statisch-met-ISR: pagina's worden op verzoek gebouwd, daarna op het CDN
 * bewaard en op de timer ververst. Zónder deze functie behandelt Next de route
 * als volledig dynamisch — dan rendert élke bezoeker (en élke crawler) de
 * pagina opnieuw en bevraagt WordPress opnieuw. Dat was de reden voor het
 * eerdere `force-static`; deze regel neemt die taak over, maar laat
 * `notFound()` wél een echte 404 geven. Geen build-time prerender: de lijst is
 * bewust leeg om een request-storm tijdens de Vercel-build te voorkomen.
 */
export async function generateStaticParams() {
  return []
}



const STRIP_LIMIT = 8

/**
 * On-demand ISR — geen build-time prerender van alle ~20 channels.
 * `generateStaticParams` veroorzaakte een WP-request-storm tijdens Vercel
 * build (429 Too Many Requests op batch media-fetches).
 */
export const revalidate = 3600

interface ChannelHubPageProps {
  params: Promise<{ slug: string }>
}

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

function toPlainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function eventDateLabel(event: EventListItem): string | undefined {
  if (event.startsAt) return formatDate(event.startsAt)
  return event.startDate ?? undefined
}

function eventLocationLabel(event: EventListItem): string {
  if (event.type === 'online' || !event.venue) return 'Online'
  const { city, country } = event.venue
  return [city, country?.label].filter(Boolean).join(', ') || event.venue.name
}

function countLabel(n: number, singular: string, plural: string): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? singular : plural}`
}

// --------------------------------------------------------------------
// Metadata
// --------------------------------------------------------------------

export async function generateMetadata({
  params,
}: ChannelHubPageProps): Promise<Metadata> {
  const { slug } = await params
  const term = await getChannelTerm(slug)
  if (!term) return { title: 'Channel' }

  const description = term.description
    ? toPlainText(term.description).slice(0, 160)
    : `Explore materials, stories, brands, events and talks in the ${term.label} channel on MaterialDistrict.`

  return {
    title: `${term.label} — Channels`,
    description,
    alternates: { canonical: canonicalPath(`/channel/${slug}`) },
  }
}

// --------------------------------------------------------------------
// Page
// --------------------------------------------------------------------

export default async function ChannelHubPage({ params }: ChannelHubPageProps) {
  const { slug } = await params
  const hub = await getChannelHub(slug, STRIP_LIMIT)
  if (!hub || hub.isEmpty) notFound()

  const { channel, materials, stories, brands, events, talks } = hub

  // Eén gecombineerde ItemList voor de CollectionPage (interne cluster-links).
  const collectionItems = [
    ...materials.items.map((m) => ({ name: m.title, url: `/material/${m.slug}` })),
    ...stories.items.map((a) => ({ name: a.title, url: `/article/${a.slug}` })),
    ...brands.items.map((b) => ({ name: b.name, url: `/brand/${b.slug}` })),
    ...events.items.map((e) => ({ name: e.title, url: `/event/${e.slug}` })),
    ...talks.items.map((t) => ({ name: t.title, url: `/talk/${t.slug}` })),
  ]

  return (
    <>
      <ViewLogger objectType="channel" objectId={channel.id} />
      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Channels', url: '/channel' },
            { label: channel.label, url: `/channel/${slug}` },
          ]),
          buildCollectionPage({
            name: channel.label,
            description: channel.description
              ? toPlainText(channel.description)
              : undefined,
            url: `/channel/${slug}`,
            image: channel.thumbnailUrl,
            items: collectionItems,
          }),
        ]}
      />

      <ChannelHero channel={channel} />

      <div className="ov-wrap-single">
        <Breadcrumb
          items={[{ label: 'Channels' }, { label: channel.label }]}
        />

        {materials.items.length > 0 && (
          <ChannelStrip
            title="Materials"
            viewAllHref={`/material?channel=${slug}`}
            viewAllLabel={`View all ${countLabel(materials.total, 'material', 'materials')} in ${channel.label}`}
          >
            {materials.items.map((m) => (
              <ContentCard
                key={m.id}
                href={`/material/${m.slug}`}
                contentType="material"
                showTypeBadge={false}
                thumbImage={m.hero}
                thumbAlt={m.hero?.alt ?? m.title}
                eyebrow={m.brandName ?? undefined}
                title={m.title}
              />
            ))}
          </ChannelStrip>
        )}

        {stories.items.length > 0 && (
          <ChannelStrip
            title="Stories"
            viewAllHref={`/article?channel=${slug}`}
            viewAllLabel={`View all ${countLabel(stories.total, 'story', 'stories')} in ${channel.label}`}
          >
            {stories.items.map((a) => (
              <ContentCard
                key={a.id}
                href={`/article/${a.slug}`}
                contentType="article"
                showTypeBadge={false}
                thumbImage={a.hero}
                thumbAlt={a.hero?.alt ?? a.title}
                eyebrow={formatDate(a.date)}
                title={a.title}
                channelTags={a.channels.map((c) => c.label)}
                currentChannel={channel.label}
                isInsiderOnly={a.insiderOnly}
              />
            ))}
          </ChannelStrip>
        )}

        {brands.items.length > 0 && (
          <ChannelStrip
            title="Brands"
            viewAllHref={`/brand?channel=${slug}`}
            viewAllLabel={`View all ${countLabel(brands.total, 'brand', 'brands')} in ${channel.label}`}
            gridClassName="ov-grid-brands"
          >
            {brands.items.map((b) => (
              <BrandTile key={b.id} brand={b} />
            ))}
          </ChannelStrip>
        )}

        {events.items.length > 0 && (
          <ChannelStrip
            title="Events"
            viewAllHref={`/event?channel=${slug}`}
            viewAllLabel={`View all ${countLabel(events.total, 'event', 'events')} in ${channel.label}`}
          >
            {events.items.map((e) => (
              <ContentCard
                key={e.id}
                href={`/event/${e.slug}`}
                contentType="event"
                showTypeBadge={false}
                thumbImage={e.hero}
                thumbAlt={e.hero?.alt ?? e.title}
                eyebrow={eventDateLabel(e)}
                title={e.title}
                meta={eventLocationLabel(e)}
                channelTags={e.channels.map((c) => c.label)}
                currentChannel={channel.label}
              />
            ))}
          </ChannelStrip>
        )}

        {talks.items.length > 0 && (
          <ChannelStrip
            title="Talks"
            viewAllHref={`/talk?channel=${slug}`}
            viewAllLabel={`View all ${countLabel(talks.total, 'talk', 'talks')} in ${channel.label}`}
          >
            {talks.items.map((t) => (
              <ContentCard
                key={t.id}
                href={`/talk/${t.slug}`}
                contentType="talk"
                showTypeBadge={false}
                thumbImage={t.hero}
                thumbAlt={t.hero?.alt ?? t.title}
                eyebrow={t.speakers.length > 0 ? t.speakers[0].name : undefined}
                title={t.title}
                meta={formatDate(t.date)}
                isInsiderOnly={t.insiderOnly}
              />
            ))}
          </ChannelStrip>
        )}
      </div>
    </>
  )
}
