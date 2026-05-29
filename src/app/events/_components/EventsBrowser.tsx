'use client'

/**
 * EventsBrowser — client-side filter + grid voor het events-overzicht.
 *
 * Sessie 8.
 *
 * Krijgt de volledige, server-gesorteerde events-lijst en filtert client-side
 * op channel (ChannelBar) + vrije tekst (zoekveld in de bar). Bewuste keuze:
 * zie de toelichting in `events/page.tsx` (WP kan niet op `date_start` sorteren,
 * set is bescheiden). De volgorde uit de server blijft behouden — aankomend
 * eerst, dan voorbij — ongeacht het filter.
 *
 * De ChannelBar-tabs tonen alleen channels die daadwerkelijk op events
 * voorkomen (union van de event-channels), zodat lege filters niet bestaan.
 */

import { useMemo, useState } from 'react'
import { ChannelBar, ALL_CHANNELS, EmptyState, Button } from '@/components/ui'
import type { EventCardVM } from '../_lib/events-order'
import { EventCard } from './EventCard'

interface EventsBrowserProps {
  events: EventCardVM[]
}

export function EventsBrowser({ events }: EventsBrowserProps) {
  const [channel, setChannel] = useState<string>(ALL_CHANNELS)
  const [search, setSearch] = useState('')

  // Channels die echt op events voorkomen (union van labels), alfabetisch.
  const channelOptions = useMemo(() => {
    const set = new Set<string>()
    for (const e of events) for (const c of e.channels) set.add(c.label)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [events])

  // Client-side filter: channel + vrije tekst. Volgorde blijft behouden.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter((e) => {
      if (channel !== ALL_CHANNELS && !e.channels.some((c) => c.label === channel)) {
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
  }, [events, channel, search])

  const hasActiveFilters = channel !== ALL_CHANNELS || search.trim().length > 0

  const clearFilters = () => {
    setChannel(ALL_CHANNELS)
    setSearch('')
  }

  return (
    <>
      <ChannelBar
        channels={channelOptions}
        activeChannel={channel}
        onChannelChange={setChannel}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search events…"
      />

      <div className="ov-wrap-full">
        {filtered.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              title="No events match these filters"
              description="Try a different channel or clear your search to see more."
              actions={
                <Button variant="outline" size="sm" onClick={clearFilters}>
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
    </>
  )
}
