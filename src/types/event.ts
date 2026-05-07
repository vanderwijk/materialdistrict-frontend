/**
 * Event types
 * ----------------------------------------------------------------------
 * Domain-model voor event-CPT.
 *
 * Meta-velden uit developer-handover:
 *   _featured, _event_date_start, _event_date_end,
 *   _event_time_start, _event_time_end, _event_external_website, _event_costs
 *
 * Datums komen vermoedelijk als YYYY-MM-DD strings, tijden als HH:MM.
 * Te bevestigen bij eerste echte event-fetch.
 */

import type { MediaImage } from './media'

export interface EventMeta {
  _featured?: boolean
  /** YYYY-MM-DD verwacht. */
  _event_date_start?: string
  _event_date_end?: string
  /** HH:MM verwacht. */
  _event_time_start?: string
  _event_time_end?: string
  _event_external_website?: string
  /** Gratis / "free" / "10 EUR" — flexibel string-veld. */
  _event_costs?: string
}

export interface EventListItem {
  id: number
  slug: string
  link: string
  title: string
  excerptHtml: string
  hero: MediaImage | null
  /** Gecombineerde start-datetime als ISO-string voor sortering. Null als onbekend. */
  startsAt: string | null
  endsAt: string | null
  featured: boolean
}

export interface Event {
  id: number
  slug: string
  link: string
  title: string
  contentHtml: string
  excerptHtml: string
  hero: MediaImage | null
  /** ISO-strings, samengesteld uit date+time. Null bij ontbrekende velden. */
  startsAt: string | null
  endsAt: string | null
  /** Originele veldwaarden — handig voor weergave zonder timezone-gedoe. */
  startDate: string | null
  endDate: string | null
  startTime: string | null
  endTime: string | null
  externalWebsite: string | null
  /** Vrij tekstveld (bv. "Free", "€10", "Members only"). */
  costs: string | null
  featured: boolean
  date: string
  modified: string
}
