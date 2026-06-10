'use client'

/**
 * useRecentlyViewed — generieke "recently viewed"-lijst per content-type
 * (§F2.7, D1). Generaliseert het materials-only `useRecentlyViewedMaterials`
 * naar stories/brands/events/talks.
 *
 * Per entity een eigen localStorage-key (`md:recently-viewed-<entity>`),
 * FIFO met dedup-on-slug, max 6. Persistente lijst (tussen sessies), puur
 * client-side — geen server-tracking, geen backend.
 *
 * Materials houdt bewust zijn eigen `useRecentlyViewedMaterials` (andere
 * entry-vorm, al live); deze generieke variant dekt de vier overige types.
 */

import { useCallback, useEffect, useState } from 'react'

export type RecentlyViewedEntity = 'articles' | 'brands' | 'events' | 'talks'

export interface RecentlyViewedEntry {
  type: RecentlyViewedEntity
  slug: string
  title: string
  /** Tweede regel: datum / locatie / spreker. Null als leeg. */
  subtitle: string | null
  thumbnailUrl: string | null
  /** Volledige detail-link (`/articles/[slug]`, …). */
  href: string
  /** Voor stabiele sortering. */
  viewedAt: number
}

const MAX_ITEMS = 6
const storageKey = (entity: RecentlyViewedEntity) => `md:recently-viewed-${entity}`

function readList(entity: RecentlyViewedEntity): RecentlyViewedEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(entity))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (x): x is RecentlyViewedEntry =>
          x &&
          typeof x === 'object' &&
          typeof (x as RecentlyViewedEntry).slug === 'string' &&
          typeof (x as RecentlyViewedEntry).title === 'string' &&
          typeof (x as RecentlyViewedEntry).href === 'string',
      )
      .slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function writeList(entity: RecentlyViewedEntity, items: RecentlyViewedEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(entity), JSON.stringify(items))
  } catch {
    /* localStorage kan disabled zijn — fail silent */
  }
}

/** Voeg een item toe (naar voren, dedup-on-slug, FIFO-trim tot MAX_ITEMS). */
export function addRecentlyViewed(
  entry: Omit<RecentlyViewedEntry, 'viewedAt'>,
): void {
  const current = readList(entry.type)
  const without = current.filter((x) => x.slug !== entry.slug)
  const next: RecentlyViewedEntry[] = [
    { ...entry, viewedAt: Date.now() },
    ...without,
  ].slice(0, MAX_ITEMS)
  writeList(entry.type, next)
}

/** Verwijder één item (op slug). Geeft de nieuwe lijst terug. */
export function removeRecentlyViewed(
  entity: RecentlyViewedEntity,
  slug: string,
): RecentlyViewedEntry[] {
  const next = readList(entity).filter((x) => x.slug !== slug)
  writeList(entity, next)
  return next
}

/** SSR-safe hook: leeg op eerste render, hydrateert na mount. */
export function useRecentlyViewed(entity: RecentlyViewedEntity): {
  items: RecentlyViewedEntry[]
  ready: boolean
  remove: (slug: string) => void
} {
  const [items, setItems] = useState<RecentlyViewedEntry[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readList(entity))
    setReady(true)
  }, [entity])

  const remove = useCallback(
    (slug: string) => setItems(removeRecentlyViewed(entity, slug)),
    [entity],
  )

  return { items, ready, remove }
}

/**
 * Drop-in tracker voor een detail-page: schrijft het huidige item naar de
 * recently-viewed lijst zodra de page mount. Rendert niets.
 */
export function RecentlyViewedTracker(
  entry: Omit<RecentlyViewedEntry, 'viewedAt'>,
) {
  const { type, slug, title, subtitle, thumbnailUrl, href } = entry
  useEffect(() => {
    addRecentlyViewed({ type, slug, title, subtitle, thumbnailUrl, href })
  }, [type, slug, title, subtitle, thumbnailUrl, href])
  return null
}
