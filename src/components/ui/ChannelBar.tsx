'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/** Default channels — uit MaterialDistrict_MockUp_DEF.html */
export const DEFAULT_CHANNELS = [
  'Acoustic',
  'Biobased',
  'Biodegradable',
  'Concept',
  'Curious',
  'Ecology',
  'Healing Environment',
  'High-tech',
  'Innovation',
  'Leisure & Hospitality',
  'Lightweight',
  'Manufacture',
  'Process',
  'Recycling',
  'Sense & Sensibility',
  'Smart Materials',
  'Sustainable',
  'Technology Transfer',
  'Translucency',
  'Trend',
] as const

/** Sentinel value voor de "All"-tab (toont geen channel-filter). */
export const ALL_CHANNELS = 'All'

interface ChannelBarProps {
  /** Lijst van channels. Default: DEFAULT_CHANNELS. "All" wordt automatisch toegevoegd als eerste tab. */
  channels?: readonly string[]
  /** Huidig actieve channel. "All" voor geen filter. */
  activeChannel: string
  /** Callback wanneer een channel-tab wordt geselecteerd. */
  onChannelChange: (channel: string) => void
  /** Aantal channels per pagina in de pager. Default: 6. */
  pageSize?: number
  /** Placeholder voor het zoekveld. Bv. "Search materials…". */
  searchPlaceholder?: string
  /** Huidige zoekwaarde. Controlled. */
  searchValue?: string
  /** Callback wanneer de zoekwaarde wijzigt. Debounce wordt door de parent geregeld. */
  onSearchChange?: (value: string) => void
  className?: string
}

/**
 * ChannelBar — universele bar voor overzichtspagina's (Materials, Articles, Events, Books).
 *
 * Toont channels als tabs, paginated (default 8 per pagina), met chevron-navigatie.
 * Rechts een zoekveld voor de actieve content-type. Sticky onder de header.
 *
 * @example
 *   const [channel, setChannel] = useState('All')
 *   const [search, setSearch] = useState('')
 *
 *   <ChannelBar
 *     activeChannel={channel}
 *     onChannelChange={setChannel}
 *     searchValue={search}
 *     onSearchChange={setSearch}
 *     searchPlaceholder="Search materials…"
 *   />
 */
export function ChannelBar({
  channels = DEFAULT_CHANNELS,
  activeChannel,
  onChannelChange,
  pageSize = 6,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  className,
}: ChannelBarProps) {
  const allChannels = [ALL_CHANNELS, ...channels]
  const totalPages = Math.ceil(allChannels.length / pageSize)

  // Zoek welke pagina het actieve channel bevat — initial state
  const findActivePage = (chan: string) => {
    const idx = allChannels.indexOf(chan)
    return idx === -1 ? 0 : Math.floor(idx / pageSize)
  }

  const [page, setPage] = useState(() => findActivePage(activeChannel))

  // Sync page wanneer activeChannel via parent wijzigt naar een andere pagina
  // (bv. via deep-link of clear-filter)
  const lastChannelRef = useRef(activeChannel)
  useEffect(() => {
    if (lastChannelRef.current !== activeChannel) {
      const newPage = findActivePage(activeChannel)
      if (newPage !== page) setPage(newPage)
      lastChannelRef.current = activeChannel
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel])

  const visibleChannels = allChannels.slice(page * pageSize, (page + 1) * pageSize)
  const canPrev = page > 0
  const canNext = page < totalPages - 1

  return (
    <div className={cn('channel-bar', className)}>
      <div className="channel-bar-inner">
        <div className="channel-label-wrap">
          <span className="channel-label">Channel</span>
        </div>

        <div className="channel-pager">
          <button
            type="button"
            className="channel-page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            aria-label="Previous channels"
          >
            <ChevronLeft size={10} strokeWidth={2} />
          </button>
        </div>

        <div className="channel-tabs-viewport" role="tablist" key={page}>
          {visibleChannels.map((channel) => {
            const isActive = channel === activeChannel
            return (
              <button
                key={channel}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn('channel-tab', isActive && 'active')}
                onClick={() => onChannelChange(channel)}
              >
                {channel}
              </button>
            )
          })}
        </div>

        <div className="channel-pager">
          <button
            type="button"
            className="channel-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canNext}
            aria-label="Next channels"
          >
            <ChevronRight size={10} strokeWidth={2} />
          </button>
        </div>

        {onSearchChange && (
          <div className="channel-search-wrap">
            <div className="channel-search">
              <Search size={12} strokeWidth={2} color="var(--text-hint)" aria-hidden="true" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={searchPlaceholder}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
