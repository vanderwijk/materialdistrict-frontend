'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Check, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Types
// ============================================================

export interface FilterOption {
  value: string
  label: string
  /** Aantal resultaten voor deze optie. Optioneel. */
  count?: number
}

export interface FilterSection {
  /** Sleutel waaronder de geselecteerde waarden in `selected` staan. */
  key: string
  title: string
  options: FilterOption[]
  /** Toon zoekveld binnen deze sectie. */
  searchable?: boolean
  /** Sectie standaard open. Default: false. */
  defaultOpen?: boolean
}

export type FilterSelection = Record<string, string[]>

// ============================================================
// Component
// ============================================================

interface FilterSidebarProps {
  sections: FilterSection[]
  /** Geselecteerde waarden, gegroepeerd per section.key. */
  selected: FilterSelection
  /** Callback wanneer een checkbox wijzigt. */
  onChange: (next: FilterSelection) => void
  /** Callback voor "Clear all" — leegt alle filters. */
  onClearAll?: () => void
  /**
   * Of de mobile-trigger-knop ("Filter (3)") boven de sidebar getoond moet worden.
   * Default: true. Op desktop heeft deze geen effect (verborgen via CSS).
   */
  mobileTrigger?: boolean
  className?: string
}

/**
 * FilterSidebar — universele filter-sidebar voor overzichtspagina's.
 *
 * UI-only voor sessie 3. Sectie 4 vervangt de statische `sections`-prop
 * door een dynamische FacetWP-gedreven set.
 *
 * @example
 *   const [filters, setFilters] = useState<FilterSelection>({})
 *
 *   <FilterSidebar
 *     sections={[
 *       {
 *         key: 'material_type',
 *         title: 'Material type',
 *         defaultOpen: true,
 *         searchable: true,
 *         options: [
 *           { value: 'wood', label: 'Wood', count: 932 },
 *           { value: 'natural-stones', label: 'Natural stones', count: 907 },
 *         ],
 *       },
 *     ]}
 *     selected={filters}
 *     onChange={setFilters}
 *     onClearAll={() => setFilters({})}
 *   />
 */
export function FilterSidebar({
  sections,
  selected,
  onChange,
  onClearAll,
  mobileTrigger = true,
  className,
}: FilterSidebarProps) {
  // Welke secties zijn open — beheerd op basis van defaultOpen + user toggles
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const open = new Set<string>()
    sections.forEach((s) => {
      if (s.defaultOpen) open.add(s.key)
    })
    return open
  })

  // Per sectie een eigen search-string (optioneel)
  const [sectionSearch, setSectionSearch] = useState<Record<string, string>>({})

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lock body scroll wanneer mobile drawer open is
  useEffect(() => {
    if (!mobileOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileOpen])

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleOption(sectionKey: string, value: string) {
    const current = selected[sectionKey] ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    const nextSelection = { ...selected }
    if (next.length === 0) delete nextSelection[sectionKey]
    else nextSelection[sectionKey] = next
    onChange(nextSelection)
  }

  function handleSectionSearch(key: string, value: string) {
    setSectionSearch((prev) => ({ ...prev, [key]: value }))
  }

  // Tel het totaal aantal actieve filters
  const totalSelected = Object.values(selected).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <>
      {mobileTrigger && (
        <button
          type="button"
          className="mob-filter-trigger btn btn-outline btn-sm"
          onClick={() => setMobileOpen(true)}
        >
          <SlidersHorizontal size={14} strokeWidth={2} />
          Filters
          {totalSelected > 0 && ` (${totalSelected})`}
        </button>
      )}

      {mobileOpen && (
        <div
          className="mob-filter-backdrop open"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={cn('uf-sidebar', mobileOpen && 'mob-open', className)} aria-label="Filters">
        <div className="uf-header">
          <span className="uf-header-title">Filters</span>
          {onClearAll && totalSelected > 0 && (
            <button type="button" className="uf-header-clear" onClick={onClearAll}>
              Clear
            </button>
          )}
          <button
            type="button"
            className="uf-header-clear"
            onClick={() => setMobileOpen(false)}
            style={{ marginLeft: '8px', display: 'none' }}
            data-mobile-only
            aria-label="Close filters"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>

        {sections.map((section) => {
          const isOpen = openSections.has(section.key)
          const search = sectionSearch[section.key] ?? ''
          const selectedValues = selected[section.key] ?? []
          const sectionId = `uf-section-${section.key}`

          // Filter options als er search is
          const visibleOptions = search
            ? section.options.filter((o) =>
                o.label.toLowerCase().includes(search.toLowerCase()),
              )
            : section.options

          return (
            <div className="uf-section" key={section.key}>
              <button
                type="button"
                className="uf-section-toggle"
                onClick={() => toggleSection(section.key)}
                aria-expanded={isOpen}
                aria-controls={sectionId}
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={12}
                  strokeWidth={2}
                  className="uf-chevron"
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="uf-section-body" id={sectionId}>
                  {section.searchable && (
                    <input
                      type="text"
                      className="uf-search"
                      placeholder="Search…"
                      value={search}
                      onChange={(e) => handleSectionSearch(section.key, e.target.value)}
                      aria-label={`Search ${section.title}`}
                    />
                  )}

                  {visibleOptions.length === 0 ? (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-hint)',
                        padding: '4px 0',
                      }}
                    >
                      No matches
                    </div>
                  ) : (
                    visibleOptions.map((option) => {
                      const isSelected = selectedValues.includes(option.value)
                      return (
                        <label
                          key={option.value}
                          className={cn('uf-option', isSelected && 'selected')}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOption(section.key, option.value)}
                            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                            aria-label={option.label}
                          />
                          <span
                            className={cn('uf-checkbox', isSelected && 'checked')}
                            aria-hidden="true"
                          >
                            {isSelected && (
                              <Check size={10} strokeWidth={3} color="white" />
                            )}
                          </span>
                          <span className="uf-option-label">{option.label}</span>
                          {option.count !== undefined && (
                            <span className="uf-option-count">{option.count}</span>
                          )}
                        </label>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </aside>
    </>
  )
}
