/**
 * ChannelIndexCard — tegel voor de `/channel`-index (stap 12).
 *
 * Een channel is een topic-hub, geen content-item, dus bewust géén
 * `ContentCard` (die vereist een content-type-tag en heeft geen description-
 * slot). Wél gebouwd op de gedeelde `Card`-primitives (frame, thumb, hover,
 * image-handling) + de bestaande `.content-card-*` klassen, met alleen
 * `.channel-card-desc` als nieuwe regel.
 *
 * - Thumbnail uit `theme_thumbnail`; ontbreekt die, dan toont `.card-thumb`
 *   zijn neutrale placeholder (`--surface2`).
 * - Description (term-HTML) wordt naar platte tekst gestript en op 2 regels
 *   afgekapt.
 * - Meta = de **materials**-telling (keuze 4).
 * - `featured` (WF-6) toont een eyebrow "Featured"; sortering staat al in de
 *   datalaag.
 */

import { Card } from '@/components/ui'
import { decodeHtmlEntities } from '@/lib/utils/decode-html-entities'
import type { ChannelIndexItem } from '@/lib/api'

/** Strip HTML-tags + decode entities → platte teaser-tekst. */
function toPlainText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

export function ChannelIndexCard({ channel }: { channel: ChannelIndexItem }) {
  const description = channel.description ? toPlainText(channel.description) : ''
  const countLabel = `${channel.count.toLocaleString('en-US')} ${
    channel.count === 1 ? 'material' : 'materials'
  }`

  return (
    <Card href={`/channel/${channel.slug}`} ariaLabel={`${channel.label} channel`}>
      <Card.Thumb src={channel.thumbnailUrl ?? undefined} alt="" />
      <Card.Body>
        {channel.featured && <div className="content-card-eyebrow">Featured</div>}
        <h2 className="content-card-title">{channel.label}</h2>
        {description && <p className="channel-card-desc">{description}</p>}
        <div className="content-card-meta">
          <span>{countLabel}</span>
        </div>
      </Card.Body>
    </Card>
  )
}
