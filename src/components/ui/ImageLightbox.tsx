'use client'

/**
 * ImageLightbox
 * ----------------------------------------------------------------------
 * Full-screen image viewer met navigatie tussen meerdere afbeeldingen.
 * Geen externe library, pure CSS + React.
 *
 * Navigatie:
 *  - Pijltje-knoppen links/rechts over de afbeelding (disabled aan
 *    uiteinden, niet-cyclisch)
 *  - Toetsenbord ← → werken
 *  - Counter "X / Y" onderin
 *
 * Sluiting:
 *  - ESC-toets
 *  - Klik op de backdrop (buiten de afbeelding)
 *  - Klik op de close-knop rechtsboven
 *
 * Accessibility:
 *  - role="dialog", aria-modal
 *  - Body-scroll lock terwijl open
 *  - Focus bij open op de close-knop
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface LightboxImage {
  /** Image-source (typisch de grootste beschikbare variant). */
  src: string
  /** Alt-tekst voor de afbeelding. */
  alt: string
}

export interface ImageLightboxProps {
  /** Is de lightbox momenteel zichtbaar? */
  open: boolean
  /** Sluit-handler — parent zet `open=false`. */
  onClose: () => void
  /** Lijst van afbeeldingen om door te bladeren. */
  images: LightboxImage[]
  /** Index van de afbeelding waar de viewer mee start. */
  initialIndex?: number
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function ImageLightbox({
  open,
  onClose,
  images,
  initialIndex = 0,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const [index, setIndex] = useState(initialIndex)

  // Reset naar initialIndex elke keer dat de lightbox opent
  useEffect(() => {
    if (open) {
      const safe = Math.max(0, Math.min(initialIndex, images.length - 1))
      setIndex(safe)
    }
  }, [open, initialIndex, images.length])

  const canPrev = index > 0
  const canNext = index < images.length - 1

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i))
  }, [])
  const goNext = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : i))
  }, [images.length])

  // ESC sluit + pijltjes navigeren
  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key === 'ArrowRight') {
        goNext()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose, goPrev, goNext])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Focus close bij openen
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Backdrop click sluit
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  if (!open || images.length === 0) return null

  const current = images[index] ?? images[0]
  const hasMultiple = images.length > 1

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
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

      {hasMultiple && (
        <>
          <button
            type="button"
            className="lightbox-nav lightbox-nav--prev"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            disabled={!canPrev}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="lightbox-nav lightbox-nav--next"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            disabled={!canNext}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div className="lightbox-image-wrap" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt}
          className="lightbox-image"
        />
      </div>

      {hasMultiple && (
        <div className="lightbox-counter" aria-live="polite">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
