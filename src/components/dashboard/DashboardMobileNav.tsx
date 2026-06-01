'use client'

import Link from 'next/link'
import type { User } from '@/types/shared'
import {
  USER_NAV,
  BRAND_NAV,
  brandPanelHref,
  type DashboardScope,
} from '@/lib/dashboard/nav'

/**
 * Mobile dashboard navigation — a horizontal scroller of the active scope's
 * panels, shown below the header on small screens (hidden ≥768px via
 * `.dash-mob-nav` in globals.css). Mirrors the sidebar's active scope so the
 * person navigates the same panel set without the desktop two-column layout.
 *
 * The "delete brand" panel is intentionally omitted from the mobile bar
 * (matching the mockup, which keeps destructive actions out of the quick nav).
 */
export function DashboardMobileNav({
  user,
  scope,
}: {
  user: User
  scope: DashboardScope
}) {
  const items =
    scope.kind === 'brand'
      ? BRAND_NAV.filter((n) => n.key !== 'delete-brand').map((n) => ({
          key: n.key,
          label: n.label,
          href: brandPanelHref(scope.slug, n.segment),
        }))
      : USER_NAV.map((n) => ({ key: n.key, label: n.label, href: n.href }))

  return (
    <nav className="dash-mob-nav" aria-label="Dashboard navigation">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`dash-mob-nav-btn ${scope.activeKey === item.key ? 'active' : ''}`}
          aria-current={scope.activeKey === item.key ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
      <Link href="/" className="dash-mob-nav-btn is-home">
        ← Home
      </Link>
    </nav>
  )
}
