'use client'

import { IconSearch } from './icons'
import { ViewToggle } from './ViewToggle'
import { ChannelTabsRow } from './ChannelTabsRow'
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
 * Toont alle channels als pills in één scrollbare rij met chevron-scroll.
 * Rechts een zoekveld voor de actieve content-type. Sticky onder de header.
 */
export function ChannelBar({
  channels = DEFAULT_CHANNELS,
  activeChannel,
  onChannelChange,
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  className,
}: ChannelBarProps) {
  const allChannels = [ALL_CHANNELS, ...channels]

  return (
    <div className={cn('channel-bar', className)}>
      <div className="channel-bar-inner">
        <div className="channel-label-wrap">
          <span className="channel-label">Channel</span>
        </div>

        <ChannelTabsRow viewportRole="tablist">
          {allChannels.map((channel) => {
            const isActive = channel === activeChannel
            return (
              <button
                key={channel}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn('channel-tab', isActive && 'active', channel === ALL_CHANNELS && 'is-all')}
                onClick={() => onChannelChange(channel)}
              >
                {channel}
              </button>
            )
          })}
        </ChannelTabsRow>

        {onSearchChange && (
          <div className="channel-search-wrap">
            <div className="channel-search">
              <IconSearch size={12} strokeWidth={2} color="var(--text-hint)" aria-hidden="true" />
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

        <ViewToggle />
      </div>
    </div>
  )
}
