import { isUpstreamUnavailable } from './upstream-guard'

/**
 * Degrade a server page fetch instead of failing the whole render when the CMS
 * is down. Keeps Vercel from retry-storming WordPress on every list/overview hit.
 */
export async function withUpstreamFallback<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (isUpstreamUnavailable(err)) {
      console.warn(`[upstream-page] ${label} using fallback`, err)
      return fallback
    }
    throw err
  }
}

/**
 * §INCIDENT-02-09 — voorkomt dat een lege render als geldige pagina wordt gecachet.
 *
 * `withUpstreamFallback` laat losse blokken wegvallen zonder de hele pagina te
 * laten struikelen. Als álle kernblokken tegelijk terugvallen — precies wat er
 * gebeurt bij een CMS-storing — dan rendert de pagina "succesvol" met nul inhoud
 * en schrijft Next.js die lege versie weg als geldige prerender.
 *
 * Gebruik alleen voor de kern van een pagina, nooit voor sier-blokken:
 *
 *   assertRenderable('home', [materials.length, articles.length, channels.length])
 */
export function assertRenderable(label: string, counts: number[]): void {
  const total = counts.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0)
  if (total > 0) return

  console.error(
    `[upstream-page] ${label} has no content after fallbacks — refusing to cache an empty render`,
  )
  throw new Error(
    `Upstream unavailable: ${label} produced no content. Refusing to cache an empty page.`,
  )
}
