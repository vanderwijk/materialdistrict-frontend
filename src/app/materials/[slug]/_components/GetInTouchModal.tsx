'use client'

/**
 * GetInTouchModal
 * ----------------------------------------------------------------------
 * Request widget overlay voor ingelogde gebruikers. Volgt de mockup:
 *  - Donkere header met "GET IN TOUCH" eyebrow + material-titel + brand-meta
 *  - 5 multi-select request-opties met groen icoontje
 *  - Optionele message-textarea
 *  - Sticky footer met "Send request"-knop + hint
 *
 * Submit POSTs naar /api/get-in-touch (zie route handler). Backend
 * forward de request naar de brand-email — voor nu een stub naar
 * info@materialdistrict.com tot Johan brand-emails levert.
 *
 * Accessibility:
 *  - role="dialog", aria-modal, focus naar eerste interactive bij open
 *  - ESC sluit, klik-backdrop sluit
 *  - Body-scroll lock terwijl open
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// --------------------------------------------------------------------
// Types
// --------------------------------------------------------------------

export interface GetInTouchModalProps {
  open: boolean
  onClose: () => void
  materialId: number
  materialTitle: string
  /** Brand-naam — als bekend, anders generieke fallback. */
  brandName?: string | null
}

type RequestOptionKey =
  | 'call_back'
  | 'catalogue'
  | 'rep'
  | 'sample'
  | 'question'

interface RequestOption {
  key: RequestOptionKey
  label: string
  hint: string
  icon: React.ReactNode
}

// --------------------------------------------------------------------
// Static options config
// --------------------------------------------------------------------

const REQUEST_OPTIONS: RequestOption[] = [
  {
    key: 'call_back',
    label: 'Call me back',
    hint: 'Arrange a conversation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z" />
      </svg>
    ),
  },
  {
    key: 'catalogue',
    label: 'Send me a catalogue',
    hint: 'Digital or printed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    key: 'rep',
    label: 'Find a rep in my region',
    hint: 'Local contact or distributor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    key: 'sample',
    label: 'Send me a sample',
    hint: 'Physical sample to my address',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m9.17 14.83-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    key: 'question',
    label: 'I have a different question',
    hint: 'Ask anything about this material',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function GetInTouchModal({
  open,
  onClose,
  materialId,
  materialTitle,
  brandName,
}: GetInTouchModalProps) {
  const [selected, setSelected] = useState<Set<RequestOptionKey>>(new Set())
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const firstFocusRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Reset state als modal opnieuw opent
  useEffect(() => {
    if (open) {
      setSelected(new Set())
      setMessage('')
      setPending(false)
      setError(null)
      setSuccess(false)
    }
  }, [open])

  // ESC sluit
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Body-scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus eerste optie bij open
  useEffect(() => {
    if (open && firstFocusRef.current) {
      firstFocusRef.current.focus()
    }
  }, [open])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const toggleOption = (key: RequestOptionKey) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.size === 0) return
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/get-in-touch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          materialId,
          options: Array.from(selected),
          message: message.trim() || null,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { message?: string }
          | null
        setError(body?.message ?? `Request failed (${res.status})`)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setPending(false)
    }
  }

  if (!open) return null

  const brandLabel = brandName ?? 'the manufacturer'

  return (
    <div
      className="git-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-title"
      onClick={handleBackdropClick}
    >
      <div className="git-modal">
        <header className="git-header">
          <div>
            <p className="git-eyebrow">GET IN TOUCH</p>
            <h2 id="git-title" className="git-title">
              {materialTitle}
            </h2>
            <p className="git-submeta">
              via MaterialDistrict
              {brandName ? <> · {brandName}</> : null}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="git-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {success ? (
          <div className="git-success">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Request sent</h3>
            <p>
              {brandName
                ? `${brandName} will get back to you through MaterialDistrict.`
                : `${brandLabel} will get back to you through MaterialDistrict.`}
            </p>
            <button
              type="button"
              className="git-success-close"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="git-form">
            <p className="git-intro">
              {brandName ? (
                <>
                  Select what you&apos;d like to receive from{' '}
                  <strong>{brandName}</strong>. They&apos;ll get back to you through
                  MaterialDistrict.
                </>
              ) : (
                <>
                  Select what you&apos;d like to receive. The manufacturer will get
                  back to you through MaterialDistrict.
                </>
              )}
            </p>

            <ul className="git-options" role="list">
              {REQUEST_OPTIONS.map((opt, idx) => {
                const isSelected = selected.has(opt.key)
                return (
                  <li key={opt.key}>
                    <button
                      ref={idx === 0 ? firstFocusRef : undefined}
                      type="button"
                      className={`git-option ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => toggleOption(opt.key)}
                      aria-pressed={isSelected}
                    >
                      <span className="git-option-check" aria-hidden="true">
                        {isSelected ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : null}
                      </span>
                      <span className="git-option-icon" aria-hidden="true">
                        {opt.icon}
                      </span>
                      <span className="git-option-text">
                        <span className="git-option-label">{opt.label}</span>
                        <span className="git-option-hint">{opt.hint}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <label className="git-message-label" htmlFor="git-message">
              YOUR MESSAGE <span className="git-message-optional">(optional)</span>
            </label>
            <textarea
              id="git-message"
              className="git-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                brandName
                  ? `Your message to ${brandName}…`
                  : `Your message to the manufacturer…`
              }
              rows={4}
              maxLength={1000}
            />

            {error && <p className="git-error" role="alert">{error}</p>}

            <div className="git-footer">
              <button
                type="submit"
                className="git-submit"
                disabled={selected.size === 0 || pending}
              >
                {pending ? 'Sending…' : 'Send request'}
              </button>
              <p className="git-footer-hint">
                MaterialDistrict forwards your request to {brandLabel}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
