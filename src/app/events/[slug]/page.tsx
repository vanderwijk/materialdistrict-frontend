/**
 * `/events/[slug]` — event-detailpagina.
 *
 * Sessie 8.
 *
 * Server Component. Haalt het event op (incl. hero + gallery) plus — parallel —
 * de gesorteerde events-lijst voor prev/next-buren en "other events". Rendert
 * de detail-shell conform de mockup `renderEventDetail()`:
 *
 *   pub-wrap
 *     DetailHeader (event-tag · titel · meta · actions[share + register])
 *     pub-layout
 *       main:  media-viewer (gallery + video) · beschrijving · prev/next
 *       aside: register/visit-CTA · event-details · other events
 *
 * CTA (is_md_event): MD-event → "Register", extern → "Visit website" — beide
 * naar `externalWebsite` (zelfde veld, ander label). Online events tonen geen
 * locatie-blok maar "Online".
 *
 * Bewust niet in v1 (zie sessie-8-afspraken): "What to expect"-highlights
 * (geen veld) en "Reading for this event" (Books = sessie 9).
 *
 * JSON-LD: Event + BreadcrumbList. notFound() bij onbekende slug.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { Button } from '@/components/ui'
import { getEvent, listEvents } from '@/lib/api'
import { JsonLd, buildEvent, buildBreadcrumbList } from '@/lib/seo'
import { eventTypeLabel } from '@/lib/config/event-types'
import type { Event } from '@/types/event'
import type { MediaImage } from '@/types/media'
import { sortEventsByDate } from '../_lib/events-order'
import { EventDetailActions } from './_components/EventDetailActions'
import { EventMediaViewer } from './_components/EventMediaViewer'
import { EventPrevNext, type EventPrevNextNeighbour } from './_components/EventPrevNext'

const NEIGHBOUR_SCAN = 100
const OTHER_EVENTS = 3

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

interface EventDetailPageProps {
  params: Promise<{ slug: string }>
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** "10 Mar 2027" uit YYYY-MM-DD, timezone-vrij geparsed. */
function formatYMD(ymd: string | null): string | null {
  if (!ymd) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const month = MONTHS_SHORT[Number.parseInt(m[2], 10) - 1] ?? ''
  return `${Number.parseInt(m[3], 10)} ${month} ${m[1]}`
}

/** Datum-range: "10 Mar 2027" of "10 Mar 2027 – 12 Mar 2027". */
function formatRange(start: string | null, end: string | null): string | null {
  const s = formatYMD(start)
  if (!s) return null
  const e = end && end !== start ? formatYMD(end) : null
  return e ? `${s} – ${e}` : s
}

/** Locatie-regel: "Utrecht, Netherlands" / venue-naam / "Online". */
function locationLabel(event: Pick<Event, 'type' | 'venue'>): string {
  if (event.type === 'online' || !event.venue) return 'Online'
  const { city, country, name } = event.venue
  return [city, country?.label].filter(Boolean).join(', ') || name
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) {
    return { title: 'Event not found', robots: { index: false, follow: false } }
  }
  const description = stripHtml(event.excerptHtml) || undefined
  return {
    title: event.title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      url: `/events/${event.slug}`,
      ...(event.hero?.sourceUrl ? { images: [event.hero.sourceUrl] } : {}),
    },
  }
}

/** Prev/next + other events uit één gesorteerde lijst. Faalbestendig. */
async function getRelatedEvents(currentSlug: string): Promise<{
  prev: EventPrevNextNeighbour | null
  next: EventPrevNextNeighbour | null
  others: Array<{ slug: string; title: string; type: Event['type']; dateLabel: string | null; location: string }>
}> {
  try {
    const { items } = await listEvents({ perPage: NEIGHBOUR_SCAN, page: 1 })
    const sorted = sortEventsByDate(items)
    const idx = sorted.findIndex((e) => e.slug === currentSlug)
    const prevItem = idx > 0 ? sorted[idx - 1] : null
    const nextItem = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null

    const others = sorted
      .filter((e) => e.slug !== currentSlug && !e.isPast)
      .slice(0, OTHER_EVENTS)
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        type: e.type,
        dateLabel: formatYMD(e.startDate),
        location: locationLabel(e),
      }))

    return {
      prev: prevItem ? { slug: prevItem.slug, title: prevItem.title } : null,
      next: nextItem ? { slug: nextItem.slug, title: nextItem.title } : null,
      others,
    }
  } catch {
    return { prev: null, next: null, others: [] }
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params

  const event = await getEvent(slug)
  if (!event) notFound()

  const { prev, next, others } = await getRelatedEvents(slug)

  const typeLabel = eventTypeLabel(event.type)
  const dateRange = formatRange(event.startDate, event.endDate)
  const location = locationLabel(event)
  const bodyHtml = event.contentHtml || event.excerptHtml

  // Past/upcoming — zelfde regel als de gedeelde sorteer-helper.
  const endRef = event.endsAt ?? event.startsAt
  const isPast = endRef !== null && new Date(endRef).getTime() < Date.now()

  // Media: hero (featured) + gallery, ontdubbeld op id.
  const seen = new Set<number>()
  const images = [event.hero, event.gallery.hero, ...event.gallery.thumbs]
    .filter((img): img is MediaImage => Boolean(img))
    .filter((img) => (seen.has(img.id) ? false : (seen.add(img.id), true)))

  // Meta-regel: type · [Past event] · datum · locatie.
  const metaParts = [
    typeLabel,
    isPast ? 'Past event' : '',
    dateRange ?? '',
    location,
  ].filter(Boolean)

  const ctaLabel = event.isMdEvent ? 'Register →' : 'Visit website →'
  const showCta = Boolean(event.externalWebsite) && !isPast
  const registerBtn = showCta ? (
    <Button as="link" href={event.externalWebsite as string} variant="blue" size="sm">
      {ctaLabel}
    </Button>
  ) : undefined

  return (
    <>
      <article className="pub-wrap">
        <DetailHeader
          backNode={
            <a href="/events" className="detail-header-back">
              ← Events
            </a>
          }
          tags={[{ type: 'content', contentType: 'event' }]}
          title={event.title}
          meta={metaParts.join(' · ')}
          actions={
            <EventDetailActions
              eventId={event.id}
              eventSlug={slug}
              eventTitle={event.title}
              customPrimary={registerBtn}
            />
          }
        />

        <div className="pub-layout">
          {/* Main column */}
          <div>
            <EventMediaViewer images={images} videos={event.videos} title={event.title} />

            {bodyHtml && (
              <div
                className="event-detail-body"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}

            <EventPrevNext prev={prev} next={next} />
          </div>

          {/* Sidebar */}
          <aside className="event-aside">
            {showCta && (
              <div className="event-register-card">
                <div className="event-register-eyebrow">{typeLabel}</div>
                <div className="event-register-title">{event.title}</div>
                <div className="event-register-meta">
                  {[dateRange, location].filter(Boolean).join(' · ')}
                </div>
                <Button
                  as="link"
                  href={event.externalWebsite as string}
                  variant="blue"
                  className="event-register-btn"
                >
                  {ctaLabel}
                </Button>
              </div>
            )}

            <div className="event-facts-card">
              <div className="event-facts-head">Event details</div>
              {dateRange && (
                <div className="event-facts-row">
                  <span className="event-facts-label">Date</span>
                  <span className="event-facts-value">{dateRange}</span>
                </div>
              )}
              {(event.startTime || event.endTime) && (
                <div className="event-facts-row">
                  <span className="event-facts-label">Time</span>
                  <span className="event-facts-value">
                    {[event.startTime, event.endTime].filter(Boolean).join(' – ')}
                  </span>
                </div>
              )}
              <div className="event-facts-row">
                <span className="event-facts-label">Location</span>
                <span className="event-facts-value">{location}</span>
              </div>
              {event.venue?.name && event.type !== 'online' && (
                <div className="event-facts-row">
                  <span className="event-facts-label">Venue</span>
                  <span className="event-facts-value">{event.venue.name}</span>
                </div>
              )}
              {event.costs && (
                <div className="event-facts-row">
                  <span className="event-facts-label">Costs</span>
                  <span className="event-facts-value">{event.costs}</span>
                </div>
              )}
              <div className="event-facts-row">
                <span className="event-facts-label">Type</span>
                <span className="event-facts-value">{typeLabel}</span>
              </div>
            </div>

            {others.length > 0 && (
              <div className="event-other-card">
                <div className="event-facts-head">Other events</div>
                {others.map((o) => (
                  <a key={o.slug} href={`/events/${o.slug}`} className="event-other-item">
                    <span className="event-other-type">{eventTypeLabel(o.type)}</span>
                    <span className="event-other-title">{o.title}</span>
                    <span className="event-other-meta">
                      {[o.dateLabel, o.location].filter(Boolean).join(' · ')}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </aside>
        </div>
      </article>

      <JsonLd
        data={[
          buildEvent({
            slug: event.slug,
            title: event.title,
            description: stripHtml(event.excerptHtml) || undefined,
            heroImage: event.hero?.sizes?.large?.url ?? event.hero?.sourceUrl,
            startsAt: event.startsAt ?? '',
            endsAt: event.endsAt ?? undefined,
            location: event.venue
              ? {
                  name: event.venue.name,
                  city: event.venue.city ?? undefined,
                  country: event.venue.country?.label,
                }
              : undefined,
          }),
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Events', url: '/events' },
            { label: event.title },
          ]),
        ]}
      />
    </>
  )
}
