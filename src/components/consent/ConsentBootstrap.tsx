'use client'

/**
 * ConsentBootstrap — keeps Google Consent Mode and (when present) IAB TCF
 * in sync with `md_consent`.
 *
 * Mounted once in the root layout. On load it re-applies a stored choice so
 * returning visitors update Consent Mode before GPT requests ads. It also
 * listens for a Google-certified CMP (`__tcfapi`) so Ad Manager Privacy &
 * messaging can drive the same `md_consent` gate used by events / `md_aid`.
 */

import { useEffect } from 'react'
import {
  hasConsent,
  isEuConsentRegion,
  onConsentChange,
  readConsent,
  setConsent,
  type ConsentValue,
} from '@/lib/consent/consent'
import {
  updateGoogleConsentMode,
  type TcfData,
} from '@/lib/consent/google-consent-mode'

function applyConsentMode(value: ConsentValue | null): void {
  if (value === 'granted') updateGoogleConsentMode('granted')
  else if (value === 'denied') updateGoogleConsentMode('denied')
  else if (!isEuConsentRegion()) updateGoogleConsentMode('granted')
  else updateGoogleConsentMode('denied')
}

/** Purpose 1 = store/access device — required for NPA and personalized ads. */
function purpose1Granted(tcData: TcfData): boolean {
  return tcData.purpose?.consents?.['1'] === true
}

function bindTcfListener(): (() => void) | undefined {
  const tcfapi = window.__tcfapi
  if (typeof tcfapi !== 'function') return undefined

  let listenerId: number | undefined

  tcfapi('addEventListener', 2, (tcData, success) => {
    if (!success) return

    if (typeof tcData.listenerId === 'number') {
      listenerId = tcData.listenerId
    }

    if (
      tcData.eventStatus === 'tcloaded' ||
      tcData.eventStatus === 'useractioncomplete'
    ) {
      const next: ConsentValue = purpose1Granted(tcData) ? 'granted' : 'denied'
      if (readConsent() !== next) setConsent(next)
    }
  })

  return () => {
    if (typeof listenerId === 'number' && typeof window.__tcfapi === 'function') {
      window.__tcfapi('removeEventListener', 2, () => {}, listenerId)
    }
  }
}

export function ConsentBootstrap() {
  useEffect(() => {
    applyConsentMode(readConsent())

    // Outside EU: allow ads immediately (no banner) and notify listeners once.
    if (!isEuConsentRegion() && readConsent() === null && hasConsent()) {
      window.dispatchEvent(
        new CustomEvent('md:consent', { detail: 'granted' as ConsentValue }),
      )
    }

    const unsubscribe = onConsentChange((value) => {
      applyConsentMode(value)
    })

    // TCF / Privacy & messaging only matters in the EU consent region.
    if (!isEuConsentRegion()) {
      return () => {
        unsubscribe()
      }
    }

    let tcfUnbind = bindTcfListener()
    const poll = window.setInterval(() => {
      if (tcfUnbind) {
        window.clearInterval(poll)
        return
      }
      tcfUnbind = bindTcfListener()
      if (tcfUnbind) window.clearInterval(poll)
    }, 500)

    const pollTimeout = window.setTimeout(() => window.clearInterval(poll), 15000)

    return () => {
      unsubscribe()
      window.clearInterval(poll)
      window.clearTimeout(pollTimeout)
      tcfUnbind?.()
    }
  }, [])

  return null
}
