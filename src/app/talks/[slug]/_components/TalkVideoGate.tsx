'use client'

/**
 * TalkVideoGate — gating-laag rond de talk-video (C14).
 *
 * Sessie 7. Conform mockup `renderTalkDetail()`: ALLEEN de video is gegate;
 * summary en metadata blijven zichtbaar als teaser. Client-component omdat
 * het gating-besluit van `useAuth().isMember` afhangt; de page eromheen
 * blijft een server-component.
 *
 *  - Toegang (niet-gated of Insider-member): de Vimeo-embed via <TalkVideo>.
 *  - Gated (insiderOnly && niet-member): een locked poster (hero, gedimd,
 *    play-badge) + <InsiderGate variant="paywall"> met talk-copy.
 *
 * C14-default: talks zijn standaard insider-only, dus dit firet voor de
 * meeste talks voor niet-members.
 */

import { useAuth } from '@/components/providers/AuthContext'
import { InsiderGate } from '@/components/ui'
import { TalkVideo } from './TalkVideo'

export interface TalkVideoGateProps {
  vimeoId: string | null
  title: string
  insiderOnly: boolean
  /** Hero-URL voor de locked poster (optioneel). */
  posterUrl?: string
}

export function TalkVideoGate({
  vimeoId,
  title,
  insiderOnly,
  posterUrl,
}: TalkVideoGateProps) {
  const { isMember } = useAuth()
  const gated = insiderOnly && !isMember

  if (!gated) {
    return <TalkVideo vimeoId={vimeoId} title={title} />
  }

  return (
    <div className="talk-video-gate">
      <div
        className="talk-video-locked"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
        aria-hidden="true"
      >
        <span className="talk-video-locked-play">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </span>
      </div>
      <InsiderGate
        variant="paywall"
        feature="article"
        title="Watch this talk"
        description="Become a MaterialDistrict Insider for full access to all talk recordings, in-depth articles and quarterly trend reports."
      />
    </div>
  )
}
