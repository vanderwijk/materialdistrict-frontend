'use client'

/**
 * SearchForm — search field for `/search`.
 *
 * Uses client navigation so a new query from this form (or a header search
 * that lands here) always refreshes results. Blurs the input on submit and
 * whenever the URL query changes so mobile keyboards dismiss.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchResultType } from '@/lib/api/search'

interface SearchFormProps {
  /** Current query from the URL (`?q=`). */
  defaultQuery?: string
  /** Active type filter from the URL (`?type=`). Preserved on submit. */
  type?: SearchResultType
}

export function SearchForm({ defaultQuery = '', type }: SearchFormProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultQuery)

  // Sync when the URL query changes (e.g. header search while already on /search).
  useEffect(() => {
    setValue(defaultQuery)
    inputRef.current?.blur()
    if (
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.matches('input, textarea')
    ) {
      document.activeElement.blur()
    }
  }, [defaultQuery])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    inputRef.current?.blur()

    const query = value.trim()
    if (!query) {
      router.push('/search')
      router.refresh()
      return
    }

    const params = new URLSearchParams({ q: query })
    if (type) params.set('type', type)
    router.push(`/search?${params.toString()}`)
    router.refresh()
  }

  return (
    <form
      className="srch-form"
      action="/search"
      method="get"
      role="search"
      onSubmit={handleSubmit}
    >
      <label className="srch-form-label" htmlFor="srch-q">
        Search MaterialDistrict
      </label>
      <div className="srch-form-row">
        <input
          ref={inputRef}
          id="srch-q"
          className="srch-input"
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search materials, stories, brands, events and talks"
          autoComplete="off"
          enterKeyHint="search"
        />
        {type ? <input type="hidden" name="type" value={type} /> : null}
        <button type="submit" className="btn btn-primary srch-submit">
          Search
        </button>
      </div>
    </form>
  )
}
