'use client'

/**
 * SampleRequestForm — formulier in de detail-page-sidebar voor het aanvragen
 * van een material-sample.
 *
 * Sessie 4 batch 2.
 *
 * Gedrag:
 *  - Niet-ingelogde gebruiker: form is hidden, in plaats daarvan tonen we
 *    een sign-in CTA met "Login or create an account to request a sample"
 *    (variant 1 uit de mockup, `.mat-sample-cta`).
 *  - Brand heeft sample-requests uitgeschakeld (`disableSampleRequest`):
 *    we tonen "Samples are not available for this material" (variant 4).
 *  - Ingelogd, sample-request actief: het formulier wordt geopend door een
 *    "Request a sample"-knop bovenaan. State `formOpen` schakelt tussen
 *    CTA-knop en geopend form (rendering uit de mockup waar het formulier
 *    eerst gesloten is achter de knop).
 *
 * Form-velden (gemodelleerd op `request widget` uit de mockup):
 *  - `name` (required) — full name
 *  - `email` (required) — email
 *  - `company` (optional) — bedrijfsnaam
 *  - `project` (optional) — project-context
 *  - `message` (optional) — vrije tekst
 *
 * Submit:
 *  - POST naar `/api/sample-request` (placeholder route; live endpoint
 *    `/wp-json/md/v2/sample-request` komt in W14)
 *  - Inline status-banner boven het form (conform W3 — geen toast). Drie
 *    states: 'idle' / 'submitting' / 'success' / 'error'.
 *  - Bij success: form-velden worden disabled en de success-banner blijft
 *    staan (geen redirect). Een "Send another"-knop reset de form.
 *
 * Validatie:
 *  - Via FormStateProvider + per-veld `validate`-prop. De SubmitButton
 *    wordt rood + toont "Please fill in all required fields" bij issues.
 *  - Geen rode tekst onder velden — alleen de groen-vink / rode-X-cirkel
 *    rechtsboven (sessie 3A batch 2 patroon).
 */

import { useState } from 'react'
import {
  FieldGroup,
  FormStateProvider,
  Input,
  SubmitButton,
  Textarea,
} from '@/components/ui/form'
import { Button } from '@/components/ui/Button'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface SampleRequestFormProps {
  /** Material-ID — wordt meegestuurd in de POST. */
  materialId: number
  /** Material-titel — voor de form-header. */
  materialTitle: string
  /** Brand-naam — voor het bericht "Request a sample from {brand}". */
  brandName?: string | null
  /** Of de gebruiker is ingelogd. Bepaalt sign-in CTA vs form. */
  isLoggedIn: boolean
  /**
   * Of de fabrikant sample-requests heeft uitgeschakeld. True → "Samples
   * are not available for this material" (variant 4).
   */
  disabled?: boolean
  /** Endpoint voor de POST. Default: `/api/sample-request`. */
  endpoint?: string
  /**
   * Sign-in URL voor niet-ingelogde gebruikers. Default: `/sign-in?next=`
   * gevolgd door de huidige pathname. Aanroeper kan custom URL geven.
   */
  signInHref?: string
  className?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function SampleRequestForm({
  materialId,
  materialTitle,
  brandName,
  isLoggedIn,
  disabled = false,
  endpoint = '/api/sample-request',
  signInHref,
  className,
}: SampleRequestFormProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const wrapperClassName = [
    'mat-sample-cta',
    disabled && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // === Variant 4 — brand heeft samples uitgeschakeld ===
  if (disabled) {
    return (
      <div className={wrapperClassName}>
        <p className="mat-sample-cta-note">
          Samples are not available for this material.
        </p>
      </div>
    )
  }

  // === Variant 1 — niet ingelogd ===
  if (!isLoggedIn) {
    const fallbackSignIn =
      signInHref ?? `/sign-in?next=${encodeURIComponent(`/materials/${materialId}`)}`
    return (
      <div className={wrapperClassName}>
        <div className="mat-sample-cta-row">
          <Button
            as="link"
            href={fallbackSignIn}
            variant="primary"
            size="md"
            className="mat-sample-cta-button"
          >
            Request a sample
          </Button>
        </div>
        <p className="mat-sample-cta-note">
          <a href={fallbackSignIn}>Login</a> or{' '}
          <a href="/register">create an account</a> to request a free sample.
        </p>
      </div>
    )
  }

  // === Ingelogd — form gesloten state: knop om te openen ===
  if (!formOpen && status !== 'success') {
    return (
      <div className={wrapperClassName}>
        <div className="mat-sample-cta-row">
          <Button
            variant="primary"
            size="md"
            className="mat-sample-cta-button"
            onClick={() => setFormOpen(true)}
          >
            Request a sample
          </Button>
        </div>
        {brandName && (
          <p className="mat-sample-cta-note">
            MaterialDistrict forwards your request to {brandName}.
          </p>
        )}
      </div>
    )
  }

  // === Ingelogd — success-state ===
  if (status === 'success') {
    return (
      <div className={wrapperClassName}>
        <div
          className="form-banner is-success"
          role="status"
          aria-live="polite"
        >
          <strong>Request sent.</strong>{' '}
          {brandName
            ? `We've forwarded your request to ${brandName}. You'll hear from them soon.`
            : "We've forwarded your request. You'll hear from the brand soon."}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatus('idle')
            setFormOpen(true)
          }}
        >
          Send another request
        </Button>
      </div>
    )
  }

  // === Ingelogd — form geopend ===
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return

    const formData = new FormData(e.currentTarget)
    const payload = {
      material_id: materialId,
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      company: String(formData.get('company') ?? '').trim(),
      project: String(formData.get('project') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    }

    // Client-side guard — FormStateProvider verzorgt de UI-feedback, hier
    // alleen een laatste fail-safe vóór de network-call.
    if (!payload.name || !payload.email) {
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        // Try to extract a server-message for the banner.
        let message = `Request failed (${res.status}). Please try again.`
        try {
          const data = await res.json()
          if (typeof data?.message === 'string') message = data.message
        } catch {
          // Body not JSON — fall back to default message.
        }
        setStatus('error')
        setErrorMessage(message)
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage(
        'Could not reach the server. Please check your connection and try again.',
      )
    }
  }

  return (
    <div className={wrapperClassName}>
      <div className="mat-sample-cta-header">
        <h3 className="mat-sample-cta-title">Request a sample</h3>
        <p className="mat-sample-cta-subtitle">
          For <strong>{materialTitle}</strong>
          {brandName && (
            <>
              {' '}from <strong>{brandName}</strong>
            </>
          )}
        </p>
      </div>

      {status === 'error' && errorMessage && (
        <div
          className="form-banner is-error"
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </div>
      )}

      <FormStateProvider>
        <form
          onSubmit={handleSubmit}
          className="sample-request-form"
          noValidate
        >
          <Input
            name="name"
            label="Full name"
            required
            autoComplete="name"
            disabled={status === 'submitting'}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            disabled={status === 'submitting'}
            validate={(v) =>
              /^\S+@\S+\.\S+$/.test(v) || 'Enter a valid email address'
            }
          />
          <Input
            name="company"
            label="Company"
            optional
            autoComplete="organization"
            disabled={status === 'submitting'}
          />
          <Input
            name="project"
            label="Project"
            optional
            helper="Optional — give the brand some context."
            disabled={status === 'submitting'}
          />
          <Textarea
            name="message"
            label="Message"
            optional
            rows={4}
            disabled={status === 'submitting'}
          />

          <div className="sample-request-form-actions">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setFormOpen(false)}
              disabled={status === 'submitting'}
            >
              Cancel
            </Button>
            <SubmitButton variant="primary" size="md">
              {status === 'submitting' ? 'Sending…' : 'Send request'}
            </SubmitButton>
          </div>
        </form>
      </FormStateProvider>

      {brandName && (
        <p className="mat-sample-cta-note">
          MaterialDistrict forwards your request to {brandName}.
        </p>
      )}
    </div>
  )
}
