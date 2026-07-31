'use client'

/**
 * Site-wide contact form.
 *
 * Topic cards pick the subject; the form posts to `/api/contact/`.
 * Spam: honeypot + minimum dwell time (mirror FeedbackButton).
 */

import { useId, useRef, useState } from 'react'
import {
  CONTACT_TOPICS,
  membershipContactSubject,
  type ContactTopic,
} from '@/lib/config/contact'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const MIN_DWELL_MS = 2000

interface ContactFormProps {
  initialTopicId?: string | null
  initialTier?: string | null
}

export function ContactForm({
  initialTopicId = null,
  initialTier = null,
}: ContactFormProps) {
  const [topicId, setTopicId] = useState(
    initialTopicId && CONTACT_TOPICS.some((t) => t.id === initialTopicId)
      ? initialTopicId
      : 'general',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const openedAt = useRef(Date.now())
  const formId = useId()

  const topic: ContactTopic =
    CONTACT_TOPICS.find((t) => t.id === topicId) ?? CONTACT_TOPICS[CONTACT_TOPICS.length - 1]

  const subject =
    topic.id === 'membership'
      ? membershipContactSubject(initialTier ?? undefined)
      : topic.subject

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().includes('@') &&
    message.trim().length >= 3 &&
    status !== 'sending'

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    if (honeypot || Date.now() - openedAt.current < MIN_DWELL_MS) {
      setStatus('sent')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: name.trim().slice(0, 120),
          email: email.trim(),
          company: company.trim().slice(0, 160),
          subject,
          message: message.trim().slice(0, 4000),
          website: honeypot,
        }),
      })
      setStatus(response.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="ct-form-done" role="status">
        <p className="ct-form-done-title">Thanks — we have your message.</p>
        <p className="ct-form-done-body">
          We aim to reply within a few working days. For urgent account issues,
          mention that in a follow-up if you do not hear back.
        </p>
      </div>
    )
  }

  return (
    <div className="ct-form-wrap">
      <fieldset className="ct-topics">
        <legend className="ct-topics-legend">Subject</legend>
        <div className="ct-grid">
          {CONTACT_TOPICS.map((item) => {
            const selected = item.id === topicId
            return (
              <button
                key={item.id}
                type="button"
                className={`ct-card${selected ? ' is-highlighted' : ''}`}
                aria-pressed={selected}
                onClick={() => setTopicId(item.id)}
              >
                <span className="ct-card-title">{item.title}</span>
                <span className="ct-card-desc">{item.desc}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <form className="ct-form" onSubmit={submit} noValidate>
        <p className="ct-form-subject">
          Sending about: <strong>{subject}</strong>
        </p>

        <div className="ct-form-row">
          <label className="ct-label" htmlFor={`${formId}-name`}>
            Name
          </label>
          <input
            id={`${formId}-name`}
            className="ct-input"
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="ct-form-row">
          <label className="ct-label" htmlFor={`${formId}-email`}>
            Email
          </label>
          <input
            id={`${formId}-email`}
            className="ct-input"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="ct-form-row">
          <label className="ct-label" htmlFor={`${formId}-company`}>
            Company <span className="ct-optional">(optional)</span>
          </label>
          <input
            id={`${formId}-company`}
            className="ct-input"
            type="text"
            name="company"
            autoComplete="organization"
            maxLength={160}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>

        <div className="ct-form-row">
          <label className="ct-label" htmlFor={`${formId}-message`}>
            Message
          </label>
          <textarea
            id={`${formId}-message`}
            className="ct-input ct-textarea"
            name="message"
            required
            rows={6}
            maxLength={4000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <input
          type="text"
          className="ct-hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />

        {status === 'error' && (
          <p className="ct-form-error" role="alert">
            That did not send. Please try again, or mail info@materialdistrict.com.
          </p>
        )}

        <div className="ct-form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </form>
    </div>
  )
}
