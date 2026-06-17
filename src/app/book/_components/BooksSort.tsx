'use client'

/**
 * BooksSort — sorteerkeuze voor het books-overzicht (Newest / Title A–Z).
 *
 * Vertaalt de keuze naar `?sort=`, reset `?page=` en behoudt overige params
 * (`q`). `newest` is de default en laat `?sort=` weg (schoner canonical).
 * De page mapt `sort` → `orderby`/`order` op de fetch.
 */

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type BooksSortValue = 'newest' | 'title'

export interface BooksSortProps {
  value: BooksSortValue
}

export function BooksSort({ value }: BooksSortProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as BooksSortValue

    const params = new URLSearchParams(currentSearchParams?.toString() ?? '')
    if (next === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', next)
    }
    params.delete('page')

    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname

    startTransition(() => {
      router.push(url, { scroll: false })
    })
  }

  return (
    <>
      <label className="u-visually-hidden" htmlFor="books-sort">
        Sort books
      </label>
      <select
        id="books-sort"
        className="books-sort"
        value={value}
        onChange={handleChange}
      >
        <option value="newest">Newest</option>
        <option value="title">Title A–Z</option>
      </select>
    </>
  )
}
