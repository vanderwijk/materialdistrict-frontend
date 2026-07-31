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

interface SearchFormProps {
  /** Current query from the URL (`?q=`). */
  defaultQuery?: string
}

export function SearchForm({ defaultQuery = '' }: SearchFormProps) {
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

    const href = `/search?q=${encodeURIComponent(query)}`
    router.push(href)
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
        <button type="submit" className="btn btn-primary srch-submit">
          Search
        </button>
      </div>
    </form>
  )
}
