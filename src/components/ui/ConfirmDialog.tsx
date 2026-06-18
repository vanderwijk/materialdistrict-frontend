'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Reusable confirmation dialog (review point 13).
 *
 * A standard in-app confirmation modal — names the item, states the
 * consequence, and offers a clear danger button. Replaces the native
 * `window.confirm()` used for material / saved-search / board deletes, which
 * looked inconsistent with the rest of the dashboard.
 *
 * This is NOT the type-to-confirm pattern — that stays reserved for the heavier,
 * irreversible brand delete (DeleteBrandPanel). For ordinary deletes a single
 * clear confirmation is enough.
 *
 * Same overlay / Escape / focus / scroll-lock behaviour as the other modals in
 * the codebase.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' → red confirm button (default); 'default' → primary. */
  tone?: 'danger' | 'default'
  /** Disables buttons while the action is in flight. */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement | null

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKey)

    const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(
      'button, a, input, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
      previousFocusRef.current?.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="confirm-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <div className="confirm-dialog">
        <h2 id={titleId} className="confirm-dialog-title">
          {title}
        </h2>
        {description && (
          <div id={descId} className="confirm-dialog-desc">
            {description}
          </div>
        )}
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
