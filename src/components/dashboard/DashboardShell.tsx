'use client'

import { usePathname } from 'next/navigation'
import type { User } from '@/types/shared'
import { resolveDashboardScope } from '@/lib/dashboard/nav'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardMobileNav } from './DashboardMobileNav'

/**
 * The dashboard chrome: adaptive sidebar (desktop) + horizontal nav (mobile)
 * around the active panel. The current scope (personal vs a specific brand)
 * and the active panel are derived from the pathname — the URL is the single
 * source of truth, so there is no client routing state to keep in sync.
 *
 * Rendered by the (server) dashboard layout, which has already gated on auth
 * and passes the resolved user down.
 */
export function DashboardShell({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const scope = resolveDashboardScope(pathname)

  return (
    <>
      <DashboardMobileNav user={user} scope={scope} />
      <div className="dash-layout fade-in">
        <DashboardSidebar user={user} scope={scope} />
        <div className="dash-content">{children}</div>
      </div>
    </>
  )
}
