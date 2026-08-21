'use client'

/**
 * Plausible Analytics — privacy-friendly pageviews + custom events.
 * ----------------------------------------------------------------------
 * Always on: Plausible is cookieless and AVG-compliant for this use, so it
 * does not wait on the soft-launch consent bar (unlike md_aid / gpt.js).
 *
 * Script ID from the Plausible dashboard (materialdistrict.com). If you
 * toggle optional measurements (404 pages, outbound links, …) in Site
 * Installation, Plausible regenerates this hashed URL — update
 * `PLAUSIBLE_SRC` to match.
 *
 * 404 tracking: `NotFoundLogger` calls `trackPlausibleEvent('404')`. Also
 * create a Custom event goal named exactly `404` in the Plausible Goals
 * settings, or conversions stay invisible in the dashboard.
 */

import { useEffect } from 'react'

const PLAUSIBLE_SRC = 'https://plausible.io/js/pa-KQRC-53tkpDkBl5fDQbKB.js'
const PLAUSIBLE_SCRIPT_ID = 'plausible-js'

type PlausibleOptions = {
  callback?: (result?: { status?: number; error?: unknown }) => void
  props?: Record<string, string | number | boolean>
  revenue?: { currency: string; amount: number }
  interactive?: boolean
}

type PlausibleFn = ((eventName: string, options?: PlausibleOptions) => void) & {
  q?: unknown[]
  init?: (options?: Record<string, unknown>) => void
  o?: Record<string, unknown>
}

declare global {
  interface Window {
    plausible?: PlausibleFn
  }
}

function ensurePlausible(): PlausibleFn | undefined {
  if (typeof document === 'undefined') return undefined

  const plausible: PlausibleFn =
    window.plausible ||
    (function (eventName: string, options?: PlausibleOptions) {
      ;(plausible.q = plausible.q || []).push(
        options === undefined ? [eventName] : [eventName, options],
      )
    } as PlausibleFn)

  window.plausible = plausible
  plausible.init = plausible.init || function (i) {
    plausible.o = i || {}
  }

  if (!document.getElementById(PLAUSIBLE_SCRIPT_ID)) {
    plausible.init()

    const script = document.createElement('script')
    script.id = PLAUSIBLE_SCRIPT_ID
    script.async = true
    script.src = PLAUSIBLE_SRC
    document.head.appendChild(script)
  }

  return plausible
}

/**
 * Queue a Plausible custom event (or pageview). Safe to call before the
 * remote script has loaded — arguments sit on `plausible.q` until then.
 */
export function trackPlausibleEvent(
  eventName: string,
  options?: PlausibleOptions,
): void {
  const plausible = ensurePlausible()
  if (!plausible) return
  if (options) plausible(eventName, options)
  else plausible(eventName)
}

export function PlausibleAnalytics() {
  useEffect(() => {
    ensurePlausible()
  }, [])

  return null
}
