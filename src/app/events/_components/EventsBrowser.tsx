'use client'

/**
 * EventsBrowser — grid + client-side filter voor het events-overzicht.
 *
 * Sessie 8 / channel-sessie. Krijgt de volledige, server-gesorteerde events-
 * lijst plus het actieve channel-slug en de zoekterm (uit de URL, via de
 * gedeelde ChannelBarNav op de pagina) en filtert daarop. Bewuste keuze om
 * de set in één keer te laden en hier te filteren: zie events/page.tsx
 * (WP kan niet op date_start sorteren; de set is bescheiden). De
 * server-volgorde — aankomend eerst, dan voorbij — blijft behouden.
 *
 * De ChannelBar zelf staat niet meer hier maar op de pagina (ChannelBarNav),
 * met de volledige canonieke channel-catalogus — identiek aan de andere
 * overzichten.
 */

import { EmptyState, Button } from '@/components/ui'
import type { EventCardVM } from '../_lib/events-order'
import { EventCard } from './EventCard'

interface EventsBrowserProps {
  events: EventCardVM[]
  /** Actief channel-slug uit `?channel=`, of undefined voor "All". */
  channelSlug?: string
  /** Zoekterm uit `?q=`. */
  search?: string
}

export function EventsBrowser({ events, channelSlug, search }: EventsBrowserProps) {
  const q = (search ?? '').trim().toLowerCase()

  const filtered = events.filter((e) => {
    if (channelSlug && !e.channels.some((c) => c.slug === channelSlug)) {
      return false
    }
    if (q) {
      const haystack = [
        e.title,
        e.venue?.city ?? '',
        e.venue?.country?.label ?? '',
        e.venue?.name ?? '',
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const hasActiveFilters = Boolean(channelSlug) || q.length > 0

  return (
    <div className="ov-wrap-full">
      {filtered.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No events match these filters"
            description="Try a different channel or clear your search to see more."
            actions={
              <Button as="link" href="/events" variant="outline" size="sm">
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No events available"
            description="There are currently no events to show. Please check back later."
          />
        )
      ) : (
        <div className="ov-grid-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
