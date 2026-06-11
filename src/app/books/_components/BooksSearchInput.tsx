'use client'

/**
 * BooksSearchInput — debounced zoek-input voor het books-overzicht.
 *
 * Parallel aan Articles/Talks-SearchInput:
 *  - Initial value uit `?q=` (server-rendered).
 *  - Na 300ms stilte → `?q=` in de URL via router.push (useTransition).
 *  - Reset `?page=` bij wijziging; behoudt overige params (`sort`).
 *  - Clear-knop wist `?q=`.
 *  - Hergebruikt de bestaande `.materials-search`-styling.
 */

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IconClose, IconSearch } from '@/components/ui/icons'
import { useDebouncedValue } from '@/lib/utils/debounce'

export interface BooksSearchInputProps {
  initialValue?: string
  placeholder?: string
  debounceMs?: number
}

export function BooksSearchInput({
  initialValue = '',
  placeholder = 'Search books…',
  debounceMs = 300,
}: BooksSearchInputProps) {
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
      <label className="u-visually-hidden" htmlFor="books-search-input">
        {placeholder}
      </label>
      <span className="materials-search-icon" aria-hidden="true">
        <IconSearch size={14} strokeWidth={2} />
      </span>
      <input
        id="books-search-input"
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
