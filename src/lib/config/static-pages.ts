/**
 * Static content-pages — allowlist
 * ----------------------------------------------------------------------
 * Welke WP-`page`-slugs als publieke contentpagina gerenderd mogen worden,
 * en op welk frontend-route-segment. Dit is een EXPLICIETE allowlist en
 * tegelijk de beveiligingsgrens: het `/wp/v2/pages`-endpoint bevat óók
 * account-/systeempagina's (sign-in, invoices, bookmarks, edit-brand, …)
 * die NOOIT via deze generieke template publiek mogen worden. De
 * `[pageSlug]`-route fetcht daarom alleen slugs die hier staan; al het
 * andere → notFound().
 *
 * Sessie 11 (29-05-2026). Bron: instructie-andere-agent-standaard-paginas.md.
 *
 * Bewust NIET hier opgenomen:
 *  - `contact`  → eigen route (/contact) met Gravity Forms-maatwerk
 *  - `sitemap`  → vervalt als contentpagina; gedekt door sitemap.ts (machine)
 *  - `brands`   → géén `page`; dit is het bestaande brand-overzicht (/brands)
 */

/**
 * Route-segment (zoals het in de URL staat) → WordPress `page`-slug.
 *
 * `become-a-partner` is hier bewust NIET meer opgenomen: dat is sinds sessie 11
 * een eigen ontworpen pagina (`src/app/become-a-partner/page.tsx`) met de
 * manufacturer-tiers, en vervangt de oude WP-`advertise`-contentpagina. Een
 * statisch route-segment wint altijd van de generieke [pageSlug]-template.
 */
export const PAGE_SLUG_MAP: Record<string, string> = {
  about: 'about',
  faq: 'faq',
  jobs: 'jobs',
  'privacy-statement': 'privacy-statement',
}

/** Alle toegestane route-segmenten — voor `generateStaticParams()`. */
export const STATIC_PAGE_SLUGS = Object.keys(PAGE_SLUG_MAP)

/**
 * Resolve een route-segment naar de bijbehorende WP-slug, of `null` als het
 * segment niet in de allowlist staat. De route gebruikt dit om onbekende /
 * niet-toegestane segmenten naar notFound() te sturen.
 */
export function wpSlugForRoute(routeSegment: string): string | null {
  return PAGE_SLUG_MAP[routeSegment] ?? null
}
