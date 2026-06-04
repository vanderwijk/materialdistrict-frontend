/**
 * `/channels` — index van alle channels (stap 12).
 *
 * Server Component. Haalt de channel-index op (`getChannelsIndex`: catalogus +
 * term-presentatievelden, featured-vooraan-gesorteerd in de datalaag) en
 * rendert een grid van `ChannelIndexCard`s. Geen ChannelBar/FacetWP hier — dit
 * is de primaire ingang naar de hubs, los van de in-place bar-filter.
 *
 * SEO: BreadcrumbList + CollectionPage (met een ItemList van de channel-hubs)
 * als interne cluster-links. Canonical = `/channels`.
 *
 *   ov-page-header (breadcrumb + h1 + intro)
 *   ov-wrap-single (ov-grid-3 met channel-kaarten)
 */

import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { EmptyState } from '@/components/ui'
import { getChannelsIndex } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildCollectionPage } from '@/lib/seo'
import { ChannelIndexCard } from './_components/ChannelIndexCard'

const PAGE_DESCRIPTION =
  'Explore MaterialDistrict by channel — topic hubs that bring together materials, stories, brands, events and talks around themes like biobased, circular and acoustic.'

export const metadata: Metadata = {
  title: 'Channels',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/channels' },
}

export default async function ChannelsIndexPage() {
  const channels = await getChannelsIndex()

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Channels', url: '/channels' },
          ]),
          channels.length > 0
            ? buildCollectionPage({
                name: 'Channels',
                description: PAGE_DESCRIPTION,
                url: '/channels',
                items: channels.map((c) => ({
                  name: c.label,
                  url: `/channels/${c.slug}`,
                })),
              })
            : null,
        ]}
      />

      <header className="ov-page-header">
        <div className="ov-page-header-main">
          <Breadcrumb items={[{ label: 'Channels' }]} />
          <h1 className="t-display-lg">Channels</h1>
          <p className="t-body">
            Browse materials, stories, brands, events and talks grouped by theme.
          </p>
        </div>
      </header>

      <div className="ov-wrap-single">
        {channels.length === 0 ? (
          <EmptyState
            title="No channels available"
            description="Channels are being set up. Please check back soon."
          />
        ) : (
          <div className="ov-grid-3">
            {channels.map((channel) => (
              <ChannelIndexCard key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
