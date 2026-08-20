/**
 * FeaturedChannel — homepage-blok "Featured channel".
 */

import Link from 'next/link'
import { MdImage } from '@/components/ui'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import { resolveImageUrl } from '@/lib/images'
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
  const heroSrc = channel.thumbnailUrl
    ? resolveImageUrl(channel.thumbnailUrl, 'listing-wide')?.url
    : null

  return (
    <section className="hp-section hp-featured-channel" aria-label="Featured channel">
      <div className="section-hd">
        <h2 className="section-title">Featured channel</h2>
        <Link href={channelHref} className="section-link">
          All channels →
        </Link>
      </div>

      <div className="hp-channel-hero">
        {heroSrc && (
          <MdImage
            src={heroSrc}
            role="listing-wide"
            alt=""
            fill
            className="hp-channel-hero-img"
          />
        )}
        <Link
          href={channelHref}
          className="hp-channel-hero-link"
          aria-label={`Explore ${channel.label}`}
        />
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
                >
                  {m.hero && (
                    <MdImage
                      image={m.hero}
                      role="listing-mini"
                      alt=""
                      fill
                      className="hp-channel-thumb-img"
                    />
                  )}
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
