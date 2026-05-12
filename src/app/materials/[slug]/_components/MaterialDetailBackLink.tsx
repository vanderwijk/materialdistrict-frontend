'use client'

/**
 * MaterialDetailBackLink
 * ----------------------------------------------------------------------
 * Vervangt de generieke "Back to Materials" link in de detail-header
 * door één die — als context aanwezig is — terug navigeert naar het
 * overzicht met dezelfde filters, search, sort en pagina actief.
 *
 * Geen context → fallback naar `/materials` (kale lijst).
 *
 * SSR-veiligheid: tijdens de eerste render rendert deze component
 * `/materials` (statisch, om hydration mismatch te voorkomen). Na
 * hydratie wisselt hij naar de context-href.
 */

import Link from 'next/link'
import { useMaterialsContext } from '@/lib/hooks/useMaterialsContext'

export function MaterialDetailBackLink() {
  const { context, ready } = useMaterialsContext()

  // Tot we gehydrateerd zijn: kale link. Voorkomt mismatch.
  const href =
    ready && context && context.queryString
      ? `/materials?${context.queryString}`
      : '/materials'

  return (
    <Link href={href} className="detail-header-back">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back to Materials
    </Link>
  )
}
