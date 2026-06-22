'use client'

/**
 * FollowTransitionPanel — F5.
 * ----------------------------------------------------------------------
 * In de footer staat niet langer het hele volgmenu uitgeklapt "in de weg".
 * In plaats daarvan: één knop "Follow the Transition". Bij klik schuift een
 * full-width paneel van onderen omhoog met het volledige volgblok erin
 * (channel-chips, e-mailfrequentie, Start following).
 *
 * Het paneel hergebruikt `FollowDigestBlock` ongewijzigd — dat levert al de
 * titel, chips, frequentie en de volg-actie. Dit component voegt alleen de
 * trigger-knop + de slide-up-laag toe (backdrop, Escape-to-close,
 * klik-buiten-sluit, scroll-lock).
 */

import { useEffect, useState } from 'react'
import { FollowDigestBlock, type DigestChannel } from './FollowDigestBlock'

export interface FollowTransitionPanelProps {
  channels: DigestChannel[]
}

export function FollowTransitionPanel({ channels }: FollowTransitionPanelProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <div className="follow-transition">
      <p className="follow-transition-lead">
        Choose your topics and stay updated on the innovations shaping a
        sustainable built environment.
      </p>
      <button
        type="button"
        className="follow-transition-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Follow the Transition
        <span className="follow-transition-arrow" aria-hidden="true">
          →
        </span>
      </button>

      {open && (
        <div
          className="follow-panel-backdrop"
          onClick={() => setOpen(false)}
        >
          <div
            className="follow-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Follow the Transition"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="follow-panel-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <div className="follow-panel-body">
              <FollowDigestBlock channels={channels} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
