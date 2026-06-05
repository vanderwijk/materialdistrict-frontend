/**
 * Interaction event logging (client-side, best-effort)
 * ----------------------------------------------------------------------
 * Kleine fire-and-forget helper die front-end interactie-events naar de
 * Next-proxy `/api/interactions/events` stuurt, die op zijn beurt forwardt
 * naar WordPress `POST /md/v2/interactions/events` met de cookie-JWT als
 * Bearer (zie de route).
 *
 * Twee event-typen (Johan-handoff interactions):
 *  - `website_click`     — aggregaat-only; verhoogt de brand-website-clicks-
 *                          metric. Geen lead, geen interactions-lijst-entry.
 *  - `brochure_download` — verhoogt de download-teller op de attachment en
 *                          maakt een lead (status Download) → interactions +
 *                          brochures-stat.
 *
 * Best-effort: deze helper mag NOOIT de UI blokkeren of een fout naar de
 * gebruiker tonen. Een mislukte log (offline, 4xx, navigatie) wordt stil
 * geslikt. `keepalive` zorgt dat de request een navigatie naar een externe
 * site (website_click) overleeft.
 */

export type InteractionEventType = 'website_click' | 'brochure_download'

export interface LogInteractionEventInput {
  type: InteractionEventType
  /** Brand-context. Mag weg als `materialId` is gezet (WP leidt brand af). */
  brandId?: number
  /** Material-context (verplicht voor brochure_download). */
  materialId?: number
  /** Attachment-id van de gedownloade brochure (alleen brochure_download). */
  downloadId?: number
}

export async function logInteractionEvent(
  input: LogInteractionEventInput,
): Promise<void> {
  try {
    await fetch('/api/interactions/events', {
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
