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
 * Channels komen als prop binnen (curated, in de footer opgehaald; in de
 * sidebar de channels van het artikel). Breder volgen gebeurt via de toggle
 * die overal op de site staat.
 */

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { followEntity, setMailFrequency, type MailFrequency } from '@/lib/api/follows'
import { DEFAULT_FOLLOW_TYPES } from '@/lib/hooks/useFollow'

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
  channels: DigestChannel[]
  /** Sidebar-variant: vult de kolombreedte (punt 8). */
  compact?: boolean
  createAccountHref?: string
  signInHref?: string
}

export function FollowDigestBlock({
  channels,
  compact = false,
  createAccountHref = '/register',
  signInHref = '/sign-in',
}: FollowDigestBlockProps) {
  const { isLoggedIn } = useAuth()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [frequency, setFrequency] = useState<MailFrequency>('weekly')
  const [status, setStatus] = useState<'idle' | 'catch' | 'busy' | 'done'>('idle')

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const count = selected.size
  const selectedLabels = channels.filter((c) => selected.has(c.id)).map((c) => c.label)

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
        <p className="follow-digest-eyebrow">Your digest</p>
        <p className="follow-digest-done">
          You&apos;re following {count} channel{count === 1 ? '' : 's'}. Your{' '}
          {FREQ_LABEL[frequency].toLowerCase()} digest is on its way.
        </p>
      </div>
    )
  }

  return (
    <div className={rootClass}>
      <p className="follow-digest-eyebrow">Your digest</p>
      <p className="follow-digest-title">Follow what you&apos;re into</p>
      <p className="follow-digest-hint">
        Pick a few to start — you can follow more as you browse the site.
      </p>

      {channels.length > 0 && (
        <div className="follow-digest-chips">
          {channels.map((c) => (
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
              Frequency:{' '}
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
                {' · '}You&apos;ll get a {FREQ_LABEL[frequency].toLowerCase()} digest on{' '}
                {joinLabels(selectedLabels)}.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
