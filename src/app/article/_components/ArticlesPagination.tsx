'use client'

/**
 * ArticlesPagination — URL-state-bridge tussen de generieke `<Pagination>`
 * (callback-based) en de URL-driven articles-overzichtspage.
 *
 * Sessie 6. Parallel aan Brands/MaterialsPagination: vertaalt
 * `onPageChange(n)` naar router.push met `?page=N`, behoudt overige
 * searchParams (q, story_type), en haalt pagina 1 expliciet uit de URL
 * (schoner canonical).
 */

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/ui'

export interface ArticlesPaginationProps {
  currentPage: number
  totalPages: number
}

export function ArticlesPagination({
  currentPage,
  totalPages,
}: ArticlesPaginationProps) {
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
