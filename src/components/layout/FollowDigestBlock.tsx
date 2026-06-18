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
 * Channels komen als prop binnen (curated, in de footer opgehaald). Breder
 * volgen gebeurt via de toggle die overal op de site staat.
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

export interface DigestChannel {
  id: number
  slug: string
  label: string
}

export interface FollowDigestBlockProps {
  channels: DigestChannel[]
  createAccountHref?: string
  signInHref?: string
}

export function FollowDigestBlock({
  channels,
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

  if (status === 'done') {
    return (
      <div className="follow-digest">
        <p className="follow-digest-eyebrow">Your digest</p>
        <p className="follow-digest-done">
          You&apos;re following {count} channel{count === 1 ? '' : 's'}. Your{' '}
          {FREQ_LABEL[frequency].toLowerCase()} digest is on its way.
        </p>
      </div>
    )
  }

  return (
    <div className="follow-digest">
      <p className="follow-digest-eyebrow">Your digest</p>
      <p className="follow-digest-title">Follow what you&apos;re into</p>

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

      <p className="follow-digest-hint">You can follow more as you browse the site.</p>

      {status === 'catch' ? (
        <div className="follow-digest-catch">
          <span className="follow-catch-lock" aria-hidden="true">🔒</span>
          <p className="follow-catch-title">Create a free account to follow</p>
          <a className="follow-catch-btn" href={createAccountHref}>
            Create account
          </a>
          <a className="follow-catch-login" href={signInHref}>
            Already have one? Log in
          </a>
        </div>
      ) : (
        <>
          <div className="follow-digest-freq">
            <span>Updates:</span>
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
          </div>
          <button
            type="button"
            className="follow-digest-start"
            disabled={count === 0 || status === 'busy'}
            onClick={start}
          >
            {count === 0
              ? 'Pick a channel to follow'
              : `Start following (${count})`}
          </button>
        </>
      )}
    </div>
  )
}
