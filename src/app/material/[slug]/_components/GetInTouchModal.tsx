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
 * Submit POSTs naar /api/get-in-touch → WP `POST /md/v2/get-in-touch`.
 * Maakt een lead aan, verstuurt mail via SES, toont success-state.
 *
 * Accessibility:
 *  - role="dialog", aria-modal, focus naar eerste interactive bij open
 *  - ESC sluit, klik-backdrop sluit
 *  - Body-scroll lock terwijl open
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/AuthContext'

// --------------------------------------------------------------------
// Types
// --------------------------------------------------------------------

export interface GetInTouchModalProps {
  open: boolean
  onClose: () => void
  /**
   * Material-context. Geef `materialId` + `materialTitle` mee voor een
   * material-request (sessie 4, ongewijzigd gedrag).
   */
  materialId?: number
  materialTitle?: string
  /**
   * Brand-context (sessie 5). Geef `brandId` mee voor een brand-request
   * zonder material. Precies één van `materialId` / `brandId` hoort gezet
   * te zijn.
   */
  brandId?: number
  /**
   * Header-titel. Voor material-context default `materialTitle`; voor
   * brand-context geef je hier de brand-naam mee. Expliciete prop zodat
   * de modal contextonafhankelijk de juiste kop toont.
   */
  title?: string
  /** Brand-naam — als bekend, anders generieke fallback. */
  brandName?: string | null
  /**
   * Lead-routing country-gate (material-afgeleid). Wanneer `restrict` aan staat
   * en het land van de ingelogde user niet in `acceptedCountries` (ISO-codes)
   * zit, toont de modal een melding + zet de submit uit + verwijst naar de
   * brand-website. Geen harde blokkade van het paneel.
   */
  restrictToListedCountries?: boolean
  acceptedCountries?: string[]
  brandWebsite?: string | null
  /** Brand-brede Insider-gate op sample-aanvragen. */
  sampleRequestsInsidersOnly?: boolean
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
  brandId,
  title,
  brandName,
  restrictToListedCountries = false,
  acceptedCountries = [],
  brandWebsite = null,
  sampleRequestsInsidersOnly = false,
}: GetInTouchModalProps) {
  const { user, isMember } = useAuth()
  const [selected, setSelected] = useState<Set<RequestOptionKey>>(new Set())
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const firstFocusRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const userCountry = user?.country ?? ''
  // user.country en acceptedCountries zijn beide leesbare labels (Johan-handoff
  // interactions): match label-tegen-label, geen code-conversie.
  const countryBlocked = restrictToListedCountries && !acceptedCountries.includes(userCountry)
  const sampleLocked = sampleRequestsInsidersOnly && !isMember
  // Een fysieke sample vereist een compleet bezorgadres. We poorten alléén als
  // het /auth/me-signaal expliciet zegt dat het adres incompleet is; zolang dat
  // signaal nog niet live is (undefined) blokkeren we niet — nette terugval.
  const sampleAddressMissing =
    selected.has('sample') && user?.hasShippingAddress === false
  const acceptedLabels = acceptedCountries.filter(Boolean).join(', ')

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
    if (sampleLocked && key === 'sample') return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.size === 0 || countryBlocked || sampleAddressMissing) return
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/get-in-touch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...(typeof materialId === 'number' ? { materialId } : {}),
          ...(typeof brandId === 'number' ? { brandId } : {}),
          options: Array.from(selected).filter((k) => !(sampleLocked && k === 'sample')),
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
              {title ?? materialTitle ?? brandName ?? 'Get in touch'}
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

            {countryBlocked && (
              <div className="git-country-block" role="alert">
                <p className="git-country-block-title">
                  {brandName ?? 'This brand'} only accepts requests from{' '}
                  {acceptedLabels || 'selected countries'}.
                </p>
                <p className="git-country-block-body">
                  Your account country
                  {userCountry ? ` (${userCountry})` : ''} isn&apos;t on the list,
                  so you can&apos;t send a request here. <a href="/dashboard/profile">Update your region</a>.
                </p>
                {brandWebsite && (
                  <a
                    href={brandWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="git-country-block-cta"
                  >
                    Reach {brandName ?? 'them'} directly via their website
                    <span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </div>
            )}

            {sampleAddressMissing && (
              <div className="git-country-block" role="alert">
                <p className="git-country-block-title">
                  We need your delivery address for a physical sample.
                </p>
                <p className="git-country-block-body">
                  Add your street, postcode and city so the manufacturer can ship
                  your sample. <a href="/dashboard/profile">Complete your address</a>.
                </p>
              </div>
            )}

            <ul className="git-options" role="list">
              {REQUEST_OPTIONS.map((opt, idx) => {
                const isSelected = selected.has(opt.key)
                const locked = sampleLocked && opt.key === 'sample'
                if (locked) {
                  return (
                    <li key={opt.key}>
                      <div className="git-option is-locked" aria-disabled="true">
                        <span className="git-option-check" aria-hidden="true">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <span className="git-option-icon" aria-hidden="true">
                          {opt.icon}
                        </span>
                        <span className="git-option-text">
                          <span className="git-option-label">{opt.label}</span>
                          <span className="git-option-hint">
                            Insiders only — <a href="/membership">join Insider</a> to request a sample
                          </span>
                        </span>
                      </div>
                    </li>
                  )
                }
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
                disabled={selected.size === 0 || pending || countryBlocked || sampleAddressMissing}
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
