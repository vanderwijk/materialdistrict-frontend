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
 * Insider-only talks: `vimeoId` komt NIET mee uit SSR/public REST (paywall-
 * bypass voorkomen). Members laden hem client-side via /api/talks/{id}/embed.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { InsiderGate } from '@/components/ui'
import { TalkVideo } from './TalkVideo'

export interface TalkVideoGateProps {
  talkId: number
  /** Present for free talks; null for Insider-only until the member fetch resolves. */
  vimeoId: string | null
  title: string
  insiderOnly: boolean
  /** Hero-URL voor de locked poster (optioneel). */
  posterUrl?: string
}

export function TalkVideoGate({
  talkId,
  vimeoId,
  title,
  insiderOnly,
  posterUrl,
}: TalkVideoGateProps) {
  const { isMember } = useAuth()
  const gated = insiderOnly && !isMember
  const [memberVimeoId, setMemberVimeoId] = useState<string | null>(
    insiderOnly ? null : vimeoId,
  )
  const [embedStatus, setEmbedStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    insiderOnly ? 'idle' : vimeoId ? 'ready' : 'idle',
  )

  useEffect(() => {
    if (!insiderOnly || !isMember) {
      return
    }

    let cancelled = false
    setEmbedStatus('loading')

    void (async () => {
      try {
        const res = await fetch(`/api/talks/${talkId}/embed`, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        })
        if (!res.ok) {
          throw new Error(`embed ${res.status}`)
        }
        const data = (await res.json()) as { vimeoId?: string | null }
        if (cancelled) return
        setMemberVimeoId(data.vimeoId ?? null)
        setEmbedStatus('ready')
      } catch {
        if (cancelled) return
        setMemberVimeoId(null)
        setEmbedStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [insiderOnly, isMember, talkId])

  if (!gated) {
    if (insiderOnly && embedStatus === 'loading') {
      return (
        <div id="talk-player" className="talk-video-gate" aria-busy="true">
          <div
            className="talk-video-locked"
            style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
            aria-hidden="true"
          />
        </div>
      )
    }

    return (
      <div id="talk-player" className="talk-video-gate">
        <TalkVideo vimeoId={insiderOnly ? memberVimeoId : vimeoId} title={title} />
      </div>
    )
  }

  return (
    <div id="talk-player" className="talk-video-gate">
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
