'use client'

/**
 * useFocusTrap — houdt de Tab-focus binnen een open dialoog (WCAG 2.4.3,
 * Focus Order). De modals in deze codebase regelden al focus-on-open,
 * Escape-sluiten, backdrop-klik en focus-restore; wat ontbrak was het
 * "vangen" van Tab, zodat de focus niet achter de overlay kon belanden.
 *
 * Bewust minimaal: één gedeelde hook, geen externe library, geen wijziging
 * aan het bestaande focus-on-open / focus-restore gedrag van de modals.
 *
 * Gebruik:
 *   const dialogRef = useRef<HTMLDivElement>(null)
 *   useFocusTrap(open, dialogRef)
 *   ... <div ref={dialogRef} role="dialog" aria-modal="true"> ...
 */

import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return
    const node = containerRef.current
    if (!node) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // Alleen zichtbare, focusbare elementen binnen de dialoog tellen mee.
      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)

      if (focusable.length === 0) {
        // Niets om naar te tabben: houd de focus op de dialoog zelf.
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        // Shift+Tab op het eerste element (of focus buiten de dialoog) → wrap
        // naar het laatste.
        if (current === first || !node.contains(current)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab op het laatste element (of focus buiten de dialoog) → wrap naar
        // het eerste.
        if (current === last || !node.contains(current)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, containerRef])
}
