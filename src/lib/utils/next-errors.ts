/**
 * Next.js control-flow errors herkennen.
 * ----------------------------------------------------------------------
 * `redirect()`, `notFound()`, `forbidden()` en `unauthorized()` werken door
 * een speciale Error te *gooien*. Dat is bedoeld gedrag, geen fout: Next
 * vangt hem op de route-grens op en voert de navigatie uit.
 *
 * Het gevolg is een valkuil die makkelijk over het hoofd wordt gezien:
 * staat zo'n aanroep binnen een `try`, dan vangt de `catch` de navigatie
 * op. De redirect gebeurt dan niet, en de fout wordt vaak omgezet in een
 * eigen error — die vervolgens als applicatiefout in Sentry belandt.
 *
 * Elke `catch` in server-code die een aanroep omsluit die kán navigeren,
 * hoort daarom te beginnen met:
 *
 *     if (isNextControlFlowError(err)) throw err
 *
 * **Waarom een eigen helper en niet Next's `isRedirectError`:** die zit
 * alleen achter een privaat pad (`next/dist/client/components/...`), dat
 * tussen majors verhuisd is (13 → 14 → 16). Het digest-formaat zelf is
 * stabiel en publiek gedocumenteerd, dus daar toetsen we op. Geen privaat
 * importpad = geen stille breuk bij de volgende Next-upgrade.
 *
 * Digest-formaten (Next 16):
 *   redirect()      → `NEXT_REDIRECT;push;/pad;307;`
 *   notFound() e.a. → `NEXT_HTTP_ERROR_FALLBACK;404`
 *   notFound() ≤15  → `NEXT_NOT_FOUND`
 */

const CONTROL_FLOW_DIGEST_PREFIXES = [
  'NEXT_REDIRECT',
  'NEXT_HTTP_ERROR_FALLBACK',
  // Next ≤ 15; blijft staan zodat een downgrade of oudere kopie niet stil breekt.
  'NEXT_NOT_FOUND',
] as const

/**
 * `true` als deze error een Next-navigatie is (redirect / notFound /
 * forbidden / unauthorized) en dus doorgegooid moet worden.
 */
export function isNextControlFlowError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const digest = (err as { digest?: unknown }).digest
  if (typeof digest !== 'string') return false
  return CONTROL_FLOW_DIGEST_PREFIXES.some((prefix) => digest.startsWith(prefix))
}
