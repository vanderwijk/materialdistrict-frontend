/**
 * FeaturedChannel — homepage-blok dat het uitgelichte kanaal toont.
 *
 * Build-order stap 10, S10.2. Server-component, presentational: krijgt het
 * (featured-first gesorteerde) kanaal + een reeks recente materialen van de
 * homepage-server-component. Toont een header-beeld + naam + korte omschrijving
 * met een deeplink naar de channel-hub, gevolgd door een rij materiaal-
 * thumbnails.
 *
 * Niets te tonen (geen kanaal of geen materialen) → de sectie verdwijnt.
 * Header-beeld + omschrijving zijn redactioneel (Johan/redactie vult ontbrekende
 * `theme_thumbnail`/description per kanaal); ontbreekt het beeld, dan valt de
 * header terug op een effen vlak.
 */

import Link from 'next/link'
import { ContentCard } from '@/components/ui'
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

  return (
    <section className="hp-section hp-featured-channel" aria-label="Featured channel">
      <div className="section-hd">
        <h2 className="section-title">In the spotlight</h2>
        <Link href={`/channel/${channel.slug}`} className="section-link">
          All channels →
        </Link>
      </div>

      <Link
        href={`/channel/${channel.slug}`}
        className="hp-channel-hero"
        style={
          channel.thumbnailUrl
            ? { backgroundImage: `url(${channel.thumbnailUrl})` }
            : undefined
        }
      >
        <div className="hp-channel-hero-inner">
          <p className="hp-channel-eyebrow">Channel</p>
          <h3 className="hp-channel-title">{channel.label}</h3>
          {channel.description && (
            <p className="hp-channel-desc">{channel.description}</p>
          )}
          <span className="btn btn-lg btn-on-photo">Explore channel →</span>
        </div>
      </Link>

      <div className="hp-channel-materials">
        {materials.slice(0, 10).map((m) => (
          <ContentCard
            key={m.id}
            className="hp-channel-material"
            href={`/material/${m.slug}`}
            contentType="material"
            showTypeBadge={false}
            currentChannel={channel.label}
            thumbSrc={m.hero?.sourceUrl}
            thumbAlt={m.hero?.alt ?? m.title}
            eyebrow={m.brandName ?? undefined}
            title={m.title}
          />
        ))}
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
