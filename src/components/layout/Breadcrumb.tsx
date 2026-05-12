import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface BreadcrumbItem {
  label: ReactNode
  /** Aanwezig = clickable link. Afwezig = plain text (typisch voor het laatste item). */
  href?: string
}

interface BreadcrumbProps {
  /** Pad-segmenten van home naar huidige pagina. Het laatste item is het huidige (geen link). */
  items: BreadcrumbItem[]
  /** Toon Home als eerste item automatisch (default true). */
  showHome?: boolean
  /** Custom separator. Default: "/". Kan ook een ReactNode zijn voor een SVG-icoon. */
  separator?: ReactNode
  className?: string
  /** A11y label voor de nav. Default: "Breadcrumb". */
  ariaLabel?: string
}

/**
 * Breadcrumb navigatie — uit globals.css §20.
 *
 * @example
 *   <Breadcrumb items={[
 *     { label: 'Materials', href: '/materials' },
 *     { label: 'Recycled Glass Composite' },
 *   ]} />
 *
 * Levert: Home / Materials / Recycled Glass Composite
 * (laatste item heeft geen href, krijgt .bc-last styling).
 */
export function Breadcrumb({
  items,
  showHome = true,
  separator = '/',
  className,
  ariaLabel = 'Breadcrumb',
}: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', href: '/' }, ...items]
    : items

  return (
    <nav className={cn('breadcrumbs', className)} aria-label={ariaLabel}>
      <ol className="u-contents">
        {allItems.map((item, idx) => {
          const isLast = idx === allItems.length - 1
          return (
            <li key={idx} className="u-contents">
              {idx > 0 && (
                <span className="bc-sep" aria-hidden="true">
                  {separator}
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span className={isLast ? 'bc-last' : undefined} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
