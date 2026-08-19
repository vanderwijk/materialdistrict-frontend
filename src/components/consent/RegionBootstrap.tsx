'use client'

/**
 * RegionBootstrap — fetches the consent region once, if it is not known yet.
 *
 * The region used to be stamped by middleware on every navigation. That
 * `Set-Cookie` made every HTML response uncacheable at the edge, so all
 * traffic — overwhelmingly crawlers — re-rendered on every hit.
 *
 * Now the cookie is written by `GET /api/consent/region`, and only for real
 * browsers: this component asks for it once per visitor, when the cookie is
 * absent. Crawlers run no JavaScript, so they never trigger it and the HTML
 * they receive stays cacheable.
 *
 * Failure is silent by design. `isEuConsentRegion()` treats a missing cookie
 * as EU, which is the conservative side: the consent bar shows and the event
 * gate stays closed until a choice is made.
 */

import { useEffect } from 'react'
import { REGION_COOKIE, readConsentRegion } from '@/lib/consent/eu-region'

/**
 * Guard against a second request when React mounts the tree twice
 * (Strict Mode in development, or a remount after a soft navigation).
 */
let requestInFlight = false

export function RegionBootstrap() {
  useEffect(() => {
    if (readConsentRegion() !== null) return
    if (requestInFlight) return

    requestInFlight = true

    fetch('/api/consent/region', { credentials: 'same-origin' })
      .then(() => {
        // The route sets the cookie; nothing to read here. Consent code
        // picks it up from `document.cookie` on its next evaluation.
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[consent] ${REGION_COOKIE} resolved`)
        }
      })
      .catch(() => {
        // Silent: missing region falls back to EU treatment.
        requestInFlight = false
      })
  }, [])

  return null
}
