/**
 * ChannelHero — hero voor de channel-hub (stap 12).
 *
 * Achtergrond = `theme_thumbnail` via het toegestane custom-property-patroon
 * (`--channel-hero-img`, net als `--story-thumb`) — geen inline background.
 * Ontbreekt de thumbnail, dan valt de hero terug op de `is-plain`-variant
 * (effen surface).
 *
 * Herontwerp (feedback 21-06): de hero is lager en compacter. Titel en
 * follow-control staan op één regel (titel links, bel + toggle rechts); de
 * channel-description staat nu wít ín de hero over de foto (i.p.v. donker op
 * papier eronder), zodat de hoogte in lijn ligt met de homepage-hero.
 */

import type { CSSProperties } from 'react'
import type { ChannelTerm } from '@/lib/api'
import { FollowToggle } from '@/components/ui/FollowToggle'
import { IconBell } from '@/components/ui/icons'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'

function toPlainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

export function ChannelHero({ channel }: { channel: ChannelTerm }) {
  const heroStyle = channel.thumbnailUrl
    ? ({ '--channel-hero-img': `url(${channel.thumbnailUrl})` } as CSSProperties)
    : undefined
  const description = channel.description ? toPlainText(channel.description) : null

  return (
    <header
      className={`channel-hero${channel.thumbnailUrl ? '' : ' is-plain'}`}
      style={heroStyle}
    >
      <div className="channel-hero-inner">
        <p className="channel-hero-eyebrow">Channel</p>
        <div className="channel-hero-row">
          <h1 className="channel-hero-title">{channel.label}</h1>
          <div className="channel-hero-follow">
            <IconBell
              size={18}
              strokeWidth={2}
              className="channel-hero-bell"
              aria-hidden
            />
            <FollowToggle
              entityType="channel"
              entityId={channel.id}
              entityName={channel.label}
            />
          </div>
        </div>
        {description && <p className="channel-hero-desc">{description}</p>}
      </div>
    </header>
  )
}
