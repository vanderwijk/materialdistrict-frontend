'use client'

/**
 * ImageLightbox
 * ----------------------------------------------------------------------
 * Pure client-side full-screen image viewer. Geen externe library, geen
 * carousel — alleen één afbeelding op volle (geclipte) viewport.
 *
 * Trigger: parent zet `open={true}`. Sluiting via:
 *  - ESC-toets
 *  - Klik op de backdrop (buiten de afbeelding)
 *  - Klik op de close-knop rechtsboven
 *
 * Accessibility:
 *  - Focus trap is minimal: alleen de close-knop is focusbaar; bij open
 *    wordt die ge-focust. Volstaat voor één-image viewer.
 *  - `role="dialog"` + `aria-modal="true"` zodat screen readers het
 *    correct als overlay aankondigen.
 *  - `aria-label` is required prop — alt-tekst van de afbeelding hoort
 *    daar mee in te zitten.
 *
 * Body-scroll lock: wanneer open zet de component `overflow: hidden` op
 * `document.body`, hersteld bij close/unmount.
 */

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface ImageLightboxProps {
  /** Is de lightbox momenteel zichtbaar? */
  open: boolean
  /** Sluit-handler — parent zet `open=false`. */
  onClose: () => void
  /** Image source URL (typisch de grootste beschikbare variant). */
  src: string
  /** Alt-text voor de afbeelding (required voor a11y). */
  alt: string
  /** Aria-label voor de dialog zelf, default: alt-tekst. */
  ariaLabel?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function ImageLightbox({
  open,
  onClose,
  src,
  alt,
  ariaLabel,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // ESC sluit de lightbox
  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Focus de close-button bij openen
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Klik op backdrop (niet op image of close-button) sluit
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  if (!open) return null

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? alt}
      onClick={handleBackdropClick}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="lightbox-image-wrap">
        {/* `unoptimized` om de orig.bron te tonen — geen Next image-pipeline
            inflate kosten op een one-off full-screen view. */}
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  )
}
