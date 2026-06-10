'use client'

import { useState, useEffect } from 'react'
import {
  IconChevronDown,
  IconCheck,
  IconClose,
  IconDelete,
  IconFilter,
  IconSaveSearch,
  InsiderIcon,
} from './icons'
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
  /**
   * 'multi' (default) — checkboxes, meerdere waarden tegelijk
   * 'single' — radio-style (ronde indicator), één waarde tegelijk, klik vervangt
   *
   * Conventie uit de mockup: hoofd-categorie filters (zoals "Material type")
   * zijn `single`, attribuut-filters (Sensorial, Technical, etc.) zijn `multi`.
   */
  selectMode?: 'multi' | 'single'
}

export type FilterSelection = Record<string, string[]>

// ============================================================
// Component
// ============================================================

interface FilterSidebarProps {
  sections: FilterSection[]
  /** Geselecteerde waarden, gegroepeerd per section.key. */
  selected: FilterSelection
  /** Callback wanneer een filter wijzigt. */
  onChange: (next: FilterSelection) => void
  /** Callback voor "Clear all" — leegt alle filters. */
  onClearAll?: () => void
  /**
   * Callback voor "Save this search" knop in de filter-header.
   * Aanwezig = knop wordt gerenderd. Afwezig = geen save-knop.
   * Voor non-insider users wordt een Insider-mark naast de knop getoond.
   */
  onSaveSearch?: () => void
  /**
   * Of de gebruiker een Insider-member is. Bepaalt of de save-search knop
   * een Insider-mark toont voor non-members. Default: false.
   */
  isMember?: boolean
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
 * door een dynamische FacetWP-gedreven set via een wrapper-component.
 */
export function FilterSidebar({
  sections,
  selected,
  onChange,
  onClearAll,
  onSaveSearch,
  isMember = false,
  mobileTrigger = true,
  className,
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const open = new Set<string>()
    sections.forEach((s) => {
      if (s.defaultOpen) open.add(s.key)
    })
    return open
  })

  const [sectionSearch, setSectionSearch] = useState<Record<string, string>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

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

  function toggleOption(section: FilterSection, value: string) {
    const current = selected[section.key] ?? []
    const isSingle = section.selectMode === 'single'

    let nextValues: string[]
    if (isSingle) {
      // Single-select: klik op aangevinkt = uitvinken (leeg), anders vervang
      nextValues = current.includes(value) ? [] : [value]
    } else {
      // Multi-select: toggle in/uit de lijst
      nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    }

    const nextSelection = { ...selected }
    if (nextValues.length === 0) delete nextSelection[section.key]
    else nextSelection[section.key] = nextValues
    onChange(nextSelection)
  }

  function handleSectionSearch(key: string, value: string) {
    setSectionSearch((prev) => ({ ...prev, [key]: value }))
  }

  const totalSelected = Object.values(selected).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <>
      {mobileTrigger && (
        <button
          type="button"
          className="mob-filter-trigger btn btn-outline btn-sm"
          onClick={() => setMobileOpen(true)}
        >
          <IconFilter size={14} strokeWidth={2} />
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

      <aside
        className={cn('uf-sidebar', mobileOpen && 'mob-open', className)}
        aria-label="Filters"
      >
        <div className="uf-header">
          <span className="uf-header-title">
            Filters
            {totalSelected > 0 && (
              <span
                className="filter-count is-active is-inline"
                aria-label={`${totalSelected} active filter${totalSelected === 1 ? '' : 's'}`}
              >
                {totalSelected}
              </span>
            )}
          </span>
          <div className="uf-header-actions">
            {onSaveSearch && (
              <button
                type="button"
                className="uf-header-save"
                onClick={onSaveSearch}
                title="Save this search"
                aria-label="Save this search"
              >
                <IconSaveSearch size={13} strokeWidth={2} />
                {!isMember && (
                  <span className="uf-save-insider" aria-hidden="true">
                    <InsiderIcon size={9} />
                  </span>
                )}
              </button>
            )}
            {onClearAll && totalSelected > 0 && (
              <button
                type="button"
                className="uf-header-clear"
                onClick={onClearAll}
                title="Clear all filters"
                aria-label={`Clear all ${totalSelected} filters`}
              >
                <IconDelete size={13} strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              className="uf-header-clear u-mobile-only"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
            >
              <IconClose size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {sections.map((section) => {
          const isOpen = openSections.has(section.key)
          const search = sectionSearch[section.key] ?? ''
          const selectedValues = selected[section.key] ?? []
          const sectionId = `uf-section-${section.key}`
          const sectionActiveCount = selectedValues.length
          const isSingle = section.selectMode === 'single'

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
                <span>
                  {section.title}
                  {sectionActiveCount > 0 && (
                    <span
                      className="filter-count is-active is-inline"
                      aria-label={`${sectionActiveCount} active filter${sectionActiveCount === 1 ? '' : 's'}`}
                    >
                      {sectionActiveCount}
                    </span>
                  )}
                </span>
                <IconChevronDown
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
                    <div className="t-body-xs u-py-1">No matches</div>
                  ) : (
                    visibleOptions.map((option) => {
                      const isSelected = selectedValues.includes(option.value)
                      return (
                        <label
                          key={option.value}
                          className={cn('uf-option', isSelected && 'selected')}
                        >
                          <input
                            type={isSingle ? 'radio' : 'checkbox'}
                            name={isSingle ? `uf-${section.key}` : undefined}
                            checked={isSelected}
                            onChange={() => toggleOption(section, option.value)}
                            className="u-sr-only"
                            aria-label={option.label}
                          />
                          <span
                            className={cn(
                              'uf-checkbox',
                              isSingle && 'is-radio',
                              isSelected && 'checked',
                            )}
                            aria-hidden="true"
                          >
                            {isSelected && !isSingle && (
                              <IconCheck size={10} strokeWidth={3} />
                            )}
                          </span>
                          <span className="uf-option-label">{option.label}</span>
                          {option.count !== undefined && (
                            <span className="uf-option-count">
                              {option.count.toLocaleString()}
                            </span>
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
