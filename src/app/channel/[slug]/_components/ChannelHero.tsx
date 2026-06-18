/**
 * ChannelHero — hero voor de channel-hub (stap 12).
 *
 * Achtergrond = `theme_thumbnail` via het toegestane custom-property-patroon
 * (`--channel-hero-img`, net als `--story-thumb`) — geen inline background.
 * Ontbreekt de thumbnail, dan valt de hero terug op de `is-plain`-variant
 * (effen surface). Toont de naam + een op 2 regels afgekapte teaser; de
 * volledige description rendert als prose ónder de hero (in de page).
 */

import type { CSSProperties } from 'react'
import type { ChannelTerm } from '@/lib/api'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import { FollowToggle } from '@/components/ui/FollowToggle'

function toPlainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

export function ChannelHero({ channel }: { channel: ChannelTerm }) {
  const teaser = channel.description ? toPlainText(channel.description) : ''
  const heroStyle = channel.thumbnailUrl
    ? ({ '--channel-hero-img': `url(${channel.thumbnailUrl})` } as CSSProperties)
    : undefined

  return (
    <header
      className={`channel-hero${channel.thumbnailUrl ? '' : ' is-plain'}`}
      style={heroStyle}
    >
      <div className="channel-hero-inner">
        <p className="channel-hero-eyebrow">Channel</p>
        <h1 className="channel-hero-title">{channel.label}</h1>
        {teaser && <p className="channel-hero-desc">{teaser}</p>}
        <div className="channel-hero-follow">
          <FollowToggle
            entityType="channel"
            entityId={channel.id}
            entityName={channel.label}
          />
        </div>
      </div>
    </header>
  )
}
