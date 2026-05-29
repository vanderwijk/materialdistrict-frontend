/**
 * Event types — UI-config voor event-segmentatie
 * ----------------------------------------------------------------------
 * Events worden gesegmenteerd in zes vaste typen. Op het `/events`-overzicht
 * stuurt dit de type-label op de card en (later) sortering/filtering; op de
 * detailpagina de type-pill in de header.
 *
 * BACKEND-STATUS (sessie 8 — live, plugin-commit b64c8de): het WP-veld is
 * ontsloten als de taxonomy `event_type`, geëxposeerd op `meta.event_type`
 * (`{id,slug,label}[]`) met `meta.event_type_slug` als platte canonieke slug.
 * De mapper leest die slug; `'other'` is de canonieke fallback wanneer er
 * geen term is toegekend (conform Johan's handoff).
 *
 * Anders dan story-types hebben event-types géén eigen accentkleur per type:
 * de mockup toont het type als platte uppercase-labeltekst op de card en als
 * `ct-event`-pill op de detailpagina (één gedeelde content-type-kleur voor
 * alle events). Daarom houdt deze config alleen labels + volgorde bij; de
 * presentatiekleur komt uit de content-type-tag (`ct-event`) in de CSS.
 *
 * De zes types matchen Johan's J6-spec exact:
 *   fair · exhibition · lecture · workshop · online · other
 */

/**
 * De zes canonieke event-types. Komt overeen met de WP-taxonomy
 * `event_type` (J6). `'other'` is tevens de mapper-default.
 */
export type EventType =
  | 'fair'
  | 'exhibition'
  | 'lecture'
  | 'workshop'
  | 'online'
  | 'other'

/** Fallback-default voor events met een onbekende/ontbrekende type-slug. */
export const DEFAULT_EVENT_TYPE: EventType = 'other'

/**
 * Presentatie-label per event-type. Leidend voor de UI; niet uit de API
 * af te leiden (de WP-label kan afwijken/wijzigen, dit is de canonieke
 * weergavenaam).
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  fair: 'Fair',
  exhibition: 'Exhibition',
  lecture: 'Lecture',
  workshop: 'Workshop',
  online: 'Online',
  other: 'Other',
}

/** De zes types in UI-volgorde (zoals de mockup ze toont). */
export const EVENT_TYPES: readonly EventType[] = [
  'fair',
  'exhibition',
  'lecture',
  'workshop',
  'online',
  'other',
]

/** Type-guard: is een willekeurige waarde een geldige EventType? */
export function isEventType(value: unknown): value is EventType {
  return (
    typeof value === 'string' &&
    (EVENT_TYPES as readonly string[]).includes(value)
  )
}

/**
 * Normaliseer een ruwe waarde naar een EventType. Onbekende of lege
 * waarden vallen terug op de default (`'other'`). Gebruikt door de mapper
 * op `meta.event_type_slug`.
 */
export function toEventType(value: unknown): EventType {
  return isEventType(value) ? value : DEFAULT_EVENT_TYPE
}

/** Het label voor een event-type (bv. `'fair'` → `'Fair'`). */
export function eventTypeLabel(type: EventType): string {
  return EVENT_TYPE_LABELS[type] ?? EVENT_TYPE_LABELS.other
}

/**
 * Is dit een online event (geen fysieke venue)? Handig voor de UI om bij
 * online events géén locatie-blok te tonen maar een "Online"-label.
 */
export function isOnlineEventType(type: EventType): boolean {
  return type === 'online'
}
