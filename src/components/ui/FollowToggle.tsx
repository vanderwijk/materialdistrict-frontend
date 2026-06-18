'use client'

/**
 * FollowToggle — het follow-schuifje met popover (channel/brand).
 * ----------------------------------------------------------------------
 * Goedgekeurde interactie:
 *  - Een speels schuifje (Follow / Following).
 *  - INGELOGD: tik → meteen gevolgd + een popover die uit de toggle groeit met
 *    een 2-koloms checklist "What do you want to follow?" (Materials, Stories,
 *    Talks aan; Books, Events, Brands uit) en onderaan "Updates: <frequentie>"
 *    waarbij de frequentie een inline groene pull-down is (globaal). Een dunne
 *    groene balk telt af (~6s) en sluit dan; klik-buiten sluit ook.
 *  - NIET INGELOGD: het schuifje gaat NIET aan; in plaats daarvan verschijnt
 *    een duidelijk andere account-catch (slot, kop, donkere "Create account",
 *    "Already have one? Log in").
 *
 * Visueel nog te verifiëren zodra-ie in de channel-pill staat (zie hieronder);
 * de data-bedrading hangt op de follow-endpoints (gemarkeerd via useFollow).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  useFollow,
  DEFAULT_FOLLOW_TYPES,
} from '@/lib/hooks/useFollow'
import {
  setMailFrequency,
  type FollowContentType,
  type FollowEntityType,
  type MailFrequency,
} from '@/lib/api/follows'

const AUTO_CLOSE_MS = 6000

const CONTENT_TYPES: { key: FollowContentType; label: string }[] = [
  { key: 'material', label: 'Materials' },
  { key: 'story', label: 'Stories' },
  { key: 'talk', label: 'Talks' },
  { key: 'book', label: 'Books' },
  { key: 'event', label: 'Events' },
  { key: 'brand', label: 'Brands' },
]

const FREQUENCIES: MailFrequency[] = ['daily', 'weekly', 'monthly']
const FREQ_LABEL: Record<MailFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export interface FollowToggleProps {
  entityType: FollowEntityType
  entityId: number | string
  /** Naam van het channel/brand, voor de account-catch-tekst. */
  entityName?: string
  initialFollowing?: boolean
  initialTypes?: FollowContentType[]
  /** Globale mail-frequentie (één per gebruiker). */
  mailFrequency?: MailFrequency
  onMailFrequencyChange?: (freq: MailFrequency) => void
  createAccountHref?: string
  signInHref?: string
  className?: string
}

export function FollowToggle({
  entityType,
  entityId,
  entityName,
  initialFollowing = false,
  initialTypes,
  mailFrequency = 'weekly',
  onMailFrequencyChange,
  createAccountHref = '/register',
  signInHref = '/sign-in',
  className,
}: FollowToggleProps) {
  const { isLoggedIn, following, busy, follow, unfollow, updateTypes } = useFollow({
    entityType,
    entityId,
    initialFollowing,
    initialTypes,
  })

  const [pop, setPop] = useState<null | 'follow' | 'catch'>(null)
  const [selected, setSelected] = useState<FollowContentType[]>(
    initialTypes ?? DEFAULT_FOLLOW_TYPES,
  )
  const [freq, setFreq] = useState<MailFrequency>(mailFrequency)
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closePop = useCallback(() => {
    setPop(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  // Klik-buiten sluit de popover.
  useEffect(() => {
    if (!pop) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closePop()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [pop, closePop])

  // Auto-close van de follow-popover.
  useEffect(() => {
    if (pop !== 'follow') return
    timerRef.current = setTimeout(closePop, AUTO_CLOSE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pop, closePop])

  const onToggle = useCallback(async () => {
    if (!isLoggedIn) {
      setPop('catch')
      return
    }
    if (following) {
      await unfollow()
      closePop()
      return
    }
    const ok = await follow(selected)
    if (ok) setPop('follow')
  }, [isLoggedIn, following, follow, unfollow, selected, closePop])

  const toggleType = useCallback(
    (key: FollowContentType) => {
      setSelected((prev) => {
        const next = prev.includes(key)
          ? prev.filter((t) => t !== key)
          : [...prev, key]
        void updateTypes(next)
        return next
      })
    },
    [updateTypes],
  )

  const onFreqChange = useCallback(
    (next: MailFrequency) => {
      setFreq(next)
      void setMailFrequency(next)
      onMailFrequencyChange?.(next)
    },
    [onMailFrequencyChange],
  )

  return (
    <div className={cn('follow-toggle', className)} ref={rootRef}>
      <button
        type="button"
        className={cn('follow-switch', following && 'is-on')}
        role="switch"
        aria-checked={following}
        aria-label={following ? 'Following — tap to unfollow' : 'Follow'}
        disabled={busy}
        onClick={onToggle}
      >
        <span className="follow-switch-label">{following ? 'Following' : 'Follow'}</span>
        <span className="follow-switch-knob" aria-hidden="true" />
      </button>

      {pop === 'follow' && (
        <div className="follow-pop" role="dialog" aria-label="What do you want to follow?">
          <span className="follow-pop-caret" aria-hidden="true" />
          <span className="follow-pop-bar" aria-hidden="true" />
          <p className="follow-pop-title">What do you want to follow?</p>
          <div className="follow-pop-list">
            {CONTENT_TYPES.map(({ key, label }) => {
              const on = selected.includes(key)
              return (
                <label key={key} className="follow-pop-item">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleType(key)}
                  />
                  <span>{label}</span>
                </label>
              )
            })}
          </div>
          <div className="follow-pop-freq">
            <span>Updates:</span>
            <select
              className="follow-pop-freq-select"
              value={freq}
              onChange={(e) => onFreqChange(e.target.value as MailFrequency)}
              aria-label="Update frequency"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {FREQ_LABEL[f]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {pop === 'catch' && (
        <div className="follow-catch" role="dialog" aria-label="Create a free account to follow">
          <span className="follow-pop-caret" aria-hidden="true" />
          <span className="follow-catch-lock" aria-hidden="true">🔒</span>
          <p className="follow-catch-title">Create a free account to follow</p>
          <p className="follow-catch-sub">
            {entityName
              ? `Get updates from ${entityName} and everything you follow.`
              : 'Get updates from everything you follow.'}
          </p>
          <a className="follow-catch-btn" href={createAccountHref}>
            Create account
          </a>
          <a className="follow-catch-login" href={signInHref}>
            Already have one? Log in
          </a>
        </div>
      )}
    </div>
  )
}
