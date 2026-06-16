'use client'

/**
 * BooksPagination — URL-state-bridge tussen de generieke `<Pagination>`
 * (callback-based) en het URL-gedreven books-overzicht.
 *
 * Parallel aan Talks/Articles-Pagination: vertaalt `onPageChange(n)` naar
 * router.push met `?page=N`, behoudt overige searchParams (q, sort), en haalt
 * pagina 1 expliciet uit de URL (schoner canonical).
 */

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/ui'

export interface BooksPaginationProps {
  currentPage: number
  totalPages: number
}

export function BooksPagination({
  currentPage,
  totalPages,
}: BooksPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const handlePageChange = (next: number) => {
    if (next === currentPage) return

    const params = new URLSearchParams(currentSearchParams?.toString() ?? '')
    if (next <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(next))
    }

    const qs = params.toString()
    const url = qs ? `${pathname}?${qs}` : pathname

    startTransition(() => {
      router.push(url)
    })
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
