'use client'

/**
 * EventsBrowser — grid + LINKER filter-sidebar + client-side paginatie voor
 * het events-overzicht.
 *
 * Krijgt de volledige, server-gesorteerde events-lijst (aankomend eerst, dan
 * voorbij) plus het actieve channel-slug en de zoekterm (uit de URL via de
 * gedeelde ChannelBarNav). De set wordt bewust in één keer geladen (WP kan
 * niet op `date_start` sorteren; de set is bescheiden) en hier gefilterd.
 *
 * §F2.11+ (events-finetuning): de filters verhuizen van de bovenbalk naar een
 * LINKER sidebar, consistent met materials/brands/talks. We hergebruiken de
 * generieke <FilterSidebar> (zelfde .uf-* opbouw, mobiele drawer, witte-pill
 * counts), gevoed door client-state:
 *   - Date     — Upcoming / Past (single-select; niets gekozen = alles). Dit
 *                vervangt de oude segmented bar; gebaseerd op de `isPast`-vlag.
 *   - Location — landen (uit `venue.country`) + "Online" (events zonder venue),
 *                zoekbaar + inklapbaar (kan lang zijn).
 *   - Type     — de event-types die in de set voorkomen (Fair/Exhibition/…).
 *
 * Channel- en tekstfilter blijven client-side (ongewijzigd gedrag, via props).
 * De "Costs: free/paid"-facet volgt zodra de events-lijst een `is_free`-vlag
 * meekrijgt (backend) — daarom hier nog niet opgenomen.
 *
 * EventsBrowser bezit zijn eigen wrapper: `.ov-wrap` (twee koloms, sidebar +
 * main) bij resultaten, `.ov-wrap-single` als er helemaal geen events zijn.
 */

import { useEffect, useMemo, useState } from 'react'
import { EmptyState, Button, Pagination, RecentlyViewedRail } from '@/components/ui'
import {
  FilterSidebar,
  type FilterSection,
  type FilterSelection,
} from '@/components/ui/FilterSidebar'
import { EVENT_TYPES, eventTypeLabel } from '@/lib/config/event-types'
import type { EventCardVM } from '../_lib/events-order'
import { EventCard } from './EventCard'

const PAGE_SIZE = 20

/** Sentinel-waarde voor "Online" (events zonder fysieke venue) in het Location-filter. */
const ONLINE_VALUE = '__online__'

interface EventsBrowserProps {
  events: EventCardVM[]
  /** Actief channel-slug uit `?channel=`, of undefined voor "All". */
  channelSlug?: string
  /** Zoekterm uit `?q=`. */
  search?: string
}

export function EventsBrowser({ events, channelSlug, search }: EventsBrowserProps) {
  const q = (search ?? '').trim().toLowerCase()
  const [selected, setSelected] = useState<FilterSelection>({})
  const [page, setPage] = useState(1)

  // Channel- + tekstfilter (ongewijzigd) — de basis waarop de sidebar-facets werken.
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

  // Filter-opties + counts, afgeleid uit de channel/zoek-gefilterde basis.
  const sections: FilterSection[] = useMemo(() => {
    let upcoming = 0
    let past = 0
    let online = 0
    const countryCounts = new Map<string, number>()
    const typeCounts = new Map<string, number>()

    base.forEach((e) => {
      if (e.isPast) past += 1
      else upcoming += 1

      if (e.venue === null) {
        online += 1
      } else if (e.venue.country?.label) {
        const label = e.venue.country.label
        countryCounts.set(label, (countryCounts.get(label) ?? 0) + 1)
      }

      typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1)
    })

    const dateOptions = [
      { value: 'upcoming', label: 'Upcoming', count: upcoming },
      { value: 'past', label: 'Past', count: past },
    ].filter((o) => o.count > 0)

    const locationOptions = [
      ...(online > 0 ? [{ value: ONLINE_VALUE, label: 'Online', count: online }] : []),
      ...Array.from(countryCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([label, count]) => ({ value: label, label, count })),
    ]

    const typeOptions = EVENT_TYPES.filter((t) => typeCounts.has(t)).map((t) => ({
      value: t,
      label: eventTypeLabel(t),
      count: typeCounts.get(t) ?? 0,
    }))

    const list: FilterSection[] = []
    if (dateOptions.length > 0) {
      list.push({
        key: 'date',
        title: 'Date',
        defaultOpen: true,
        selectMode: 'single',
        options: dateOptions,
      })
    }
    if (locationOptions.length > 0) {
      list.push({
        key: 'location',
        title: 'Location',
        searchable: true,
        collapseAfter: 10,
        options: locationOptions,
      })
    }
    if (typeOptions.length > 0) {
      list.push({ key: 'type', title: 'Type', defaultOpen: true, options: typeOptions })
    }
    return list
  }, [base])

  const filtered = useMemo(() => {
    const dateSel = selected.date ?? []
    const locSel = selected.location ?? []
    const typeSel = selected.type ?? []

    return base.filter((e) => {
      if (dateSel.includes('upcoming') && e.isPast) return false
      if (dateSel.includes('past') && !e.isPast) return false

      if (locSel.length > 0) {
        const matchOnline = e.venue === null && locSel.includes(ONLINE_VALUE)
        const matchCountry =
          e.venue?.country?.label != null && locSel.includes(e.venue.country.label)
        if (!matchOnline && !matchCountry) return false
      }

      if (typeSel.length > 0 && !typeSel.includes(e.type)) return false

      return true
    })
  }, [base, selected])

  // Reset naar pagina 1 zodra een filter wijzigt.
  useEffect(() => {
    setPage(1)
  }, [channelSlug, q, selected])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function clearFilters() {
    setSelected({})
  }

  // Helemaal geen events: enkelvoudige lege staat, geen sidebar.
  if (events.length === 0) {
    return (
      <div className="ov-wrap-single">
        <EmptyState
          title="No events available"
          description="There are currently no events to show. Please check back later."
        />
      </div>
    )
  }

  return (
    <div className="ov-wrap">
      <FilterSidebar
        sections={sections}
        selected={selected}
        onChange={setSelected}
        onClearAll={clearFilters}
      />

      <div>
        {filtered.length === 0 ? (
          <EmptyState
            title="No events match these filters"
            description="Try a different channel, adjust the filters, or clear your search to see more."
            actions={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
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
    </div>
  )
}
