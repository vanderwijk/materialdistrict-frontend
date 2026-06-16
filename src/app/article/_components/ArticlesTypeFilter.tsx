'use client'

/**
 * ArticlesTypeFilter — story-type-filter voor de articles-overzichtspage.
 *
 * Sessie 6 (D1, Optie A — voorbereid).
 *
 * Trouw aan de mockup `renderStoriesOverview()`: een single-select lijst
 * met "All" + de vijf story-types, elk met live count en de type-accent-
 * kleur wanneer actief. Bewust GEEN generieke `<FilterSidebar>`: die is
 * multi-select met accordion/zoek-chrome; de mockup-type-filter is een
 * platte single-select keuzelijst met type-kleuren. Dit is een content-
 * specifiek patroon (story-types), geen universeel filter — daarom een
 * eigen component (zie design-system DRY-afweging).
 *
 * URL-bridge: selectie gaat als `?story_type=people` naar de URL en reset
 * `?page=`. Behoudt `?q=`. "All" verwijdert de param.
 *
 * Optie A: de param gaat richting WP klaar, maar tot Johan `story_type`
 * koppelt mapt elk article op de default 'news' — dan staat de volledige
 * telling bij News. De UI markeert dat met een subtiele hint. Zodra
 * gekoppeld verdeelt alles zich vanzelf, zonder frontend-wijziging.
 *
 * Op mobile volgt dit dezelfde `.filter-sidebar`-drawer-conventie als de
 * andere overzichten (CSS verbergt 'm op smal scherm).
 */

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  STORY_TYPES,
  storyTypeLabel,
  type StoryType,
} from '@/lib/config/story-types'
import type { StoryTypeOption } from '@/lib/api'

export interface ArticlesTypeFilterProps {
  /** De vijf types met live counts (server-side berekend). */
  options: StoryTypeOption[]
  /** Het momenteel geselecteerde type, of null voor "All". */
  selectedType: StoryType | null
  /** Totaal aantal articles (voor de "All"-telling). */
  totalCount: number
  /**
   * Of de backend nog niet op type filtert (Optie A niet gekoppeld). Toont
   * dan een subtiele hint onder de lijst. Default false.
   */
  pendingBackend?: boolean
}

export function ArticlesTypeFilter({
  options,
  selectedType,
  totalCount,
  pendingBackend = false,
}: ArticlesTypeFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const countByType = new Map<StoryType, number>(
    options.map((o) => [o.value, o.count]),
  )

  const select = (type: StoryType | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (type) {
      params.set('story_type', type)
    } else {
      params.delete('story_type')
    }
    params.delete('page')
    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }

  return (
    <aside className="filter-sidebar articles-type-filter" aria-label="Story type">
      <div className="articles-type-filter-head">Story type</div>
      <ul className="articles-type-list" role="list">
        <li>
          <button
            type="button"
            className="articles-type-btn"
            data-all=""
            data-active={selectedType === null ? '' : undefined}
            aria-pressed={selectedType === null}
            onClick={() => select(null)}
          >
            <span className="articles-type-label">All</span>
            <span className="filter-count">{totalCount}</span>
          </button>
        </li>
        {STORY_TYPES.map((type) => {
          const active = selectedType === type
          return (
            <li key={type}>
              <button
                type="button"
                className="articles-type-btn"
                data-story-type={type}
                data-active={active ? '' : undefined}
                aria-pressed={active}
                onClick={() => select(type)}
              >
                <span className="articles-type-label">{storyTypeLabel(type)}</span>
                <span className="filter-count">{countByType.get(type) ?? 0}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {pendingBackend && (
        <p className="articles-type-hint">
          Type filtering is being connected — counts are indicative for now.
        </p>
      )}
    </aside>
  )
}
