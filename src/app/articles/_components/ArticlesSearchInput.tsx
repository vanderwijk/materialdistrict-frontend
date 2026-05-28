'use client'

/**
 * ArticlesSearchInput — debounced zoek-input voor de articles-overzichtspage.
 *
 * Sessie 6. Parallel aan Brands/MaterialsSearchInput:
 *  - Initial value uit `?q=` (server-rendered).
 *  - Na 300ms stilte → `?q=` in de URL via router.push (useTransition).
 *  - Reset `?page=` bij wijziging.
 *  - Behoudt overige searchParams (story_type-filter).
 *  - Clear-knop wist `?q=`.
 */

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IconClose, IconSearch } from '@/components/ui/icons'
import { useDebouncedValue } from '@/lib/utils/debounce'

export interface ArticlesSearchInputProps {
  initialValue?: string
  placeholder?: string
  debounceMs?: number
}

export function ArticlesSearchInput({
  initialValue = '',
  placeholder = 'Search stories…',
  debounceMs = 300,
}: ArticlesSearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const [value, setValue] = useState(initialValue)
  const debounced = useDebouncedValue(value, debounceMs)
  const lastPushedRef = useRef(initialValue)

  useEffect(() => {
    setValue(initialValue)
    lastPushedRef.current = initialValue
  }, [initialValue])

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
    params.delete('page')

    lastPushedRef.current = debounced

    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname

    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }, [debounced, pathname, router])

  const handleClear = () => setValue('')

  return (
    <div className="materials-search">
      <label className="u-visually-hidden" htmlFor="articles-search-input">
        {placeholder}
      </label>
      <span className="materials-search-icon" aria-hidden="true">
        <IconSearch size={14} strokeWidth={2} />
      </span>
      <input
        id="articles-search-input"
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
