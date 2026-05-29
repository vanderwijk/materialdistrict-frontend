/**
 * Event types
 * ----------------------------------------------------------------------
 * Domain-model voor het event-CPT.
 *
 * Bron: Johan's REST-handoff (sessie 8, plugin-commit b64c8de). Alle
 * frontend-velden komen gecureerd via `meta` op de standaard WP-endpoints
 * `/wp/v2/event`, in dezelfde shapes als articles/brands/talks.
 *
 * Locatie wordt gemodelleerd als een venue-koppeling (N:1, zoals brand op
 * material): de display-velden van de gekoppelde venue staan gedenormaliseerd
 * op `meta.venue`. Online events hebben geen fysieke venue → `venue = null`.
 */

import type { TaxonomyTerm } from './article'
import type { Gallery, MediaImage } from './media'
import type { EventType } from '@/lib/config/event-types'

/**
 * Land van een venue als `{ code, label }` — zelfde vorm als `brand_country`.
 * `code` is een ISO-3166-alpha-2 (bv. "NL"), `label` de leesbare naam
 * (bv. "Netherlands").
 */
export interface EventVenueCountry {
  code: string
  label: string
}

/**
 * Gestructureerde venue, gedenormaliseerd op het event (`meta.venue`).
 * Voor weergave in het locatie-blok + de quick-facts. `id`/`slug` voor een
 * eventuele link naar een venue-pagina later. Adresvelden zijn nullable
 * conform Johan's contract (lege strings komen als `null`).
 */
export interface EventVenue {
  id: number
  slug: string
  name: string
  street: string | null
  postcode: string | null
  city: string | null
  country: EventVenueCountry | null
}

/**
 * Eén video op een event (`meta.videos[]`). `url` kan YouTube óf Vimeo zijn,
 * inclusief de Vimeo unlisted-vorm `vimeo.com/{id}/{hash}`. Provider-detectie
 * + embed gebeurt in de video-util (Batch 3), niet hier. `title`/`thumbnail`
 * kunnen leeg zijn.
 */
export interface EventVideo {
  url: string
  title: string | null
  thumbnail: string | null
}

export interface EventListItem {
  id: number
  slug: string
  link: string
  title: string
  excerptHtml: string
  hero: MediaImage | null
  /** Canoniek event-type (uit `meta.event_type_slug`); default `'other'`. */
  type: EventType
  /** Gecombineerde start-datetime als ISO-string voor sortering. Null als onbekend. */
  startsAt: string | null
  endsAt: string | null
  /** Originele datum/tijd voor weergave zonder timezone-conversie. */
  startDate: string | null
  startTime: string | null
  /** MD-georganiseerd (true) vs extern (false) — stuurt de card-/CTA-variant. */
  isMdEvent: boolean
  /** Gedenormaliseerde venue voor de card-locatie. Null bij online events. */
  venue: EventVenue | null
  /** Channel-tags voor de ChannelBar-filter en (optioneel) card-pills. */
  channels: TaxonomyTerm[]
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
  /** Canoniek event-type (uit `meta.event_type_slug`); default `'other'`. */
  type: EventType
  /** ISO-strings, samengesteld uit date+time. Null bij ontbrekende velden. */
  startsAt: string | null
  endsAt: string | null
  /** Originele veldwaarden — handig voor weergave zonder timezone-gedoe. */
  startDate: string | null
  endDate: string | null
  startTime: string | null
  endTime: string | null
  /** MD-georganiseerd (true) → "Register"; extern (false) → "Visit website". */
  isMdEvent: boolean
  /** Doel-URL voor zowel Register als Visit website (zelfde veld). */
  externalWebsite: string | null
  /** Vrij tekstveld (bv. "Free", "€10", "Members only"). */
  costs: string | null
  featured: boolean
  /** Gedenormaliseerde venue. Null bij online events. */
  venue: EventVenue | null
  /** Channel-tags. */
  channels: TaxonomyTerm[]
  /** Videos (YouTube/Vimeo, incl. unlisted). Lege array als geen. */
  videos: EventVideo[]
  /** Opgeloste gallery (hero + thumbs) uit `meta.gallery` attachment-ID's. */
  gallery: Gallery
  date: string
  modified: string
}
