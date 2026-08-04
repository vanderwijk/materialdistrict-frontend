'use client'

/**
 * ArticlesMobileFilters — mobiele Filters-drawer voor /article.
 *
 * Op desktop: kinderen (story-type-filter + CTA's) in de normale sidebar.
 * Op mobile: zelfde patroon als Materials — compacte "Filters"-knop in
 * `.ov-filter-trigger-row`, inhoud in een linker drawer.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { IconClose, IconFilter } from '@/components/ui/icons'
import { cn } from '@/lib/utils/cn'

interface ArticlesMobileFilterContextValue {
  open: () => void
  close: () => void
  isOpen: boolean
  activeCount: number
}

const ArticlesMobileFilterContext =
  createContext<ArticlesMobileFilterContextValue | null>(null)

export function ArticlesMobileFilterProvider({
  children,
  activeCount = 0,
}: {
  children: ReactNode
  /** Aantal actieve filters (nu: 1 als story_type gezet is). */
  activeCount?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <ArticlesMobileFilterContext.Provider
      value={{ open, close, isOpen, activeCount }}
    >
      {children}
    </ArticlesMobileFilterContext.Provider>
  )
}

function useArticlesMobileFilter(): ArticlesMobileFilterContextValue {
  const ctx = useContext(ArticlesMobileFilterContext)
  if (!ctx) {
    throw new Error(
      'useArticlesMobileFilter must be used within ArticlesMobileFilterProvider',
    )
  }
  return ctx
}

/** Compacte trigger — alleen zichtbaar op mobile via `.ov-filter-trigger-row`. */
export function ArticlesFilterTrigger() {
  const { open, activeCount } = useArticlesMobileFilter()
  return (
    <button
      type="button"
      className="mob-filter-trigger btn btn-outline btn-sm"
      onClick={open}
    >
      <IconFilter size={14} strokeWidth={2} />
      Filters
      {activeCount > 0 && ` (${activeCount})`}
    </button>
  )
}

/** Sidebar-kolom die op mobile als drawer opent (desktop ongewijzigd). */
export function ArticlesMobileSidebar({ children }: { children: ReactNode }) {
  const { isOpen, close, activeCount } = useArticlesMobileFilter()

  return (
    <>
      {isOpen && (
        <div
          className="mob-filter-backdrop open"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'articles-sidebar-col',
          isOpen && 'articles-sidebar-drawer-open',
        )}
        aria-label="Filters"
      >
        <div className="articles-drawer-header">
          <span className="uf-header-title">
            Filters{activeCount > 0 ? ':' : ''}
            {activeCount > 0 && (
              <span
                className="filter-count is-active is-inline"
                aria-label={`${activeCount} active filter${activeCount === 1 ? '' : 's'}`}
              >
                {activeCount}
              </span>
            )}
          </span>
          <button
            type="button"
            className="uf-header-close"
            onClick={close}
            aria-label="Close filters"
          >
            <IconClose size={12} strokeWidth={2} />
          </button>
        </div>
        {children}
      </aside>
    </>
  )
}
