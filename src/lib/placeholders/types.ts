/**
 * Placeholder types
 * ----------------------------------------------------------------------
 * Type-modellering voor de placeholder-infrastructuur.
 *
 * Achtergrond:
 * Tijdens de bouw van de frontend zijn er WP-velden die nog niet
 * (volledig) door Johan zijn ontsloten — zoals per-download
 * `insider_only`-flags (W11), term-slug-humanisering (W13), of het
 * sample-request-endpoint (W14). Om de pagina's nu al volledig te
 * kunnen beoordelen, vullen we ontbrekende data met zichtbaar
 * gemarkeerde nepwaarden.
 *
 * Centrale principes:
 *  1. Placeholders staan op ÉÉN plek (`placeholders/index.ts`)
 *  2. Activering via env-flag (`NEXT_PUBLIC_USE_PLACEHOLDERS`)
 *     — uit op productie, aan op staging/development
 *  3. Elke placeholder is visueel gemarkeerd in de UI
 *  4. Per pagina is op te vragen welke placeholders actief zijn
 *     (de Dev Status-knop) zodat ze niet vergeten worden
 */

/**
 * Bron-identifier voor één type placeholder. Komt overeen met een
 * W-issue uit `open-issues.md` zodat de Dev Status-knop direct kan
 * verwijzen naar de juiste documentatie-entry.
 */
export type PlaceholderSource =
  | 'W11-insider-flag'
  | 'W13-property-labels'
  | 'W14-sample-endpoint'
  | 'no-image'
  | 'no-brand'
  | 'no-gallery'

/**
 * Eén placeholder-veld dat door een component wordt geregistreerd.
 *
 * `id` is uniek binnen de pagina (bv. `material-12345.downloads.epd`)
 * en wordt door de PlaceholderContext gebruikt om dubbele registraties
 * te dedupliceren.
 */
export interface PlaceholderField {
  /** Unieke identifier binnen de pagina. */
  id: string
  /** Bron-issue dat dit veld nog moet oplossen. */
  source: PlaceholderSource
  /** Korte, menselijke beschrijving — getoond in de Dev Status. */
  label: string
  /**
   * Optionele uitleg wat er met deze placeholder wordt getoond.
   * Bv. "Random helft van downloads krijgt een Insider-slotje".
   */
  description?: string
}

/**
 * Metadata voor een PlaceholderSource — wat is dit issue, en wanneer
 * gaat het opgelost worden.
 *
 * Gebruikt door de Dev Status-knop om bij elk issue de juiste context
 * te tonen (welk W-nummer, eigenaar, etc.).
 */
export interface PlaceholderSourceInfo {
  /** Bron-identifier. */
  source: PlaceholderSource
  /** Korte titel — getoond als sectie-header in Dev Status. */
  title: string
  /** Welk W-issue dit oplost (of "n.v.t." voor niet-issue-gerelateerde gevallen). */
  issueRef: string
  /** Welke afhankelijkheid: WP-developer (Johan), content-team, etc. */
  owner: 'wp-developer' | 'content-team' | 'frontend'
  /** Wat moet er gebeuren om deze placeholder weg te halen. */
  resolution: string
}

/**
 * Globale registry: voor elke `PlaceholderSource` één entry met metadata.
 */
export type PlaceholderRegistry = Record<PlaceholderSource, PlaceholderSourceInfo>
