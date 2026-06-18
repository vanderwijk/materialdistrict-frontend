'use client'

/**
 * DetailChannelPill — volgbare channel-pil op de detail-headers (punt 7).
 * ----------------------------------------------------------------------
 * Eén pil, geen binnenkader. Links: het grid-icoon + de channel-naam, die nog
 * steeds naar /channel/<slug> linkt. Rechts, dicht bij elkaar: een bel + een
 * mini-schuifje (zonder "Follow"-tekst). De pil is grijs als je niet volgt en
 * groen (icoon + bel + schuifje + subtiele tint/rand) zodra je volgt.
 *
 * Klik op het volg-deel:
 *  - INGELOGD: meteen volgen + een popover die als OVERLAY over de titel zweeft
 *    (duwt de pagina niet omlaag), met de checklist + frequentie. Caret onder
 *    het schuifje (inline gemeten). Telt af (~6s) en sluit; klik-buiten sluit ook.
 *  - NIET INGELOGD: dezelfde account-catch als elders (kop, subregel, donkere
 *    "Create account", "Already have one? Log in").
 *
 * Hergebruikt useFollow + de .follow-pop / .follow-catch / .follow-switch-track
 * shells uit §FOLLOW / §VISUAL-ROUND; pil-specifieke styling in §CHANNEL-PILL-FOLLOW.
 */

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFollow, useMailFrequency, DEFAULT_FOLLOW_TYPES } from '@/lib/hooks/useFollow'
import {
  setMailFrequency,
  type FollowContentType,
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

export interface DetailChannelPillProps {
  id: number
  slug: string
  label: string
  createAccountHref?: string
  signInHref?: string
}

export function DetailChannelPill({
  id,
  slug,
  label,
  createAccountHref = '/register',
  signInHref = '/sign-in',
}: DetailChannelPillProps) {
  const { isLoggedIn, following, busy, follow, unfollow, updateTypes, types } = useFollow({
    entityType: 'channel',
    entityId: id,
  })

  const [pop, setPop] = useState<null | 'follow' | 'catch'>(null)
  const [selected, setSelected] = useState<FollowContentType[]>(DEFAULT_FOLLOW_TYPES)
  const hydratedFreq = useMailFrequency('weekly')
  const [freq, setFreq] = useState<MailFrequency>('weekly')
  const [caretX, setCaretX] = useState<number | null>(null)
  const rootRef = useRef<HTMLSpanElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSelected(types)
  }, [types])

  useEffect(() => {
    setFreq(hydratedFreq)
  }, [hydratedFreq])

  const closePop = useCallback(() => {
    setPop(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  // Klik-buiten sluit.
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

  // Caret exact onder het schuifje (positie gemeten zodra de popover opent).
  useEffect(() => {
    if (!pop || !rootRef.current || !toggleRef.current) return
    const root = rootRef.current.getBoundingClientRect()
    const tgl = toggleRef.current.getBoundingClientRect()
    setCaretX(tgl.left - root.left + tgl.width / 2 - 6)
  }, [pop])

  const onFollowClick = useCallback(async () => {
    if (!isLoggedIn) {
      setPop('catch')
      return
    }
    if (following) {
      await unfollow()
      closePop()
      return
    }
    setPop('follow')
    void follow(selected)
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

  const onFreqChange = useCallback((next: MailFrequency) => {
    setFreq(next)
    void setMailFrequency(next)
  }, [])

  const caretStyle = caretX != null ? { left: caretX } : undefined

  return (
    <span
      className={`detail-channel-pill${following ? ' is-following' : ''}`}
      ref={rootRef}
    >
      <Link href={`/channel/${slug}`} className="detail-channel-pill-link">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        {label}
      </Link>

      <button
        type="button"
        className="detail-channel-pill-follow"
        ref={toggleRef}
        role="switch"
        aria-checked={following}
        aria-label={following ? `Following ${label} — tap to unfollow` : `Follow ${label}`}
        disabled={busy}
        onClick={onFollowClick}
      >
        <svg
          className="detail-channel-pill-bell"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="follow-switch-track" aria-hidden="true">
          <span className="follow-switch-knob" />
        </span>
      </button>

      {pop === 'follow' && (
        <div className="follow-pop" role="dialog" aria-label="What do you want to follow?">
          <span className="follow-pop-caret" style={caretStyle} aria-hidden="true" />
          <span className="follow-pop-bar" aria-hidden="true" />
          <p className="follow-pop-title">What do you want to follow?</p>
          <div className="follow-pop-list">
            {CONTENT_TYPES.map(({ key, label: ctLabel }) => (
              <label key={key} className="follow-pop-item">
                <input
                  type="checkbox"
                  checked={selected.includes(key)}
                  onChange={() => toggleType(key)}
                />
                <span>{ctLabel}</span>
              </label>
            ))}
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
          <span className="follow-pop-caret" style={caretStyle} aria-hidden="true" />
          <p className="follow-catch-title">Create a free account to follow</p>
          <p className="follow-catch-sub">
            Get updates from {label} and everything you follow.
          </p>
          <a className="follow-catch-btn" href={createAccountHref}>
            Create account
          </a>
          <a className="follow-catch-login" href={signInHref}>
            Already have one? Log in
          </a>
        </div>
      )}
    </span>
  )
}
