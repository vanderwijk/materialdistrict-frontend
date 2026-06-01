'use client'

import type { CSSProperties } from 'react'

/**
 * Sticky save bar for form panels (profile, brand profile, material form).
 *
 * Presentational: the owning form passes its completion `progress`, a `saving`
 * flag and the handlers. Only one form panel is active at a time, so a single
 * fixed footer is correct. The progress width is injected via a CSS custom
 * property (`--progress`) — the one inline-style exception allowed by the
 * architecture rules (per-record data injection, styled in globals.css).
 */
export function DashboardStickyFooter({
  progress,
  saving = false,
  disabled = false,
  showPreview = true,
  onSave,
  onPreview,
  saveLabel = 'Save changes',
}: {
  progress: number
  saving?: boolean
  disabled?: boolean
  showPreview?: boolean
  onSave?: () => void
  onPreview?: () => void
  saveLabel?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)))
  const fillStyle = { '--progress': `${clamped}%` } as CSSProperties

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
              className="btn btn-green"
              onClick={onSave}
              disabled={saving || disabled}
            >
              {saving ? 'Saving…' : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
