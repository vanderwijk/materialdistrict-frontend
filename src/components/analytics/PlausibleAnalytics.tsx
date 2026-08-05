'use client'

/**
 * Plausible Analytics — privacy-friendly pageviews.
 * ----------------------------------------------------------------------
 * Always on: Plausible is cookieless and AVG-compliant for this use, so it
 * does not wait on the soft-launch consent bar (unlike md_aid / gpt.js).
 *
 * Script ID from the Plausible dashboard (materialdistrict.com).
 */

import { useEffect } from 'react'

const PLAUSIBLE_SRC = 'https://plausible.io/js/pa-KQRC-53tkpDkBl5fDQbKB.js'
const PLAUSIBLE_SCRIPT_ID = 'plausible-js'

type PlausibleFn = ((...args: unknown[]) => void) & {
  q?: unknown[]
  init?: (options?: Record<string, unknown>) => void
  o?: Record<string, unknown>
  l?: boolean
}

declare global {
  interface Window {
    plausible?: PlausibleFn
  }
}

function ensurePlausible(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(PLAUSIBLE_SCRIPT_ID)) return

  const plausible: PlausibleFn =
    window.plausible ||
    function (...args: unknown[]) {
      ;(plausible.q = plausible.q || []).push(args)
    }
  window.plausible = plausible
  plausible.init = plausible.init || function (i) {
    plausible.o = i || {}
  }
  plausible.init()

  const script = document.createElement('script')
  script.id = PLAUSIBLE_SCRIPT_ID
  script.async = true
  script.src = PLAUSIBLE_SRC
  document.head.appendChild(script)
}

export function PlausibleAnalytics() {
  useEffect(() => {
    ensurePlausible()
  }, [])

  return null
}
