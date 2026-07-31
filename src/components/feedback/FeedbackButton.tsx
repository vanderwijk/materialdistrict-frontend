'use client'

/**
 * FeedbackButton — fixed "something broken?" reporter.
 * ----------------------------------------------------------------------
 * Soft-launch instrument. Visible to everyone, logged in or not, because
 * most visitors during the test month will be anonymous and they are the
 * ones hitting the rough edges.
 *
 * Deliberately one field. Asking for a name, an email and a category is how
 * a feedback form ends up with zero submissions. Everything that can be
 * collected automatically is collected automatically: current URL, viewport,
 * user agent, and whether the visitor is signed in.
 *
 * Spam control without a captcha:
 *   - honeypot field that real users never fill in
 *   - a minimum dwell time (a bot posts instantly, a human types first)
 *   - one submission per page per session, tracked in component state
 * Anything heavier gets in the way of the people we actually want to hear
 * from. The endpoint applies its own rate limit per IP.
 *
 * Accessibility: the panel is a labelled dialog, focus moves into it on
 * open, Escape closes it, and focus returns to the trigger.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Bots submit instantly; a human needs a moment to type. */
const MIN_DWELL_MS = 2000

export function FeedbackButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const openedAt = useRef<number>(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  // Reset when the visitor navigates: a report belongs to one page.
  useEffect(() => {
    setOpen(false)
    setStatus('idle')
    setMessage('')
  }, [pathname])

  const returnFocus = useRef(false)

  const close = useCallback(() => {
    returnFocus.current = true
    setOpen(false)
  }, [])

  // Restore focus after the trigger is shown again (hidden while open).
  useEffect(() => {
    if (open || !returnFocus.current) return
    returnFocus.current = false
    triggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    openedAt.current = Date.now()
    textareaRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], textarea, input:not([type="hidden"]), select',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  async function submit() {
    const trimmed = message.trim()
    if (trimmed.length < 3 || status === 'sending') return

    // Silently accept and discard obvious bot traffic — telling a bot it
    // failed only teaches it to try again differently.
    if (honeypot || Date.now() - openedAt.current < MIN_DWELL_MS) {
      setStatus('sent')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: trimmed.slice(0, 4000),
          url: typeof window !== 'undefined' ? window.location.href : pathname,
          viewport:
            typeof window !== 'undefined'
              ? `${window.innerWidth}x${window.innerHeight}`
              : '',
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 400) : '',
        }),
      })
      setStatus(response.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="fb-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">!</span>
        Something broken?
      </button>

      {open && (
        <div
          className="fb-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          {status === 'sent' ? (
            <div className="fb-done">
              <p className="fb-done-title">Thanks — that helps.</p>
              <p className="fb-done-body">
                We read every report during the test month.
              </p>
              <button type="button" className="btn btn-sm btn-outline" onClick={close}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="fb-head">
                <p className="fb-title" id={titleId}>
                  Report a problem
                </p>
                <button
                  type="button"
                  className="fb-close"
                  onClick={close}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <p className="fb-hint">
                What went wrong on this page? We include the page address
                automatically.
              </p>

              <textarea
                ref={textareaRef}
                className="fb-input"
                rows={4}
                value={message}
                maxLength={4000}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="The filter resets when I go back…"
              />

              {/* Honeypot — hidden from people, tempting to bots. */}
              <input
                type="text"
                className="fb-hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />

              {status === 'error' && (
                <p className="fb-error" role="alert">
                  That did not send. Please try again, or mail webmaster@materialdistrict.com.
                </p>
              )}

              <div className="fb-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={submit}
                  disabled={message.trim().length < 3 || status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
