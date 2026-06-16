import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface HeaderNavItemProps {
  href: string
  children: ReactNode
  /** Markeer als actieve route — krijgt onderstreping. */
  active?: boolean
  /** Bevat dit item een dropdown? Toont chevron. */
  hasDropdown?: boolean
  /** Toon Insider-aware styling (teal accent). */
  insider?: boolean
  /** Wordt opgeroepen bij klik (handig voor dropdown-toggle). */
  onClick?: () => void
  className?: string
}

/**
 * HeaderNavItem — top-level navigation link in de site-header.
 *
 * Vervangt de inline `<a className="...">` patronen die voorheen in
 * Header.tsx verspreid stonden. Klasse-gestuurd via `.nav-item` in §43.
 *
 * @example
 *   <HeaderNavItem href="/material" active={pathname.startsWith('/material')}>
 *     Materials
 *   </HeaderNavItem>
 *   <HeaderNavItem href="/insider" insider>Insider</HeaderNavItem>
 */
export function HeaderNavItem({
  href,
  children,
  active = false,
  hasDropdown = false,
  insider = false,
  onClick,
  className,
}: HeaderNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'nav-item',
        active && 'is-active',
        insider && 'is-insider',
        hasDropdown && 'has-dropdown',
        className,
      )}
    >
      <span className="nav-item-label">{children}</span>
      {hasDropdown && (
        <span className="nav-item-chevron" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      )}
    </Link>
  )
}
