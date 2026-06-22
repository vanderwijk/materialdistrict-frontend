'use client'

/**
 * useRecentlyViewedMaterials
 * ----------------------------------------------------------------------
 * Houdt een lijst bij van recent bezochte material-detail-pages in
 * localStorage. Anders dan de filter-context (sessionStorage, per-tab,
 * 30 min TTL) is dit een **persistente** lijst die de gebruiker tussen
 * sessies meeneemt — herkenbaar als "Recently viewed".
 *
 * Opslag-structuur:
 *  - Key: `md:recently-viewed-materials`
 *  - Value: array van compacte entries (max 6)
 *  - FIFO met dedup-on-slug
 *
 * Privacy: alles staat in localStorage. Geen server-tracking.
 */

import { useCallback, useEffect, useState } from 'react'
import { normalizeMediaUrl } from '@/lib/utils/normalize-media-url'

// --------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------

const STORAGE_KEY = 'md:recently-viewed-materials'
const MAX_ITEMS = 6

// --------------------------------------------------------------------
// Types
// --------------------------------------------------------------------

export interface RecentlyViewedMaterial {
  slug: string
  title: string
  brandName: string | null
  thumbnailUrl: string | null
  /** Wanneer het laatst bezocht is — voor stabiele sortering. */
  viewedAt: number
}

// --------------------------------------------------------------------
// Read / write
// --------------------------------------------------------------------

function readList(): RecentlyViewedMaterial[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (x): x is RecentlyViewedMaterial =>
          x &&
          typeof x === 'object' &&
          typeof (x as RecentlyViewedMaterial).slug === 'string' &&
          typeof (x as RecentlyViewedMaterial).title === 'string',
      )
      .map((entry) => ({
        ...entry,
        thumbnailUrl: normalizeMediaUrl(entry.thumbnailUrl),
      }))
      .slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function writeList(items: RecentlyViewedMaterial[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* localStorage kan disabled zijn — fail silent */
  }
}

/**
 * Voeg een material aan de lijst toe. Als hij er al staat wordt-ie
 * naar voren verplaatst (geen duplicaten). FIFO trim tot MAX_ITEMS.
 */
export function addToRecentlyViewed(item: Omit<RecentlyViewedMaterial, 'viewedAt'>): void {
  const current = readList()
  const without = current.filter((x) => x.slug !== item.slug)
  const next: RecentlyViewedMaterial[] = [
    { ...item, thumbnailUrl: normalizeMediaUrl(item.thumbnailUrl), viewedAt: Date.now() },
    ...without,
  ].slice(0, MAX_ITEMS)
  writeList(next)
}

/**
 * Verwijder één material uit de recently-viewed lijst (op slug). Geeft de
 * nieuwe lijst terug. Stil als de slug er niet in staat of localStorage
 * niet beschikbaar is.
 */
export function removeFromRecentlyViewed(slug: string): RecentlyViewedMaterial[] {
  const next = readList().filter((x) => x.slug !== slug)
  writeList(next)
  return next
}

// --------------------------------------------------------------------
// Hook (SSR-safe)
// --------------------------------------------------------------------

/**
 * React hook voor het lezen van de lijst. Returnt een lege array
 * op de eerste render (SSR-safe) en hydrateert na useEffect.
 */
export function useRecentlyViewedMaterials(): {
  items: RecentlyViewedMaterial[]
  ready: boolean
  /** Verwijder een tile uit de lijst (op slug). Update direct in deze tab. */
  remove: (slug: string) => void
} {
  const [items, setItems] = useState<RecentlyViewedMaterial[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(readList())
    setReady(true)
  }, [])

  const remove = useCallback((slug: string) => {
    setItems(removeFromRecentlyViewed(slug))
  }, [])

  return { items, ready, remove }
}

// --------------------------------------------------------------------
// Writer component
// --------------------------------------------------------------------

/**
 * Drop-in component op de material-detail-page: schrijft het huidige
 * material naar de recently-viewed lijst zodra de page mount.
 */
export function RecentlyViewedWriter({
  slug,
  title,
  brandName,
  thumbnailUrl,
}: Omit<RecentlyViewedMaterial, 'viewedAt'>) {
  useEffect(() => {
    addToRecentlyViewed({ slug, title, brandName, thumbnailUrl })
  }, [slug, title, brandName, thumbnailUrl])

  return null
}
