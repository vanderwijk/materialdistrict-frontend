'use client'

/**
 * MaterialsSearchInput — debounced zoek-input voor de materials-page.
 *
 * Sessie 4 batch 3.
 *
 * Gedrag:
 *  - Initial value uit `?q=` searchParam (server-rendered).
 *  - User typt → na 300ms stilte wordt `?q=` in de URL bijgewerkt via
 *    `router.push()`. `useTransition` voor non-blocking navigation.
 *  - Reset `?page=` naar 1 bij elke wijziging (anders kan een nieuwe query
 *    op een hogere pagina blijven hangen).
 *  - Behoudt alle andere searchParams (filters, sort).
 *  - Clear-knop (×) verschijnt wanneer er tekst staat; klik wist `?q=`.
 *
 * Visueel:
 *  - Gebruikt `.channel-search`-klassen uit `globals.css` voor consistente
 *    styling met de ChannelBar-search (toen die nog actief was).
 *  - Geen breedte forceren — past zich aan de page-header-grid aan.
 *
 * A11y:
 *  - `<label className="u-visually-hidden">` voor screen readers
 *  - Search-icoon `aria-hidden`
 *  - Clear-knop heeft expliciete `aria-label`
 */

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IconClose, IconSearch } from '@/components/ui/icons'
import { useDebouncedValue } from '@/lib/utils/debounce'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialsSearchInputProps {
  /** Initial value (vanuit `?q=` searchParam, server-rendered). */
  initialValue?: string
  /** Placeholder. Default: "Search materials…". */
  placeholder?: string
  /** Debounce-delay in ms. Default: 300. */
  debounceMs?: number
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialsSearchInput({
  initialValue = '',
  placeholder = 'Search materials…',
  debounceMs = 300,
}: MaterialsSearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const [value, setValue] = useState(initialValue)
  const debounced = useDebouncedValue(value, debounceMs)

  // Track de laatste waarde die naar de URL is geschreven, om duplicate
  // pushes te vermijden tijdens de initial render of bij back-nav.
  const lastPushedRef = useRef(initialValue)

  // Sync initialValue when it changes (e.g. browser back/forward to a
  // different ?q= state)
  useEffect(() => {
    setValue(initialValue)
    lastPushedRef.current = initialValue
  }, [initialValue])

  // Push to URL whenever debounced value changes
  useEffect(() => {
    if (debounced === lastPushedRef.current) return

    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : '',
    )
    if (debounced.trim().length > 0) {
      params.set('q', debounced.trim())
    } else {
      params.delete('q')
    }
    // Reset paging on search change
    params.delete('page')

    lastPushedRef.current = debounced

    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname

    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }, [debounced, pathname, router])

  const handleClear = () => {
    setValue('')
  }

  return (
    <div className="materials-search">
      <label className="u-visually-hidden" htmlFor="materials-search-input">
        {placeholder}
      </label>
      <span className="materials-search-icon" aria-hidden="true">
        <IconSearch size={14} strokeWidth={2} />
      </span>
      <input
        id="materials-search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="materials-search-input"
        autoComplete="off"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="materials-search-clear"
          aria-label="Clear search"
        >
          <IconClose size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
