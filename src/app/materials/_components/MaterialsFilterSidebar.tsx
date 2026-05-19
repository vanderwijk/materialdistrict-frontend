'use client'

/**
 * MaterialsFilterSidebar — filter-sidebar voor `/materials`
 *
 * Sessie 6 (19-05-2026) — volledige rewrite. Tot sessie 5 was dit een
 * dunne URL-state-bridge rond de generieke `<FilterSidebar>`. Die kon
 * de mockup-structuur niet aan (3-laagse nesting, Application-cascade,
 * properties-separator). Nu is dit een first-class component voor
 * `/materials`. De generieke FilterSidebar blijft bestaan voor andere
 * overzichts-pagina's (/brands, /articles, etc.) met platte filtering.
 *
 * Layout volgt de mockup-structuur (zie `MaterialDistrict_MockUp_DEF.html`
 * r.5408-5547):
 *
 *   ┌────────────────────────────────────┐
 *   │  Filters · Save · Clear N          │  ← navy header
 *   ├────────────────────────────────────┤
 *   │  ▼ Material type        (1)        │  ← single-select radio
 *   │  ▼ Application                     │  ← UI-placeholder (sessie 6)
 *   ├──── PROPERTIES ────────────────────┤  ← non-clickable separator
 *   │  ▼ Sensorial            (2)        │  ← property-group accordion
 *   │     ▼ Glossiness        (1)        │  ← facet sub-accordion
 *   │        ☑ Matte               1.842 │  ← option
 *   │        ☐ Glossy                298 │
 *   │     ▶ Translucence                 │
 *   │  ▶ Technical                       │
 *   │  ▶ Environmental                   │  ← rendert pas zodra Johan
 *   │  ▶ Content composition             │     de 12 facets importeert
 *   └────────────────────────────────────┘
 *
 * Drie niveaus:
 *  1. Property-groep (Sensorial / Technical / Environmental / Content)
 *  2. Facet binnen die groep (Glossiness / Hardness / ...)
 *  3. Optie binnen die facet (Matte / Satin / ...)
 *
 * Material type en Application staan apart bovenaan, niet onder
 * "Properties". Application is in sessie 6 nog een UI-placeholder —
 * werkt zodra Johan de Application-facet aan WP-zijde levert
 * (zie open-issues — vraag aan Johan).
 *
 * Optimistische UI:
 *  - Klik op een optie flipt visueel direct (`localSelection` state)
 *  - Parallel start een `useTransition` met `router.push()`
 *  - Tijdens `isPending` krijgt de grid een dim-class via context
 *  - Counts blijven van server (geen client-side gokken)
 *
 * Mobile:
 *  - Trigger-knop (`<MaterialsFilterTrigger>`) staat buiten de sidebar,
 *    in een eigen rij in `page.tsx` boven de grid. Voorkomt de bug uit
 *    sessie 5 waarbij de drawer onder de eigen backdrop verdween.
 *  - Drawer-state leeft in een Context zodat trigger en sidebar elkaar
 *    kunnen vinden zonder prop-drilling.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconCheck,
  IconChevronDown,
  IconClose,
  IconFilter,
  IconSaveSearch,
  InsiderIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils/cn'
import {
  MATERIAL_FACET_GROUP_LABELS,
  MATERIAL_FILTER_FACETS,
  type MaterialFacetGroup,
  type MaterialFacetName,
} from '@/types/facetwp'
import type { MaterialFilterSection } from '@/lib/api/mappers'

// ============================================================
// Mobile drawer context — shared between trigger and sidebar
// ============================================================

interface MobileFilterContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  /**
   * Aantal actieve filters — gebruikt door de trigger-knop ("Filters (3)").
   * De sidebar zet dit; de trigger leest het. Voorkomt dat we de selectie
   * via twee paden moeten doorgeven.
   */
  activeCount: number
  setActiveCount: (n: number) => void
  /**
   * True wanneer de filter-router-transition loopt. Gebruikt door
   * `<MaterialsGridDimWrapper>` om de grid subtiel te dimmen tijdens
   * optimistic UI. Sidebar zet dit; consumers lezen het af.
   */
  isPending: boolean
  setIsPending: (b: boolean) => void
}

const MobileFilterContext = createContext<MobileFilterContextValue | null>(null)

/**
 * Wikkel de page (boven `<MaterialsFilterTrigger>` en
 * `<MaterialsFilterSidebar>`) hierin om drawer-state te delen.
 */
export function MaterialsFilterProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  // Body-scroll lock terwijl drawer open is
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  // ESC sluit de drawer
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  return (
    <MobileFilterContext.Provider
      value={{ isOpen, open, close, activeCount, setActiveCount, isPending, setIsPending }}
    >
      {children}
    </MobileFilterContext.Provider>
  )
}

function useMobileFilter(): MobileFilterContextValue {
  const ctx = useContext(MobileFilterContext)
  if (!ctx) {
    // Loose-mode fallback voor isolated rendering (style-guide preview).
    // Trigger doet niets, sidebar gedraagt zich alsof drawer gesloten is.
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
      activeCount: 0,
      setActiveCount: () => {},
      isPending: false,
      setIsPending: () => {},
    }
  }
  return ctx
}

// ============================================================
// Mobile trigger — staat in page-header rij, buiten de sidebar
// ============================================================

/**
 * Knop "Filters (N)" die op mobile de drawer opent. Op desktop verborgen
 * (display:none via CSS-media-query). Plaats deze in `page.tsx` ergens
 * boven `<MaterialsFilterSidebar>` — eigen rij onder de page-header is
 * de aanbevolen positie.
 */
export function MaterialsFilterTrigger() {
  const { open, activeCount } = useMobileFilter()
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

// ============================================================
// Props
// ============================================================

export interface MaterialsFilterSidebarProps {
  /** Filter-secties uit `listMaterialsWithFacets()`. */
  sections: MaterialFilterSection[]
  /** Volledige zoekquery uit de URL (excl. paging). Voor "Clear all"-behoud. */
  preservedParams?: { q?: string; sort?: string }
  /**
   * Of de gebruiker een Insider-member is. Bepaalt of de Save-search-knop
   * een Insider-mark toont voor non-members. Default: false.
   *
   * De callback `onSaveSearch` is bewust niet geïmplementeerd in sessie 6
   * — saved-search-functie komt in een latere sessie zodra Johan een
   * saved-API levert.
   */
  isMember?: boolean
}

// ============================================================
// Component
// ============================================================

const FILTER_KEYS = new Set<string>(MATERIAL_FILTER_FACETS)

/**
 * Volgorde van de property-groepen onder de "PROPERTIES"-separator.
 * Komt overeen met de mockup-volgorde.
 */
const PROPERTY_GROUP_ORDER: readonly MaterialFacetGroup[] = [
  'sensorial',
  'technical',
  'environmental',
  'content',
] as const

export function MaterialsFilterSidebar({
  sections,
  preservedParams,
  isMember = false,
}: MaterialsFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const { isOpen: mobileOpen, close: closeMobile, setActiveCount, setIsPending } = useMobileFilter()

  // Sync transition-state naar de Context zodat de grid-wrapper kan dimmen.
  useEffect(() => {
    setIsPending(isPending)
  }, [isPending, setIsPending])

  // --------------------------------------------------------------------
  // Selection state — geserialiseerde URL-state is leidend, lokaal voor
  // optimistic flip. Sync zodra de server een nieuwe `sections` levert.
  // --------------------------------------------------------------------

  type Selection = Partial<Record<MaterialFacetName, string[]>>

  const serverSelection: Selection = useMemo(() => {
    const out: Selection = {}
    for (const s of sections) {
      if (s.selected.length > 0) out[s.key] = s.selected
    }
    return out
  }, [sections])

  const [localSelection, setLocalSelection] = useState<Selection>(serverSelection)

  // Sync naar server-state wanneer die binnenkomt (= als transition klaar is)
  useEffect(() => {
    setLocalSelection(serverSelection)
  }, [serverSelection])

  const totalSelected = Object.values(localSelection).reduce(
    (sum, arr) => sum + (arr?.length ?? 0),
    0,
  )

  // Synchroniseer active-count naar de mobile trigger
  useEffect(() => {
    setActiveCount(totalSelected)
  }, [totalSelected, setActiveCount])

  // --------------------------------------------------------------------
  // Section open/close state
  // --------------------------------------------------------------------

  // Niveau 1: property-groep accordion (Sensorial / Technical / ...)
  const [openGroups, setOpenGroups] = useState<Set<MaterialFacetGroup>>(new Set())

  // Niveau 2: facet sub-accordion (Glossiness / Hardness / ...)
  const [openFacets, setOpenFacets] = useState<Set<MaterialFacetName>>(() => {
    const open = new Set<MaterialFacetName>()
    for (const s of sections) {
      if (s.defaultOpen) open.add(s.key)
    }
    return open
  })

  // Application sectie (UI-placeholder)
  const [appOpen, setAppOpen] = useState(false)

  function toggleGroup(group: MaterialFacetGroup) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  function toggleFacet(facet: MaterialFacetName) {
    setOpenFacets((prev) => {
      const next = new Set(prev)
      if (next.has(facet)) next.delete(facet)
      else next.add(facet)
      return next
    })
  }

  // --------------------------------------------------------------------
  // URL-building
  // --------------------------------------------------------------------

  const buildUrl = useCallback(
    (next: Selection): string => {
      const params = new URLSearchParams()
      for (const key of Object.keys(next) as MaterialFacetName[]) {
        if (!FILTER_KEYS.has(key)) continue
        const values = next[key]
        if (!values || values.length === 0) continue
        params.set(key, values.join(','))
      }
      if (preservedParams?.q) params.set('q', preservedParams.q)
      if (preservedParams?.sort) params.set('sort', preservedParams.sort)
      const query = params.toString()
      return query ? `${pathname}?${query}` : pathname
    },
    [pathname, preservedParams],
  )

  const navigate = useCallback(
    (next: Selection) => {
      startTransition(() => {
        router.push(buildUrl(next), { scroll: false })
      })
    },
    [buildUrl, router],
  )

  // --------------------------------------------------------------------
  // Option toggle — optimistic flip + transition
  // --------------------------------------------------------------------

  function toggleOption(section: MaterialFilterSection, value: string) {
    const current = localSelection[section.key] ?? []
    const isSingle = section.selectMode === 'single'

    let nextValues: string[]
    if (isSingle) {
      nextValues = current.includes(value) ? [] : [value]
    } else {
      nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    }

    const nextSelection: Selection = { ...localSelection }
    if (nextValues.length === 0) delete nextSelection[section.key]
    else nextSelection[section.key] = nextValues

    // Optimistic flip onmiddellijk
    setLocalSelection(nextSelection)
    // Navigeer in een transition
    navigate(nextSelection)
  }

  function clearAll() {
    setLocalSelection({})
    navigate({})
  }

  // --------------------------------------------------------------------
  // Section-by-group lookup
  // --------------------------------------------------------------------

  const categorySection = useMemo(
    () => sections.find((s) => s.group === 'category') ?? null,
    [sections],
  )

  const sectionsByGroup = useMemo(() => {
    const map = new Map<MaterialFacetGroup, MaterialFilterSection[]>()
    for (const s of sections) {
      if (s.group === 'category') continue
      const list = map.get(s.group) ?? []
      list.push(s)
      map.set(s.group, list)
    }
    return map
  }, [sections])

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------

  return (
    <>
      {mobileOpen && (
        <div
          className="mob-filter-backdrop open"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn('uf-sidebar', mobileOpen && 'mob-open', isPending && 'is-pending')}
        aria-label="Filters"
        data-pending={isPending ? 'true' : undefined}
      >
        {/* Header */}
        <div className="uf-header">
          <span className="uf-header-title">Filters</span>
          <div className="uf-header-actions">
            <button
              type="button"
              className="uf-header-save"
              onClick={() => {
                /* TODO sessie 8: saved-search-feature */
              }}
              title="Save this search"
              disabled
            >
              <IconSaveSearch size={10} strokeWidth={2.5} />
              Save
              {!isMember && <InsiderIcon size={12} />}
            </button>
            {totalSelected > 0 && (
              <button type="button" className="uf-header-clear" onClick={clearAll}>
                Clear {totalSelected}
              </button>
            )}
            <button
              type="button"
              className="uf-header-clear uf-header-close"
              onClick={closeMobile}
              aria-label="Close filters"
            >
              <IconClose size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Material type — single-select, bovenaan */}
        {categorySection && (
          <FacetSection
            section={categorySection}
            isOpen={openFacets.has(categorySection.key)}
            onToggle={() => toggleFacet(categorySection.key)}
            selected={localSelection[categorySection.key] ?? []}
            onOptionToggle={(v) => toggleOption(categorySection, v)}
          />
        )}

        {/* Application — UI-placeholder, wacht op WP-facet */}
        <ApplicationPlaceholder
          isOpen={appOpen}
          onToggle={() => setAppOpen((v) => !v)}
        />

        {/* Properties separator */}
        <div className="uf-properties-separator" role="presentation">
          <span>Properties</span>
        </div>

        {/* Property groups */}
        {PROPERTY_GROUP_ORDER.map((group) => {
          const groupSections = sectionsByGroup.get(group) ?? []
          // Groep niet renderen als er geen sub-facets beschikbaar zijn.
          // Treedt op voor environmental/content totdat Johan importeert.
          if (groupSections.length === 0) return null

          const groupActiveCount = groupSections.reduce(
            (sum, s) => sum + (localSelection[s.key]?.length ?? 0),
            0,
          )
          const isGroupOpen = openGroups.has(group)

          return (
            <div className="uf-group" key={group}>
              <button
                type="button"
                className="uf-group-toggle"
                onClick={() => toggleGroup(group)}
                aria-expanded={isGroupOpen}
                aria-controls={`uf-group-${group}`}
              >
                <span className="uf-group-title">
                  {MATERIAL_FACET_GROUP_LABELS[group]}
                  {groupActiveCount > 0 && (
                    <span className="filter-count is-active is-inline">
                      {groupActiveCount}
                    </span>
                  )}
                </span>
                <IconChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className="uf-chevron"
                  aria-hidden="true"
                />
              </button>

              {isGroupOpen && (
                <div className="uf-group-body" id={`uf-group-${group}`}>
                  {groupSections.map((section) => (
                    <FacetSection
                      key={section.key}
                      section={section}
                      nested
                      isOpen={openFacets.has(section.key)}
                      onToggle={() => toggleFacet(section.key)}
                      selected={localSelection[section.key] ?? []}
                      onOptionToggle={(v) => toggleOption(section, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </aside>
    </>
  )
}

// ============================================================
// FacetSection — één facet (Material type, Glossiness, ...)
// ============================================================

interface FacetSectionProps {
  section: MaterialFilterSection
  /** Of deze sectie binnen een property-groep is genest (extra inspring). */
  nested?: boolean
  isOpen: boolean
  onToggle: () => void
  selected: string[]
  onOptionToggle: (value: string) => void
}

function FacetSection({
  section,
  nested = false,
  isOpen,
  onToggle,
  selected,
  onOptionToggle,
}: FacetSectionProps) {
  const [search, setSearch] = useState('')
  const sectionId = `uf-section-${section.key}`
  const sectionActiveCount = selected.length
  const isSingle = section.selectMode === 'single'

  const visibleOptions = search
    ? section.options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : section.options

  return (
    <div className={cn('uf-section', nested && 'is-nested')}>
      <button
        type="button"
        className="uf-section-toggle"
        onClick={onToggle}
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
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Search ${section.title}`}
            />
          )}

          {visibleOptions.length === 0 ? (
            <div className="t-body-xs">No matches</div>
          ) : (
            visibleOptions.map((option) => {
              const isSelected = selected.includes(option.value)
              const isGhost = option.isGhost && !isSelected
              return (
                <label
                  key={option.value}
                  className={cn(
                    'uf-option',
                    isSelected && 'selected',
                    isGhost && 'is-ghost',
                  )}
                >
                  <input
                    type={isSingle ? 'radio' : 'checkbox'}
                    name={isSingle ? `uf-${section.key}` : undefined}
                    checked={isSelected}
                    onChange={() => onOptionToggle(option.value)}
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
                      <IconCheck size={10} strokeWidth={3} color="white" />
                    )}
                    {isSelected && isSingle && <span className="uf-radio-dot" />}
                  </span>
                  <span className="uf-option-label">{option.label}</span>
                  <span className="uf-option-count">
                    {option.count.toLocaleString('en-US')}
                  </span>
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// ApplicationPlaceholder — sessie 6 UI-placeholder
// ============================================================
//
// De mockup heeft een Application-cascade (Main → Sub → Type → Apply)
// die op een WP-facet "application" zou moeten leunen. Die facet bestaat
// nog niet (zie open-issues). Tot die er is tonen we de sectie wel,
// maar met een "coming soon"-bericht — conform afspraak (vraag 1 in
// pre-flight: tonen met placeholder).
//
// Zodra Johan de Application-facet levert, wordt deze component
// vervangen door een echte cascade-implementatie.

interface ApplicationPlaceholderProps {
  isOpen: boolean
  onToggle: () => void
}

function ApplicationPlaceholder({ isOpen, onToggle }: ApplicationPlaceholderProps) {
  return (
    <div className="uf-section">
      <button
        type="button"
        className="uf-section-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="uf-section-application"
      >
        <span>Application</span>
        <IconChevronDown
          size={12}
          strokeWidth={2}
          className="uf-chevron"
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="uf-section-body" id="uf-section-application">
          <p className="uf-placeholder-note">
            Application filtering is coming soon — the underlying data is being
            prepared on the publisher side.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// MaterialsGridDimWrapper — sessie 6 optimistic dim
// ============================================================
//
// Wrapt het grid + pagination blok in `page.tsx`. Plaatst
// `data-pending="true"` op de wrapper-div wanneer de filter-router-
// transition loopt. CSS in `globals-additions-patch-sessie6.css`
// pakt deze attribute op om de inhoud subtiel te dimmen.
//
// Bewust een eigen klein client-component (niet de hele grid client
// maken). Server-component `page.tsx` blijft schoon.

export function MaterialsGridDimWrapper({ children }: { children: ReactNode }) {
  const { isPending } = useMobileFilter()
  return (
    <div className="ov-grid-wrap" data-pending={isPending ? 'true' : undefined}>
      {children}
    </div>
  )
}

