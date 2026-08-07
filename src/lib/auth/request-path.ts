/**
 * Het pad van het huidige request, server-side.
 * ----------------------------------------------------------------------
 * Server components krijgen geen pathname van Next. Een layout die een
 * uitgelogde bezoeker naar `/sign-in` stuurt, weet dus niet waar die
 * bezoeker vandaan kwam — vandaar dat de dashboard-gate lang een vaste
 * `?next=/dashboard` meestuurde. Wie `/dashboard/bookmarks` deelde en
 * inlogde, belandde daarna op `/dashboard`.
 *
 * De middleware stempelt het pad op de request-headers (`x-md-pathname`);
 * hier lezen we het terug. Ontbreekt de header — middleware overgeslagen,
 * lokaal draaien, een toekomstige matcher-wijziging — dan valt alles terug
 * op de meegegeven fallback. Nooit een harde afhankelijkheid.
 *
 * **Let op:** dit bestand leest `next/headers` en is dus server-only.
 * De pure href-bouwer staat in `return-url.ts` en wordt óók door client
 * components gebruikt; die twee bewust niet samenvoegen.
 */

import { headers } from 'next/headers'
import { authHref, isSafeInternalPath } from '@/lib/auth/return-url'

/** Header waarin de middleware het pad (inclusief querystring) zet. */
export const PATHNAME_HEADER = 'x-md-pathname'

/**
 * Het pad van dit request, of `null` als het niet te bepalen is.
 * Wordt defensief gevalideerd: de header komt van onze eigen middleware,
 * maar een pad dat als `?next=` terugkomt mag nooit een open redirect zijn.
 */
export async function getRequestPath(): Promise<string | null> {
  try {
    const value = (await headers()).get(PATHNAME_HEADER)
    if (!value || !isSafeInternalPath(value)) return null
    return value
  } catch {
    // `headers()` buiten een request-scope (bv. tijdens build) — geen pad.
    return null
  }
}

/**
 * `/sign-in?next=<huidige pagina>`, met een vaste fallback als het pad
 * niet bekend is.
 *
 * @param fallback pad waarheen na inloggen genavigeerd wordt als de
 *                 middleware-header ontbreekt (bv. `/dashboard`).
 */
export async function signInHrefForCurrentPath(fallback: string): Promise<string> {
  const path = await getRequestPath()
  return authHref('/sign-in', path ?? fallback)
}
