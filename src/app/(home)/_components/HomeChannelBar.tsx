/**
 * HomeChannelBar — channel-navigatie op de homepage (Homepage-1).
 * --------------------------------------------------------------------
 * Vervangt de oude `material_category`-pillen door dezelfde channel-bar als op
 * de overzichtspagina's, maar als NAVIGATIE: elke tab is een link naar
 * `/channel/<slug>` (en "All" naar de `/channel`-index), zonder zoekveld en
 * view-toggle. Alle pills staan in één horizontaal scrollbare rij (CSS-only).
 */

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface HomeChannelBarItem {
  slug: string
  label: string
}

export interface HomeChannelBarProps {
  channels: HomeChannelBarItem[]
  className?: string
}

const ALL_TAB: HomeChannelBarItem = { slug: '', label: 'All' }

export function HomeChannelBar({ channels, className }: HomeChannelBarProps) {
  const tabs = [ALL_TAB, ...channels]

  return (
    <div className={cn('channel-bar', 'is-nav', className)}>
      <div className="channel-bar-inner">
        <div className="channel-label-wrap">
          <span className="channel-label">Channel</span>
        </div>

        <div className="channel-tabs-scroll">
          <div className="channel-tabs-viewport">
            {tabs.map((c) => (
              <Link
                key={c.slug || 'all'}
                href={c.slug ? `/channel/${c.slug}` : '/channel'}
                className={cn('channel-tab', c.slug === '' && 'is-all')}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
