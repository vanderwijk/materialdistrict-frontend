/**
 * Google Consent Mode v2 — signals ad/analytics permission to Google tags.
 * ----------------------------------------------------------------------
 * GPT and other Google tags read these defaults/updates from `dataLayer`.
 * Without them (and without a TCF CMP), EU ad requests stay limited /
 * non-personalized. Consent Mode is not a substitute for a Google-certified
 * CMP when personalized ads are required; it is the bridge our soft-launch
 * bar can offer until Privacy & messaging / Cookiebot is live.
 *
 * Defaults must be set in `<head>` before any Google script runs — see the
 * inline bootstrap in `layout.tsx`. This module only updates the state after
 * the visitor chooses (or a returning visitor’s cookie is applied).
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

  const gtag = ensureGtag()
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  })
}
