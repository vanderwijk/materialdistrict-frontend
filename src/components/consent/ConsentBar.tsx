'use client'

/**
 * ConsentBar — asks once, then gets out of the way.
 * ----------------------------------------------------------------------
 * Shown only while no choice is stored. Both buttons carry equal visual
 * weight: a refuse option that is greyed out or hidden behind "settings"
 * is not a free choice, and regulators treat it as no consent at all.
 *
 * Rendered as a bar rather than a full-screen overlay. The page stays
 * readable, which matters during a test month — a visitor who cannot see
 * the site cannot report what is wrong with it.
 *
 * Sits above the feedback button (z-index) because a consent choice must
 * never be obscured by anything else.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readConsent, setConsent } from '@/lib/consent/consent'

export function ConsentBar() {
  // Starts hidden and only appears after mount, so the server-rendered HTML
  // never contains a banner that a returning visitor would briefly see.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (readConsent() === null) setVisible(true)
  }, [])

  if (!visible) return null

  function choose(value: 'granted' | 'denied') {
    setConsent(value)
    setVisible(false)
  }

  return (
    <div className="cc-bar" role="region" aria-label="Cookie consent">
      <div className="cc-inner">
        <p className="cc-text">
          We use cookies to measure how the site is used and to show
          advertising. You can refuse — the site works either way.{' '}
          <Link href="/privacy-statement/" className="cc-link">
            Privacy statement
          </Link>
        </p>
        <div className="cc-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => choose('denied')}
          >
            Refuse
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => choose('granted')}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
