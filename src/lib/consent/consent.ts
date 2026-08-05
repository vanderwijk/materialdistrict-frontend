/**
 * Cookie consent — minimal soft-launch implementation.
 * ----------------------------------------------------------------------
 * One decision, two outcomes: accept or refuse. No per-category toggles.
 * That is deliberate for the test month; the full tool with categories and
 * a cookie statement is September work.
 *
 * What the choice controls:
 *
 *   granted → the pseudonymous `md_aid` cookie is set, interaction events
 *             are sent, and Google Publisher Tags loads.
 *   denied  → none of the above happens at all. Not "anonymised", not
 *             "limited" — the tag is never injected and no event leaves the
 *             browser.
 *   unset   → treated as denied until the visitor chooses. Under the ePrivacy
 *             rules silence is not consent, so nothing may fire while the
 *             banner is still showing.
 *
 * Strictly necessary cookies are outside this mechanism entirely: the auth
 * cookie, the cart, and the consent choice itself. Those need no permission
 * because the site cannot function without them, and asking about them only
 * trains people to click away the banner.
 *
 * The consent record is a first-party cookie rather than localStorage, so the
 * server can read it too — that matters for `/api/events`, which must be able
 * to reject a beacon that should never have been sent.
 */

export type ConsentValue = 'granted' | 'denied'

export const CONSENT_COOKIE = 'md_consent'

/** Six months. Long enough not to nag, short enough to count as a fresh ask. */
const CONSENT_MAX_AGE = 60 * 60 * 24 * 182

/** Fired on the window whenever the choice changes, so listeners can react. */
export const CONSENT_EVENT = 'md:consent'

/**
 * Read the stored choice. Returns null when the visitor has not decided yet.
 * Server-side this always returns null — use the request cookies there.
 */
export function readConsent(): ConsentValue | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`))

  if (!match) return null

  const value = match.slice(CONSENT_COOKIE.length + 1)
  return value === 'granted' || value === 'denied' ? value : null
}

/** True only for an explicit yes. Undecided counts as no. */
export function hasConsent(): boolean {
  return readConsent() === 'granted'
}

/**
 * Store the choice and notify listeners in the same tab.
 *
 * On refusal any tracking cookie already set is actively removed. A visitor
 * who says no should not keep carrying an identifier that was written before
 * they were asked.
 */
export function setConsent(value: ConsentValue): void {
  if (typeof document === 'undefined') return

  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`

  if (value === 'denied') {
    document.cookie = 'md_aid=; Max-Age=0; Path=/; SameSite=Lax'
  }

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

/**
 * Subscribe to consent changes. Returns an unsubscribe function.
 *
 * Ads are the reason this exists: a visitor who accepts should see banners
 * without having to reload, so `AdSlot` listens and initialises on the spot.
 */
export function onConsentChange(handler: (value: ConsentValue) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<ConsentValue>).detail
    if (detail === 'granted' || detail === 'denied') handler(detail)
  }

  window.addEventListener(CONSENT_EVENT, listener)
  return () => window.removeEventListener(CONSENT_EVENT, listener)
}
