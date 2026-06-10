'use client'

/**
 * EventsBrowser — grid + client-side filter/paginatie voor het events-overzicht.
 *
 * Krijgt de volledige, server-gesorteerde events-lijst (aankomend eerst, dan
 * voorbij) plus het actieve channel-slug en de zoekterm (uit de URL via de
 * gedeelde ChannelBarNav). De set wordt bewust in één keer geladen (WP kan
 * niet op `date_start` sorteren; de set is bescheiden) en hier gefilterd.
 *
 * §F2.7:
 *  - 7.2 Segmented filter Upcoming / Past (met "All") op de berekende
 *    `isPast`-vlag.
 *  - 7.4 Client-side paginatie, max 20 per pagina (de lijst was erg lang).
 *  - 7.3 Recently-viewed rail onderaan (gedeeld, generiek).
 *  - Channel- en tekstfilter blijven client-side (ongewijzigd gedrag).
 */

import { useEffect, useMemo, useState } from 'react'
import { EmptyState, Button, Pagination, RecentlyViewedRail } from '@/components/ui'
import type { EventCardVM } from '../_lib/events-order'
import { EventCard } from './EventCard'

const PAGE_SIZE = 20

type EventTab = 'all' | 'upcoming' | 'past'

interface EventsBrowserProps {
  events: EventCardVM[]
  /** Actief channel-slug uit `?channel=`, of undefined voor "All". */
  channelSlug?: string
  /** Zoekterm uit `?q=`. */
  search?: string
}

export function EventsBrowser({ events, channelSlug, search }: EventsBrowserProps) {
  const q = (search ?? '').trim().toLowerCase()
  const [tab, setTab] = useState<EventTab>('all')
  const [page, setPage] = useState(1)

  // Channel- + tekstfilter (ongewijzigd) — daarna pas de upcoming/past-tab.
  const base = useMemo(
    () =>
      events.filter((e) => {
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
      }),
    [events, channelSlug, q],
  )

  const upcomingCount = useMemo(() => base.filter((e) => !e.isPast).length, [base])
  const pastCount = base.length - upcomingCount

  const filtered = useMemo(() => {
    if (tab === 'upcoming') return base.filter((e) => !e.isPast)
    if (tab === 'past') return base.filter((e) => e.isPast)
    return base
  }, [base, tab])

  // Reset naar pagina 1 zodra een filter wijzigt.
  useEffect(() => {
    setPage(1)
  }, [channelSlug, q, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasActiveFilters = Boolean(channelSlug) || q.length > 0 || tab !== 'all'

  const tabs: { key: EventTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: base.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'past', label: 'Past', count: pastCount },
  ]

  return (
    <div className="ov-wrap-full">
      <div className="events-segment" role="tablist" aria-label="Filter events by date">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`events-segment-btn${tab === t.key ? ' is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="events-segment-count">{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No events match these filters"
            description="Try a different channel, switch tabs, or clear your search to see more."
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
        <>
          <div className="ov-grid-3">
            {pageItems.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="ov-pagination">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <RecentlyViewedRail entity="events" variant="inline" />
    </div>
  )
}
