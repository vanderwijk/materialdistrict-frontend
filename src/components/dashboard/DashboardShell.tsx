'use client'

import { usePathname } from 'next/navigation'
import type { User } from '@/types/shared'
import { resolveDashboardScope } from '@/lib/dashboard/nav'
import { PreviewModeProvider } from '@/lib/hooks/usePreviewMode'
import { PreviewModeIndicator } from '@/components/ui/PreviewModeIndicator'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardMobileNav } from './DashboardMobileNav'

/**
 * The dashboard chrome: adaptive sidebar (desktop) + horizontal nav (mobile)
 * around the active panel. The current scope (personal vs a specific brand)
 * and the active panel are derived from the pathname — the URL is the single
 * source of truth, so there is no client routing state to keep in sync.
 *
 * Layout structure (#16.1, robust rebuild):
 *   .dash-shell                  ← outer frame (max-width, centering, padding)
 *     #dash-header-band          ← full-width band; pages portal their <h1> here
 *     .dash-layout               ← normal 256px / 1fr grid (sidebar | content)
 *       .dash-sidebar-wrap
 *       .dash-content            ← normal flex column
 *
 * The header lives in its own band above the grid, so the sidebar and content
 * always stay two proper columns — in every state (loading skeleton, empty,
 * multi-card). This replaces the earlier `display:contents` approach, which
 * broke the columns whenever the header was absent or content spanned multiple
 * cards.
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
    <PreviewModeProvider>
      <DashboardMobileNav user={user} scope={scope} />
      <div className="dash-shell fade-in">
        <div id="dash-header-band" className="dash-header-band" />
        <div className="dash-layout">
          <DashboardSidebar user={user} scope={scope} />
          <div className="dash-content">{children}</div>
        </div>
      </div>
      <PreviewModeIndicator />
    </PreviewModeProvider>
  )
}
