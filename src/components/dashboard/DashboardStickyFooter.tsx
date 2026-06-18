'use client'

import type { CSSProperties } from 'react'
import { useFormState } from '@/components/ui/form/FormStateContext'

/**
 * Sticky save bar for form panels (profile, brand profile, material form).
 *
 * Presentational: the owning form passes its completion `progress`, a `saving`
 * flag and the handlers. Only one form panel is active at a time, so a single
 * fixed footer is correct. The progress width is injected via a CSS custom
 * property (`--progress`) — the one inline-style exception allowed by the
 * architecture rules (per-record data injection, styled in globals.css).
 *
 * Required-handling: Save stays clickable. On click it triggers validation on
 * every field (highlighting the empty required ones) via the FormStateContext;
 * when the form is incomplete it turns red and shows a hint instead of saving.
 * `onSave` only fires when the form is complete. The footer must therefore be
 * rendered inside a <FormStateProvider>.
 */
export function DashboardStickyFooter({
  progress,
  saving = false,
  invalid = false,
  showPreview = true,
  onSave,
  onPreview,
  saveLabel = 'Save changes',
  invalidLabel = 'Please fill in all required fields',
}: {
  progress: number
  saving?: boolean
  /** Form is incomplete — Save stays clickable but highlights instead of saving. */
  invalid?: boolean
  showPreview?: boolean
  onSave?: () => void
  onPreview?: () => void
  saveLabel?: string
  invalidLabel?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)))
  const fillStyle = { '--progress': `${clamped}%` } as CSSProperties

  const formState = useFormState()
  const inErrorState = formState?.hasFormError ?? false

  const handleSaveClick = () => {
    // Forceer validatie op alle velden — markeert lege required velden rood.
    formState?.triggerSubmit()
    // Niet opslaan zolang de form incompleet is; de highlight + rode knop
    // tonen wat er ontbreekt.
    if (invalid) return
    onSave?.()
  }

  const saveClassName = ['btn', 'btn-primary', inErrorState && 'is-form-error']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="sticky-footer">
      <div className="sf-inner">
        <div className="sf-grid">
          <div className="sf-left">
            <span className="sf-progress-label">{clamped}% complete</span>
            <div className="progress-track">
              <div className="progress-fill" style={fillStyle} />
            </div>
          </div>
          <div className="sf-right">
            {showPreview && (
              <button type="button" className="btn btn-outline" onClick={onPreview}>
                Preview
              </button>
            )}
            <button
              type="button"
              className={saveClassName}
              onClick={handleSaveClick}
              disabled={saving}
              aria-live="polite"
            >
              {saving ? 'Saving…' : inErrorState ? invalidLabel : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
