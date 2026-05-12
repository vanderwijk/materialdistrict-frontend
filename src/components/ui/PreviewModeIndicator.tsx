'use client'

import { usePreviewMode } from '@/lib/hooks/usePreviewMode'
import { IconClose } from '@/components/ui/icons'

/**
 * PreviewModeIndicator — globale fixed-bottom-center indicator die zichtbaar
 * wordt zodra er ten minste één brand-tier preview-mode actief is.
 *
 * Gebruik: render dit één keer in de root-layout (bv. in `app/layout.tsx`)
 * binnen een `<PreviewModeProvider>`. De indicator regelt zelf zijn
 * zichtbaarheid via `activePreviews.size`.
 *
 * Sluiten kan ALLEEN via deze indicator (gebruiker-keuze sessie 3A: niet
 * via individuele section-gate-knoppen). Section-gates met preview tonen
 * alleen "Preview" — die knop verdwijnt na unlock.
 *
 * Niet-Insider-gerelateerd. Voor Insider-gating bestaat geen preview-modus.
 */
export function PreviewModeIndicator() {
  const { activePreviews, closeAll } = usePreviewMode()
  const count = activePreviews.size

  if (count === 0) return null

  const label =
    count === 1
      ? '1 feature in preview mode'
      : `${count} features in preview mode`

  return (
    <div className="preview-mode-indicator" role="status" aria-live="polite">
      <div className="preview-mode-indicator-inner">
        <span className="preview-mode-indicator-dot" aria-hidden="true" />
        <span className="preview-mode-indicator-text">
          <strong>{label}</strong>
          <span className="preview-mode-indicator-sublabel">
            — changes will not be saved
          </span>
        </span>
        <button
          type="button"
          className="preview-mode-indicator-close"
          onClick={closeAll}
          aria-label="Close all previews"
        >
          <IconClose size={14} strokeWidth={2.5} />
          <span>Close all previews</span>
        </button>
      </div>
    </div>
  )
}
