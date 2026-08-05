'use client'

/**
 * ConsentBar — asks once, then gets out of the way.
 * ----------------------------------------------------------------------
 * Soft-launch fallback. When Ad Manager Privacy & messaging injects a
 * Google-certified CMP (`__tcfapi`), that UI takes priority: we wait briefly
 * for it and stay hidden if it appears, so visitors are not asked twice.
 *
 * Both buttons carry equal visual weight when we do show: a refuse option
 * that is greyed out or hidden behind "settings" is not a free choice.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  isEuConsentRegion,
  onConsentChange,
  readConsent,
  setConsent,
} from '@/lib/consent/consent'
import {
  updateGoogleConsentMode,
  type TcfData,
} from '@/lib/consent/google-consent-mode'

/** Give Privacy & messaging time to inject `__tcfapi` / show its UI. */
const CMP_WAIT_MS = 2500

export function ConsentBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Soft-launch bar is EU-scope only. Google's CMP also geo-targets;
    // Rest of World gets neither prompt (ads/events allowed via hasConsent).
    if (!isEuConsentRegion()) return
    if (readConsent() !== null) return

    let cancelled = false
    let cmpTookOver = false

    const unsubscribe = onConsentChange(() => {
      setVisible(false)
    })

    const hideForCmp = () => {
      cmpTookOver = true
      setVisible(false)
    }

    const onTcf = (tcData: TcfData, success: boolean) => {
      if (!success) return
      // Only yield when Google's CMP UI is (or was) the active prompt.
      if (
        tcData.eventStatus === 'cmpuishown' ||
        tcData.eventStatus === 'useractioncomplete'
      ) {
        hideForCmp()
      }
    }

    const tryBindTcf = () => {
      if (typeof window.__tcfapi !== 'function') return false
      window.__tcfapi('addEventListener', 2, onTcf)
      return true
    }

    let poll: number | undefined
    if (!tryBindTcf()) {
      poll = window.setInterval(() => {
        if (tryBindTcf() && poll) window.clearInterval(poll)
      }, 250)
    }

    const showFallback = window.setTimeout(() => {
      if (cancelled || cmpTookOver || readConsent() !== null) return
      if (!isEuConsentRegion()) return
      setVisible(true)
    }, CMP_WAIT_MS)

    return () => {
      cancelled = true
      unsubscribe()
      window.clearTimeout(showFallback)
      if (poll) window.clearInterval(poll)
    }
  }, [])

  if (!visible) return null

  function choose(value: 'granted' | 'denied') {
    updateGoogleConsentMode(value === 'granted' ? 'granted' : 'denied')
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
