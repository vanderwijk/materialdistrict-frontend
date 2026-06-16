import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { IconChevronRight } from '@/components/ui/icons'

interface MobileNavItemProps {
  href: string
  children: ReactNode
  /** Optioneel — content-type icoon links van de label. */
  icon?: ReactNode
  /** Markeer als actieve route. */
  active?: boolean
  /** Insider-aware styling (teal accent). */
  insider?: boolean
  /** Onclick — voor drawer-sluiten na klik. */
  onClick?: () => void
  /** Toon trailing chevron (default: true). */
  trailingChevron?: boolean
  className?: string
}

/**
 * MobileNavItem — grote tap-target nav-item voor de mobile drawer.
 *
 * Vervangt de inline drawer-anchor-styling in Header.tsx mobile-mode.
 * Klasse-gestuurd via `.mobile-nav-item` in §43.
 *
 * @example
 *   <MobileNavItem href="/material" icon={<IconMaterial />}>Materials</MobileNavItem>
 *   <MobileNavItem href="/insider" insider>Insider</MobileNavItem>
 */
export function MobileNavItem({
  href,
  children,
  icon,
  active = false,
  insider = false,
  onClick,
  trailingChevron = true,
  className,
}: MobileNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'mobile-nav-item',
        active && 'is-active',
        insider && 'is-insider',
        className,
      )}
    >
      {icon && (
        <span className="mobile-nav-item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="mobile-nav-item-label">{children}</span>
      {trailingChevron && (
        <span className="mobile-nav-item-chevron" aria-hidden="true">
          <IconChevronRight size={18} strokeWidth={2} />
        </span>
      )}
    </Link>
  )
}
