'use client'

/**
 * MaterialsPagination — URL-state-bridge tussen de bestaande generieke
 * `<Pagination>` (callback-based) en de URL-driven materials-page.
 *
 * Sessie 4 batch 3.
 *
 * Vertaalt `onPageChange(n)` naar `router.push()` met `?page=N`, en
 * behoudt alle andere searchParams (filters, q, sort).
 *
 * Pagina 1 wordt expliciet uit de URL gehaald (schoner, voorkomt
 * `/materials?page=1` als canonical URL).
 *
 * Scroll-naar-top na page-change is wenselijk hier (anders zit de user
 * onderaan de vorige page en mist de nieuwe content). Maar we
 * gebruiken `scroll: true` (default) i.p.v. handmatige `scrollTo` —
 * Next.js handelt het correct af.
 */

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Pagination } from '@/components/ui'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialsPaginationProps {
  /** Huidige pagina (1-based). */
  currentPage: number
  /** Totaal aantal pagina's. */
  totalPages: number
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialsPagination({
  currentPage,
  totalPages,
}: MaterialsPaginationProps) {
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
      // Scroll to top — user verwacht "nieuwe pagina = bovenaan"
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
