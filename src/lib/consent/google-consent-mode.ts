/**
 * Google Consent Mode v2 — signals ad/analytics permission to Google tags.
 * ----------------------------------------------------------------------
 * GTM, GPT and other Google tags read these defaults/updates from `dataLayer`.
 * Without them (and without a TCF CMP), EU ad requests stay limited /
 * non-personalized. Consent Mode is not a substitute for a Google-certified
 * CMP when personalized ads are required; it is the bridge our soft-launch
 * bar can offer until Privacy & messaging / Cookiebot is live.
 *
 * Defaults must be set in `<head>` before any Google script runs — see the
 * inline bootstrap in `layout.tsx`. This module only updates the state after
 * the visitor chooses (or a returning visitor’s cookie is applied).
 *
 * Updates are deduped: ConsentBootstrap, the head snippet, and (previously)
 * every AdSlot could each push the same `consent update` on one page load.
 */

export type ConsentModeState = 'granted' | 'denied'

export interface TcfData {
  eventStatus?: string
  listenerId?: number
  purpose?: { consents?: Record<string, boolean | undefined> }
}

export type TcfApi = (
  command: string,
  version: number,
  callback: (tcData: TcfData, success: boolean) => void,
  parameter?: number,
) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __tcfapi?: TcfApi
    /** Last Consent Mode state we pushed — skip identical updates. */
    __mdConsentMode?: ConsentModeState
  }
}

function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer ?? []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args)
    }
  }
  return window.gtag
}

/** Push a Consent Mode update that GPT can pick up on the next ad request. */
export function updateGoogleConsentMode(state: ConsentModeState): void {
  if (typeof window === 'undefined') return

  // Head snippet may already have granted for returning visitors; React
  // remounts and AdSlots must not flood dataLayer with the same update.
  if (window.__mdConsentMode === state) return
  window.__mdConsentMode = state

  const gtag = ensureGtag()
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  })

  // Non-Google tags (Meta, LinkedIn) carry an additional consent check in GTM.
  // GTM does not release those retroactively: once their All Pages trigger has
  // passed with consent denied, a later `consent update` never revives them.
  // This event gives them a trigger at the moment permission arrives.
  //
  // Deliberately inside the dedupe above: for a returning visitor the head
  // snippet already granted before gtm.js, so All Pages covers them and this
  // never fires — which keeps the pixels at one hit per page load.
  if (state === 'granted') {
    window.dataLayer?.push({ event: 'md_consent_granted' })
  }
}
