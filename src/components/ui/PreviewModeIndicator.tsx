'use client'

import { usePreviewMode } from '@/lib/hooks/usePreviewMode'
import { IconClose } from '@/components/ui/icons'

/**
 * PreviewModeIndicator — globale fixed-bottom-center indicator die zichtbaar
 * wordt zodra er ten minste één tier-preview actief is.
 *
 * Gemount één keer in `DashboardShell` binnen de `<PreviewModeProvider>`.
 * De indicator regelt zelf zijn zichtbaarheid via `activePreviews.size` en
 * dient zowel de brand-tier-previews (`BrandTierGate`) als de reader/Insider-
 * previews (`InsiderGate variant="preview"`).
 *
 * Sluiten kan ALLEEN via deze indicator (gebruiker-keuze sessie 3A: niet
 * via individuele gate-knoppen). Gates met preview tonen alleen "Preview" —
 * die knop verdwijnt na unlock.
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
            — a preview of what you&apos;d unlock
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
