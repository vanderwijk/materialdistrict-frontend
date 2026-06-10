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
function dateBadge(startDate: string | null): { day: string; month: string } | null {
  if (!startDate) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  if (!m) return null
  const monthIdx = Number.parseInt(m[2], 10) - 1
  const day = String(Number.parseInt(m[3], 10))
  const month = MONTHS_SHORT[monthIdx] ?? ''
  return { day, month }
}

/** Locatie-regel: "Utrecht, Netherlands" / "Utrecht" / "Online". */
function locationLabel(event: EventListItem): string {
  if (event.type === 'online' || !event.venue) return 'Online'
  const { city, country } = event.venue
  return [city, country?.label].filter(Boolean).join(', ') || event.venue.name
}

interface EventCardProps {
  event: EventListItem & { isPast: boolean }
}

export function EventCard({ event }: EventCardProps) {
  const badge = dateBadge(event.startDate)
  const location = locationLabel(event)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="event-card"
      aria-label={`${event.title} — ${eventTypeLabel(event.type)}, ${location}`}
    >
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
          </span>
        )}
      </div>

      <div className="event-card-body">
        <span className="event-card-type">{eventTypeLabel(event.type)}</span>
        <span className="event-card-title">{event.title}</span>
        <span className="event-card-location">{location}</span>
      </div>
    </Link>
  )
}
