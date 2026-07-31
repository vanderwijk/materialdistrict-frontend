'use client'

/**
 * SearchForm — GET search field for `/search`.
 *
 * Kept as a client component so mobile browsers dismiss the virtual keyboard
 * on submit (blur the input before the browser navigates). Markup and action
 * stay a plain GET form so the page still works without JS.
 */

import { useRef } from 'react'

interface SearchFormProps {
  /** Current query, mirrored into the input as the default value. */
  defaultQuery?: string
}

export function SearchForm({ defaultQuery = '' }: SearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form
      className="srch-form"
      action="/search"
      method="get"
      role="search"
      onSubmit={() => {
        inputRef.current?.blur()
      }}
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
          defaultValue={defaultQuery}
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
