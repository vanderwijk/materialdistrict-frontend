/**
 * Centrale placeholder-module
 * ----------------------------------------------------------------------
 * One-stop-shop voor het ophalen van placeholder-waarden tijdens
 * ontwikkeling. Voorkomt dat nepwaarden verspreid raken over de
 * codebase.
 *
 * Gebruik:
 *
 *   import { arePlaceholdersActive, PLACEHOLDER_REGISTRY } from '@/lib/placeholders'
 *
 *   if (arePlaceholdersActive()) {
 *     // toon placeholder-versie
 *   }
 *
 * Activering via `NEXT_PUBLIC_USE_PLACEHOLDERS=true` in `.env.local`.
 *
 * Belangrijk: deze module bevat geen UI-logica — alleen waarden en
 * registry-info. De visuele markering gebeurt in
 * `<PlaceholderMark>` (zie `components/ui/PlaceholderMark.tsx`).
 */

import type {
  PlaceholderRegistry,
  PlaceholderSource,
  PlaceholderSourceInfo,
} from './types'

// --------------------------------------------------------------------
// Activatie
// --------------------------------------------------------------------

/**
 * True wanneer placeholders actief moeten zijn — bepaalt of mappers
 * nepwaarden invullen en of de Dev Status-knop wordt gerenderd.
 *
 * Default UIT op productie zodat een verkeerd geconfigureerde build
 * nooit per ongeluk nep-data toont aan eindgebruikers.
 */
export function arePlaceholdersActive(): boolean {
  // De env-variabele wordt door Next.js op build-time geïnlined.
  // Strikt vergelijken met de string "true" — alle andere waarden = uit.
  return process.env.NEXT_PUBLIC_USE_PLACEHOLDERS === 'true'
}

// --------------------------------------------------------------------
// Registry — metadata per placeholder-bron
// --------------------------------------------------------------------

/**
 * Bron-registry: voor elke `PlaceholderSource` één entry met info over
 * wat dit issue is en hoe het wordt opgelost.
 *
 * Wanneer een W-issue is afgesloten, mag de overeenkomstige entry hier
 * gewist worden — dat zorgt automatisch dat de Dev Status-knop het
 * issue niet meer toont en compile-time waarschuwt als er nog code is
 * die deze source gebruikt.
 */
export const PLACEHOLDER_REGISTRY: PlaceholderRegistry = {
  'W11-insider-flag': {
    source: 'W11-insider-flag',
    title: 'Per-download Insider-flag',
    issueRef: 'W11',
    owner: 'wp-developer',
    resolution:
      'Johan moet `_insider_only`-flag per download in WP meta toevoegen. Tot die tijd: random helft van downloads getoond als Insider-only.',
  },
  'W13-property-labels': {
    source: 'W13-property-labels',
    title: 'Property-label-humanisering',
    issueRef: 'W13',
    owner: 'frontend',
    resolution:
      'Term-slugs uit FacetWP (matt, semi-gloss, etc.) moeten netjes gehumaniseerd worden. Tot die tijd: ruwe slug met capitalize-fallback.',
  },
  'W14-sample-endpoint': {
    source: 'W14-sample-endpoint',
    title: 'Sample-request-endpoint',
    issueRef: 'W14',
    owner: 'wp-developer',
    resolution:
      'Johan moet `POST /md/v2/sample-request` bouwen. Tot die tijd: form valideert en logt, maar verstuurt niet daadwerkelijk.',
  },
  'no-image': {
    source: 'no-image',
    title: 'Ontbrekende afbeelding',
    issueRef: 'n.v.t.',
    owner: 'content-team',
    resolution:
      'Content-team uploadt featured image. Tot die tijd: lichtgrijze placeholder met material/brand-initialen.',
  },
  'no-brand': {
    source: 'no-brand',
    title: 'Ontbrekende brand-koppeling',
    issueRef: 'n.v.t.',
    owner: 'content-team',
    resolution:
      'Material moet `meta.brand_id` ingevuld krijgen. Tot die tijd: brand-naam toont "Unattributed".',
  },
  'no-gallery': {
    source: 'no-gallery',
    title: 'Lege gallery',
    issueRef: 'n.v.t.',
    owner: 'content-team',
    resolution:
      'Content-team voegt attachments toe via WP-uploader. Tot die tijd: alleen featured image, geen filmstrip.',
  },
}

// --------------------------------------------------------------------
// Concrete placeholder-waarden
// --------------------------------------------------------------------

/**
 * Generieke placeholder-waarden — wat we tonen als de echte data
 * ontbreekt. Allemaal duidelijk herkenbaar als nep (via
 * `<PlaceholderMark>` in de UI).
 */
export const PLACEHOLDER_VALUES = {
  /** Fallback brand-naam wanneer `brand_id` ontbreekt. */
  brandName: 'Unattributed',

  /**
   * Fallback hero-afbeelding URL — een data-URI met een lichtgrijs
   * vlak met "No image" tekst. Geen externe afhankelijkheid, geen
   * extra netwerk-call.
   */
  imageDataUri:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="400" fill="#f0ede8"/>
        <text x="300" y="195" text-anchor="middle" font-family="system-ui, sans-serif"
              font-size="18" fill="#b8b3aa" font-weight="500">No image yet</text>
        <text x="300" y="218" text-anchor="middle" font-family="system-ui, sans-serif"
              font-size="13" fill="#c8c3ba">placeholder</text>
      </svg>`,
    ),

  /** Fallback voor sample-request "verstuurd"-bevestiging tijdens W14. */
  sampleSubmittedMessage:
    'Request received (placeholder — endpoint not live yet)',
} as const

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

/**
 * Deterministische pseudo-random op basis van een nummer-input.
 * Voor placeholder-data willen we dat dezelfde input altijd dezelfde
 * output geeft — zo verspringen de Insider-vlaggen niet bij elke render.
 *
 * Gebruikt een eenvoudige mulberry32-achtige permutatie. Niet voor
 * cryptografische doeleinden — alleen voor consistente placeholder-data.
 */
export function deterministicBool(seed: number): boolean {
  let x = (seed + 0x6d2b79f5) | 0
  x = Math.imul(x ^ (x >>> 15), x | 1)
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
  return (((x ^ (x >>> 14)) >>> 0) % 2) === 1
}

/**
 * Bepaalt op deterministische wijze of een gegeven download
 * insider-only moet zijn — alleen actief wanneer placeholders aan
 * staan en W11 nog niet is opgelost.
 *
 * Strategie: alle EPD-downloads zijn Insider (matcht echte use-case),
 * datasheet en product-url zijn dat niet. Voor de zekerheid een
 * deterministische random voor onbekende download-types.
 *
 * @param downloadKind - type van de download: 'datasheet' | 'epd' | 'product' | string
 * @param materialId - ID van het material; zorgt dat de seed stabiel is per material
 */
export function getPlaceholderInsiderFlag(
  downloadKind: string,
  materialId: number,
): boolean {
  if (!arePlaceholdersActive()) return false
  if (downloadKind === 'epd') return true
  if (downloadKind === 'datasheet') return false
  if (downloadKind === 'product') return false
  // Onbekend type → deterministisch random
  return deterministicBool(materialId * 31 + downloadKind.length)
}

/**
 * Humanizing-fallback voor property-labels (W13).
 *
 * Wanneer de FacetWP-response geen label levert (komt vrijwel niet
 * voor, maar defensief), of wanneer een ruwe slug door de UI heen
 * komt: capitalize de eerste letter, vervang streepjes door spaties.
 *
 * Voorbeelden:
 *   'matt' → 'Matt'
 *   'semi-gloss' → 'Semi gloss'
 *   '50-100-percent' → '50 100 percent'
 *
 * Niet perfect, maar voorkomt dat ruwe slugs in de UI verschijnen.
 */
export function humanizePropertySlug(slug: string): string {
  if (!slug) return ''
  const spaced = slug.replace(/-/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/**
 * Geeft de PlaceholderSourceInfo voor een gegeven bron — nuttig voor
 * de Dev Status-knop die per actieve placeholder de context toont.
 */
export function getPlaceholderSourceInfo(
  source: PlaceholderSource,
): PlaceholderSourceInfo {
  return PLACEHOLDER_REGISTRY[source]
}

// --------------------------------------------------------------------
// Re-export types voor convenience
// --------------------------------------------------------------------

export type {
  PlaceholderField,
  PlaceholderRegistry,
  PlaceholderSource,
  PlaceholderSourceInfo,
} from './types'
