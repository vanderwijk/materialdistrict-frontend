/**
 * Events ordering — gedeelde sorteer/segmentatie-helper.
 *
 * Sessie 8.
 *
 * WP kan niet `orderby` op de meta-datum `date_start`, dus de chronologische
 * volgorde wordt in de app bepaald. Eén bron van waarheid voor zowel het
 * overzicht (`/events`) als de detailpagina (prev/next + "other events").
 *
 * Volgorde: aankomende events (eind ≥ nu) oplopend op start, daarna voorbije
 * events aflopend op start. Elk item krijgt een `isPast`-vlag. Events zonder
 * datum (`startsAt === null`) gelden als aankomend en staan achteraan binnen
 * die groep.
 */

import type { EventListItem } from '@/types/event'

/** Event-listitem verrijkt met de berekende past/upcoming-vlag. */
export type EventCardVM = EventListItem & { isPast: boolean }

const startMs = (v: string | null): number =>
  v === null ? Number.POSITIVE_INFINITY : new Date(v).getTime()

export function sortEventsByDate(
  items: EventListItem[],
  now: number = Date.now(),
): EventCardVM[] {
  const withFlags: EventCardVM[] = items.map((item) => {
    const endRef = item.endsAt ?? item.startsAt
    const isPast = endRef !== null && new Date(endRef).getTime() < now
    return { ...item, isPast }
  })

  const upcoming = withFlags
    .filter((e) => !e.isPast)
    .sort((a, b) => startMs(a.startsAt) - startMs(b.startsAt))
  const past = withFlags
    .filter((e) => e.isPast)
    .sort((a, b) => startMs(b.startsAt) - startMs(a.startsAt))

  return [...upcoming, ...past]
}
