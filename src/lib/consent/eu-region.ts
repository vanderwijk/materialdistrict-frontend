/**
 * EU consent region — EEA + UK + Switzerland.
 *
 * Matches Google's EU User Consent Policy scope (and Ad Manager Privacy &
 * messaging targeting). Used to show our soft-launch bar only where that
 * policy applies; outside it, ads/events may run without the prompt.
 */

/** ISO 3166-1 alpha-2 codes. */
export const EU_CONSENT_COUNTRIES = new Set([
  // EU
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  // EEA (non-EU)
  'IS',
  'LI',
  'NO',
  // Google EU User Consent Policy also covers:
  'GB',
  'CH',
])

export type ConsentRegion = 'eu' | 'row'

/** Set by middleware from Vercel `x-vercel-ip-country`. */
export const REGION_COOKIE = 'md_region'

export function regionFromCountry(country: string | null | undefined): ConsentRegion {
  if (!country) {
    // Unknown geo → treat as EU (ask / wait for CMP) rather than assume ROW.
    return 'eu'
  }
  return EU_CONSENT_COUNTRIES.has(country.toUpperCase()) ? 'eu' : 'row'
}

export function readConsentRegion(): ConsentRegion | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${REGION_COOKIE}=`))

  if (!match) return null

  const value = match.slice(REGION_COOKIE.length + 1)
  return value === 'eu' || value === 'row' ? value : null
}

/** True when the visitor is in the Google EU consent scope (or geo unknown). */
export function isEuConsentRegion(): boolean {
  const region = readConsentRegion()
  // Missing cookie (first paint before middleware, or non-Vercel): assume EU.
  return region !== 'row'
}
