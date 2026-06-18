/**
 * Event logging — generieke client (best-effort)
 * ----------------------------------------------------------------------
 * De frontend-rail van de datalaag. Stuurt elk interactie-event fire-and-
 * forget naar de proxy `/api/events`, die forwardt naar WordPress
 * `POST /md/v2/events` (zie de backend-spec). Anoniem-veilig: geen login
 * vereist.
 *
 * `anonymous_id`: we zetten een pseudonieme first-party cookie (`md_aid`,
 * random UUID, geen PII) zodat anonieme bezoekers herkenbaar zijn over een
 * sessie/bezoek heen. De proxy leest die cookie server-side en stuurt 'm mee;
 * de client hoeft 'm niet expliciet mee te geven. Bij login stitcht WordPress
 * het anonieme id aan het user_id.
 *
 * Best-effort: een mislukte log mag de UI NOOIT hinderen — fouten worden stil
 * geslikt, `keepalive` laat de beacon een navigatie overleven.
 */

const ANON_COOKIE = 'md_aid'
/** ~13 maanden, genoeg voor jaar-op-jaar herkenning. */
const ANON_MAX_AGE = 60 * 60 * 24 * 400

export interface EventInput {
  /** bv. material_viewed, story_saved, search_performed, channel_followed. */
  eventType: string
  /** material|story|brand|talk|event|book|channel|site|search */
  objectType: string
  /** id of slug van het object; leeg toegestaan voor search/site. */
  objectId?: string | number
  /** herkomst/plek (footer, article, newsletter, organic, …). */
  source?: string
  /** event-specifieke extra's (bv. { types: [...] } of { query, facets }). */
  attributes?: Record<string, unknown>
}

/** Zet de anonieme-id-cookie als die er nog niet is. No-op server-side. */
export function ensureAnonymousId(): void {
  if (typeof document === 'undefined') return
  const has = document.cookie
    .split('; ')
    .some((c) => c.startsWith(`${ANON_COOKIE}=`))
  if (has) return
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  document.cookie = `${ANON_COOKIE}=${id}; Max-Age=${ANON_MAX_AGE}; Path=/; SameSite=Lax`
}

export async function logEvent(input: EventInput): Promise<void> {
  try {
    ensureAnonymousId()
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
      body: JSON.stringify(input),
    })
  } catch {
    // Best-effort: bewust geslikt — logging mag de gebruiker nooit hinderen.
  }
}
