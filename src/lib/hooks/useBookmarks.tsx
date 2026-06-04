'use client'

/**
 * useBookmarks — gedeelde bookmark-state voor de hele publieke site.
 *
 * Tot nu toe was "Save" op detailpagina's en cards een lokale UI-toggle
 * zonder persistence (placeholder uit sessie 4–7). Deze provider maakt het
 * écht werkend: hij hydrateert eenmalig de bookmarks van de ingelogde
 * gebruiker, en `toggleBookmark()` schrijft optimistisch door naar WordPress
 * via de `/api/dashboard/bookmarks`-routes.
 *
 * Mechaniek (analoog aan useCompare):
 *  - Provider zit hoog in de tree (`app/layout.tsx`, binnen AuthProvider) zodat
 *    elk client-eiland via `useBookmarks()` dezelfde state deelt.
 *  - De saved-set is een Map `"{type}:{itemId}" → bookmarkId`. We bewaren de
 *    bookmark-record-id omdat DELETE op record-id werkt, niet op (type,itemId).
 *  - Hydratie: één GET zodra de gebruiker is ingelogd. Anoniem = lege set,
 *    geen request.
 *
 * "WordPress computes, frontend reads": de saved-state komt van WP; de
 * frontend recomputeert niets. Optimistische updates worden teruggedraaid
 * als de server faalt.
 *
 * Loose mode: buiten een Provider (style-guide, tests) zijn alle reads leeg
 * en is `toggleBookmark` een no-op — geen errors.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import type { BookmarkItem, BookmarkType } from '@/types/dashboard'

// --------------------------------------------------------------------
// Context
// --------------------------------------------------------------------

interface BookmarksContextValue {
  /** Of de hydratie-fetch nog loopt (eerste render na login). */
  isLoading: boolean
  /** True wanneer dit item in de saved-list van de gebruiker staat. */
  isSaved: (type: BookmarkType, itemId: number) => boolean
  /**
   * Toggle een item in/uit de bookmarks. Persisteert naar WordPress
   * (POST om toe te voegen, DELETE om te verwijderen) met optimistische
   * update + revert bij fout. No-op zolang dezelfde toggle nog in-flight is.
   */
  toggleBookmark: (type: BookmarkType, itemId: number) => void
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

/** Map-key: content-type + onderliggende post-id. */
function keyOf(type: BookmarkType, itemId: number): string {
  return `${type}:${itemId}`
}

// --------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()

  // "{type}:{itemId}" → bookmarkId (record-id voor DELETE).
  const [saved, setSaved] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  // Toggles die nog naar de server schrijven — voorkomt dubbel-klik races.
  const pending = useRef<Set<string>>(new Set())
  // Voorkom dubbele hydratie binnen dezelfde sessie.
  const hydratedFor = useRef<boolean | null>(null)

  // ---- Hydratie: één GET zodra ingelogd ----
  useEffect(() => {
    if (!isLoggedIn) {
      // Uitloggen → set leegmaken zodat een volgende gebruiker schoon start.
      setSaved(new Map())
      hydratedFor.current = false
      return
    }
    if (hydratedFor.current) return
    hydratedFor.current = true

    let cancelled = false
    setIsLoading(true)
    fetch('/api/dashboard/bookmarks', { method: 'GET' })
      .then((res) => (res.ok ? res.json() : []))
      .then((items: BookmarkItem[]) => {
        if (cancelled || !Array.isArray(items)) return
        const next = new Map<string, string>()
        for (const item of items) {
          if (typeof item.itemId === 'number' && item.itemId > 0) {
            next.set(keyOf(item.type, item.itemId), item.id)
          }
        }
        setSaved(next)
      })
      .catch(() => {
        /* Niet kritiek — knoppen tonen dan de niet-actieve state. */
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  const isSaved = useCallback(
    (type: BookmarkType, itemId: number) => saved.has(keyOf(type, itemId)),
    [saved],
  )

  const toggleBookmark = useCallback<BookmarksContextValue['toggleBookmark']>(
    (type, itemId) => {
      const key = keyOf(type, itemId)
      if (pending.current.has(key)) return // al in-flight
      pending.current.add(key)

      const existingId = saved.get(key)

      if (existingId !== undefined) {
        // ---- Verwijderen ----
        setSaved((prev) => {
          const next = new Map(prev)
          next.delete(key)
          return next
        })
        fetch(`/api/dashboard/bookmarks/${encodeURIComponent(existingId)}`, {
          method: 'DELETE',
        })
          .then((res) => {
            if (!res.ok) throw new Error('delete failed')
          })
          .catch(() => {
            // Revert
            setSaved((prev) => {
              const next = new Map(prev)
              next.set(key, existingId)
              return next
            })
          })
          .finally(() => pending.current.delete(key))
        return
      }

      // ---- Toevoegen ---- (optimistisch met placeholder-id)
      setSaved((prev) => {
        const next = new Map(prev)
        next.set(key, '') // placeholder tot de POST een echte id teruggeeft
        return next
      })
      fetch('/api/dashboard/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, itemId }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('create failed')
          return (await res.json()) as BookmarkItem
        })
        .then((created) => {
          setSaved((prev) => {
            const next = new Map(prev)
            // Alleen bijwerken als de key nog bestaat (niet net weer verwijderd).
            if (next.has(key)) next.set(key, created.id)
            return next
          })
        })
        .catch(() => {
          setSaved((prev) => {
            const next = new Map(prev)
            next.delete(key)
            return next
          })
        })
        .finally(() => pending.current.delete(key))
    },
    [saved],
  )

  const value = useMemo<BookmarksContextValue>(
    () => ({ isLoading, isSaved, toggleBookmark }),
    [isLoading, isSaved, toggleBookmark],
  )

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
}

// --------------------------------------------------------------------
// Consumer hook
// --------------------------------------------------------------------

const NOOP_VALUE: BookmarksContextValue = {
  isLoading: false,
  isSaved: () => false,
  toggleBookmark: () => {},
}

/**
 * `useBookmarks()` — lees + toggle de bookmark-state.
 *
 * @example
 *   const { isSaved, toggleBookmark } = useBookmarks()
 *   <DetailActions
 *     isSaved={isSaved('articles', articleId)}
 *     onToggleSave={() => toggleBookmark('articles', articleId)}
 *   />
 */
export function useBookmarks(): BookmarksContextValue {
  return useContext(BookmarksContext) ?? NOOP_VALUE
}
