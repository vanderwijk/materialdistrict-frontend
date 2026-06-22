/**
 * EventCard — overzicht-tegel voor één event.
 *
 * Sessie 8.
 *
 * Mockup-patroon (`renderEventsOverview`): een band met de hero + een navy
 * datum-badge (dag + maand) linksonder, een "Past"-pill linksboven bij voorbije
 * events, en daaronder type-label, titel en locatie. Anders dan de generieke
 * `ContentCard` (tag-overlay + thumb) is de datum-badge het kenmerkende element,
 * daarom een eigen card.
 *
 * Locatie: `venue.city, country` of "Online" wanneer er geen fysieke venue is
 * (online events / `venue === null`).
 */

import Link from 'next/link'
import type { EventListItem } from '@/types/event'
import { eventTypeLabel } from '@/lib/config/event-types'
import { CardBookmarkButton } from '@/components/ui/CardBookmarkButton'

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const

/**
 * Dag + maand uit een YYYY-MM-DD-string, timezone-vrij (handmatig geparsed —
 * `new Date('2027-03-10')` zou als UTC-middernacht de dag kunnen verschuiven).
 */
/** YYYY-MM-DD → {y, mo (0-idx), d}, timezone-vrij geparsed. */
function parseYmd(value: string | null): { y: number; mo: number; d: number } | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return null
  return {
    y: Number.parseInt(m[1], 10),
    mo: Number.parseInt(m[2], 10) - 1,
    d: Number.parseInt(m[3], 10),
  }
}

/**
 * Datum-badge: een dag/range met maand en jaartal als derde regel.
 *   - zelfde dag    "10 / MAR / 2027"
 *   - zelfde maand  "10-12 / MAR / 2027"
 *   - andere maand  "30-2 / MAR-APR / 2027"
 *   - over jaargrens "30-2 / DEC-JAN / 2027-2028"
 */
function dateBadge(
  startDate: string | null,
  endDate: string | null,
): { day: string; month: string; year: string } | null {
  const s = parseYmd(startDate)
  if (!s) return null
  const e = parseYmd(endDate)
  if (!e || (e.y === s.y && e.mo === s.mo && e.d === s.d)) {
    return {
      day: String(s.d),
      month: MONTHS_SHORT[s.mo] ?? '',
      year: String(s.y),
    }
  }
  const sameMonth = e.y === s.y && e.mo === s.mo
  return {
    day: `${s.d}\u2013${e.d}`,
    month: sameMonth
      ? MONTHS_SHORT[s.mo] ?? ''
      : `${MONTHS_SHORT[s.mo] ?? ''}\u2013${MONTHS_SHORT[e.mo] ?? ''}`,
    year: e.y === s.y ? String(s.y) : `${s.y}\u2013${e.y}`,
  }
}

/** Locatie-regel: "Utrecht, Netherlands" / "Utrecht" / "Online". */
function locationLabel(event: EventListItem): string {
  if (event.type === 'online' || !event.venue) return 'Online'
  const { city, country } = event.venue
  return [city, country?.label].filter(Boolean).join(', ') || event.venue.name
}

interface EventCardProps {
  event: EventListItem & { isPast: boolean }
  /**
   * `'home'` = homepage-split-variant: een "Get tickets"-knop staat ÍN de
   * tegel (parallel aan "View book" in de book-tegel). De kaart is dan geen
   * losse Link maar een container: beeld + tekst linken naar de detailpagina,
   * de externe ticket-link is een aparte link binnen dezelfde tegel (zo
   * ontstaat er geen verboden geneste `<a>`).
   */
  variant?: 'default' | 'home'
  /** Externe ticket-/event-URL (alleen home-variant; toont "Get tickets"). */
  ticketUrl?: string | null
}

export function EventCard({
  event,
  variant = 'default',
  ticketUrl,
}: EventCardProps) {
  const badge = dateBadge(event.startDate, event.endDate)
  const location = locationLabel(event)
  const detailHref = `/event/${event.slug}`
  const cardLabel = `${event.title} — ${eventTypeLabel(event.type)}, ${location}`

  const band = (
    <div className="event-card-band">
      {event.hero ? (
        <img
          src={event.hero.sourceUrl}
          alt={event.hero.alt || ''}
          className="event-card-img"
          loading="lazy"
        />
      ) : (
        <span className="event-card-band-fallback" aria-hidden="true" />
      )}

      {event.isPast && <span className="event-card-past">Past</span>}

      <CardBookmarkButton type="events" itemId={event.id} withOverlay />

      {badge && (
        <span className="event-card-date" aria-hidden="true">
          <span className="event-card-date-day">{badge.day}</span>
          <span className="event-card-date-month">{badge.month}</span>
          <span className="event-card-date-year">{badge.year}</span>
        </span>
      )}
    </div>
  )

  const body = (
    <div className="event-card-body">
      <span className="event-card-type">{eventTypeLabel(event.type)}</span>
      <span className="event-card-title">{event.title}</span>
      <span className="event-card-location">{location}</span>
    </div>
  )

  // Home-variant: container met aparte detail-link + ticket-link (geen nesting).
  if (variant === 'home') {
    return (
      <div className="event-card event-card--home">
        <Link href={detailHref} className="event-card-link" aria-label={cardLabel}>
          {band}
          {body}
        </Link>
        {ticketUrl && (
          <a
            href={ticketUrl}
            className="event-card-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get tickets →
          </a>
        )}
      </div>
    )
  }

  // Default-variant: de hele kaart is één link naar de detailpagina.
  return (
    <Link href={detailHref} className="event-card" aria-label={cardLabel}>
      {band}
      {body}
    </Link>
  )
}
