'use client'

/**
 * FollowDigestBlock — vervangt de oude "e-mail + Subscribe"-box.
 * ----------------------------------------------------------------------
 * Instappunt voor het follow-systeem: geen e-mailveld meer, maar channel-chips
 * + "Start following". Account-creatie is de vangrail, niet het doel.
 *
 *  - Ingelogd → de geselecteerde channels worden meteen gevolgd (+ events).
 *  - Niet ingelogd → dezelfde account-catch als bij de toggle.
 *
 * §VISUAL-ROUND-18-06 punt 6: uitgelijnd op het prototype —
 *  - crème kaart, donkere tekst (styling in globals.css);
 *  - hint "Pick a few to start — …" staat BOVEN de chips;
 *  - frequentie + een samenvattingsregel staan ÓNDER de groene knop;
 *  - de account-catch is een witte genest kaartje mét subregel, zonder
 *    slot-emoji.
 * `compact` = sidebar-variant (punt 8): vult de kolombreedte.
 *
 * Channels zijn generiek: het blok haalt de volledige catalogus op (op aantal
 * gesorteerd) en toont de top-8, met "Show all" voor de rest. Overal hetzelfde
 * — footer én detailpagina's. Een optionele `channels`-seed voorkomt alleen
 * flikkering vóór de fetch; item-channels worden bewust niet meer doorgegeven.
 * Breder volgen gebeurt via de toggle die overal op de site staat.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import {
  followEntity,
  setMailFrequency,
  loadFollows,
  subscribeFollows,
  getFollowsCache,
  type MailFrequency,
} from '@/lib/api/follows'
import { DEFAULT_FOLLOW_TYPES, useMailFrequency } from '@/lib/hooks/useFollow'

const FREQUENCIES: MailFrequency[] = ['daily', 'weekly', 'monthly']
const FREQ_LABEL: Record<MailFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

/** "a, b and c" — voor de samenvattingsregel. */
function joinLabels(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

export interface DigestChannel {
  id: number
  slug: string
  label: string
}

export interface FollowDigestBlockProps {
  /**
   * F4a: optionele SSR-seed met de generieke top-channels (op aantal
   * gesorteerd). Puur om flikkering te voorkomen vóór de client-fetch; het
   * blok toont sowieso de top-8 uit de volledige catalogus. NOOIT de
   * item-channels van een detailpagina doorgeven — dit blok is generiek.
   */
  channels?: DigestChannel[]
  /** Sidebar-variant: vult de kolombreedte (punt 8). */
  compact?: boolean
  createAccountHref?: string
  signInHref?: string
}

export function FollowDigestBlock({
  channels = [],
  compact = false,
  createAccountHref = '/register',
  signInHref = '/sign-in',
}: FollowDigestBlockProps) {
  const { isLoggedIn } = useAuth()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const hydratedFrequency = useMailFrequency('weekly')
  const [frequency, setFrequency] = useState<MailFrequency>('weekly')
  const [status, setStatus] = useState<'idle' | 'catch' | 'busy' | 'done'>('idle')
  const [allChannels, setAllChannels] = useState<DigestChannel[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setFrequency(hydratedFrequency)
  }, [hydratedFrequency])

  // F4a: haal de volledige channel-catalogus op zodat "Show all" alle channels
  // toont. De doorgegeven `channels` blijven vooraan staan als de relevante set.
  useEffect(() => {
    let active = true
    fetch('/api/channels')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.channels)) {
          setAllChannels(data.channels as DigestChannel[])
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // F4a: het blok is generiek. Bron = de volledige catalogus (op aantal
  // gesorteerd door /api/channels), met de optionele SSR-seed als fallback
  // zolang de fetch nog loopt. Default tonen we de top-8; "Show all" toont
  // de rest. Item-channels spelen hier bewust geen rol meer.
  const source = allChannels.length > 0 ? allChannels : channels
  const TOP_N = 8
  const hasMore = source.length > TOP_N
  const visibleChannels = expanded ? source : source.slice(0, TOP_N)

  useEffect(() => {
    if (!isLoggedIn) {
      setSelected(new Set())
      return
    }

    const apply = () => {
      const cache = getFollowsCache()
      if (!cache) return
      const followedIds = new Set(
        cache.follows
          .filter((row) => row.entityType === 'channel')
          .map((row) => Number(row.entityId)),
      )
      const preselected = source.filter((channel) => followedIds.has(channel.id))
      if (preselected.length > 0) {
        setSelected(new Set(preselected.map((channel) => channel.id)))
      }
    }

    void loadFollows().then(apply).catch(() => {})
    return subscribeFollows(apply)
  }, [isLoggedIn, channels, allChannels])

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const count = selected.size
  const selectedLabels = source.filter((c) => selected.has(c.id)).map((c) => c.label)

  const start = async () => {
    if (!isLoggedIn) {
      setStatus('catch')
      return
    }
    if (count === 0) return
    setStatus('busy')
    try {
      const ids = [...selected]
      await Promise.all(
        ids.map((id) =>
          followEntity({ entityType: 'channel', entityId: id, types: DEFAULT_FOLLOW_TYPES }),
        ),
      )
      void setMailFrequency(frequency)
      setStatus('done')
    } catch {
      setStatus('idle')
    }
  }

  const rootClass = `follow-digest${compact ? ' is-compact' : ''}`

  if (status === 'done') {
    return (
      <div className={rootClass}>
        <p className="follow-digest-done">
          You&apos;re following {count} channel{count === 1 ? '' : 's'}. Your{' '}
          {FREQ_LABEL[frequency].toLowerCase()} email updates start now.
        </p>
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <p className="follow-digest-title">Follow the Transition</p>
      <p className="follow-digest-hint">
        Choose your topics and stay updated on the innovations shaping a
        sustainable built environment.
      </p>

      {visibleChannels.length > 0 && (
        <div className="follow-digest-chips">
          {visibleChannels.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`follow-digest-chip${selected.has(c.id) ? ' is-on' : ''}`}
              aria-pressed={selected.has(c.id)}
              onClick={() => toggle(c.id)}
            >
              {c.label}
            </button>
          ))}
          {hasMore && (
            <button
              type="button"
              className="follow-digest-chip-more"
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? 'Show fewer channels'
                  : `Show ${source.length - TOP_N} more channels`
              }
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? '\u2013' : `+${source.length - TOP_N}`}
            </button>
          )}
        </div>
      )}

      {status === 'catch' ? (
        <div className="follow-digest-catch">
          <p className="follow-catch-title">Create a free account to follow</p>
          <p className="follow-catch-sub">Your follows and digest live in your account.</p>
          <a className="follow-catch-btn" href={createAccountHref}>
            Create account
          </a>
          <a className="follow-catch-login" href={signInHref}>
            Already have one? Log in
          </a>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="follow-digest-start"
            disabled={count === 0 || status === 'busy'}
            onClick={start}
          >
            Start following
          </button>

          <div className="follow-digest-meta">
            <span className="follow-digest-freq">
              Email updates:{' '}
              <select
                className="follow-pop-freq-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as MailFrequency)}
                aria-label="Update frequency"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {FREQ_LABEL[f]}
                  </option>
                ))}
              </select>
            </span>
            {count > 0 && (
              <span className="follow-digest-summary">
                {' · '}You&apos;ll get {FREQ_LABEL[frequency].toLowerCase()} email
                updates on {joinLabels(selectedLabels)}.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
