/**
 * FeaturedChannel — homepage-blok "Featured channel".
 *
 * Build-order stap 10, S10.2. Server-component, presentational: krijgt het
 * (featured-first gesorteerde) kanaal + een reeks recente materialen. Toont
 * één grote hero-afbeelding met naam + korte omschrijving + deeplink, en —
 * óver de foto, onderin — een compacte strip vierkante thumbnails (wit
 * kadertje) van recente materialen, zodat die zichtbaar bij het kanaal horen.
 * Merk + titel verschijnen in een hover-tooltip.
 *
 * De hero is bewust géén <Link>-wrapper: de thumbnails zijn zelf links, en
 * geneste anchors zijn ongeldig. Titel + knop linken expliciet door.
 *
 * Niets te tonen (geen kanaal of geen materialen) → de sectie verdwijnt.
 */

import Link from 'next/link'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import type { MaterialListItem } from '@/types/material'

export interface FeaturedChannelVM {
  slug: string
  label: string
  /** Korte platte omschrijving (HTML al gestript). Lege string toegestaan. */
  description: string
  /** Header-beeld; null → effen vlak. */
  thumbnailUrl: string | null
  count: number
}

export interface FeaturedChannelProps {
  channel: FeaturedChannelVM | null
  materials: MaterialListItem[]
}

export function FeaturedChannel({ channel, materials }: FeaturedChannelProps) {
  if (!channel || materials.length === 0) return null

  const channelHref = `/channel/${channel.slug}`

  return (
    <section className="hp-section hp-featured-channel" aria-label="Featured channel">
      <div className="section-hd">
        <h2 className="section-title">Featured channel</h2>
        <Link href={channelHref} className="section-link">
          All channels →
        </Link>
      </div>

      <div
        className="hp-channel-hero"
        style={
          channel.thumbnailUrl
            ? { backgroundImage: `url(${channel.thumbnailUrl})` }
            : undefined
        }
      >
        <div className="hp-channel-hero-inner">
          <p className="hp-channel-eyebrow">Channel</p>
          <h3 className="hp-channel-title">
            <Link href={channelHref} className="hp-channel-title-link">
              {channel.label}
            </Link>
          </h3>
          {channel.description && (
            <p className="hp-channel-desc">{channel.description}</p>
          )}
          <Link href={channelHref} className="btn btn-lg btn-on-photo">
            Explore channel →
          </Link>
        </div>

        <ul className="hp-channel-thumbs">
          {materials.slice(0, 8).map((m) => {
            const label = [m.brandName, m.title].filter(Boolean).join(' — ')
            return (
              <li key={m.id}>
                <Link
                  href={`/material/${m.slug}`}
                  className="hp-channel-thumb"
                  aria-label={label}
                  style={
                    m.hero?.sourceUrl
                      ? { backgroundImage: `url(${m.hero.sourceUrl})` }
                      : undefined
                  }
                >
                  <span className="hp-channel-thumb-tip" aria-hidden="true">
                    {m.brandName && (
                      <span className="hp-channel-thumb-brand">{m.brandName}</span>
                    )}
                    <span className="hp-channel-thumb-title">{m.title}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** HTML → korte platte tekst voor de header-omschrijving. */
export function toChannelPlainText(html: string, max = 180): string {
  const text = decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}
