/**
 * ChannelHero — hero voor de channel-hub (stap 12).
 *
 * Achtergrond = `theme_thumbnail` via het toegestane custom-property-patroon
 * (`--channel-hero-img`, net als `--story-thumb`) — geen inline background.
 * Ontbreekt de thumbnail, dan valt de hero terug op de `is-plain`-variant
 * (effen surface).
 *
 * §VISUAL-ROUND-18-06 punt 2: de hero toont GEEN teaser meer. De volledige
 * description rendert al als prose ónder de hero (in de page); de afgekapte
 * teaser hier was een letterlijke dubbeling. Naam + follow-toggle blijven.
 */

import type { CSSProperties } from 'react'
import type { ChannelTerm } from '@/lib/api'
import { FollowToggle } from '@/components/ui/FollowToggle'

export function ChannelHero({ channel }: { channel: ChannelTerm }) {
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
