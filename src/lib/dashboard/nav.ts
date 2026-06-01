/**
 * Dashboard navigation — single source of truth.
 *
 * The mockup hard-codes two nav arrays (`userPages` / `BRAND_NAV`) and routes
 * by mutating `dashPage` + `openScope`. In the Next.js build the dashboard uses
 * real nested routes, so this config maps each panel to a URL and a gating
 * rule. Both the desktop sidebar and the mobile nav consume it — no second
 * copy of the panel list.
 *
 * Personal (user) scope lives under /dashboard/*; each brand scope lives under
 * /dashboard/brands/{slug}/*. The "active" panel is derived from the pathname
 * (see `resolveDashboardScope`).
 */

import type { ManufacturerTier } from '@/lib/config/membership'
import type { UserNavItem, BrandNavItem } from '@/types/dashboard'

// ============================================================
// Personal (user) scope
// ============================================================

/**
 * Order matches the mockup Account section. `insiderOnly` items (boards,
 * saved searches, insider insights, the reader membership panel) stay visible
 * in the nav for free users — the panel itself shows an upsell gate. This is
 * the mockup behaviour and the upsell pillar (no dead-ends).
 */
export const USER_NAV: readonly UserNavItem[] = [
  { key: 'profile', label: 'My profile', href: '/dashboard/profile', insiderOnly: false },
  { key: 'bookmarks', label: 'Bookmarks', href: '/dashboard/bookmarks', insiderOnly: false },
  { key: 'boards', label: 'Boards', href: '/dashboard/boards', insiderOnly: true },
  { key: 'requests', label: 'My requests', href: '/dashboard/requests', insiderOnly: false },
  { key: 'saved-searches', label: 'Saved searches', href: '/dashboard/saved-searches', insiderOnly: true },
  { key: 'insider-insights', label: 'Insider insights', href: '/dashboard/insider-insights', insiderOnly: true },
  { key: 'membership', label: 'Insider membership', href: '/dashboard/membership', insiderOnly: false },
  { key: 'invoices', label: 'Invoices', href: '/dashboard/invoices', insiderOnly: false },
] as const

// ============================================================
// Brand scope
// ============================================================

/**
 * Order matches the mockup BRAND_NAV. `segment` is appended to
 * /dashboard/brands/{slug}; '' is the brand profile (the scope root).
 * `minTier` gates the panel — a lower tier sees an upgrade gate inside the
 * panel rather than the link disappearing (upsell pillar).
 */
export const BRAND_NAV: readonly BrandNavItem[] = [
  { key: 'brand', label: 'Brand profile', segment: '', minTier: null },
  { key: 'materials', label: 'Materials', segment: 'materials', minTier: 'basis' },
  { key: 'interactions', label: 'Interactions', segment: 'interactions', minTier: 'basis' },
  { key: 'statistics', label: 'Statistics', segment: 'statistics', minTier: 'basis' },
  { key: 'lead-routing', label: 'Lead routing', segment: 'lead-routing', minTier: 'plus' },
  { key: 'featured', label: 'Featured', segment: 'featured', minTier: 'partner' },
  { key: 'membership', label: 'Membership', segment: 'membership', minTier: null },
  { key: 'invoices', label: 'Invoices', segment: 'invoices', minTier: null },
  { key: 'delete-brand', label: 'Delete brand', segment: 'delete', minTier: null },
] as const

// Tier ranking for `minTier` checks. Kept local — the canonical tier list is
// in membership.ts; this is only an ordering for "is X at least Y".
const TIER_ORDER: Record<ManufacturerTier, number> = {
  free: 0,
  basis: 1,
  plus: 2,
  partner: 3,
}

/** True when `tier` meets or exceeds `minTier` (null = always allowed). */
export function tierMeets(tier: ManufacturerTier, minTier: ManufacturerTier | null): boolean {
  if (minTier === null) return true
  return TIER_ORDER[tier] >= TIER_ORDER[minTier]
}

// ============================================================
// Route helpers
// ============================================================

/** Build the absolute URL for a brand panel. */
export function brandPanelHref(slug: string, segment: string): string {
  return segment ? `/dashboard/brands/${slug}/${segment}` : `/dashboard/brands/${slug}`
}

export type DashboardScope =
  | { kind: 'user'; activeKey: string }
  | { kind: 'brand'; slug: string; activeKey: string }

/**
 * Derive the current scope + active panel key from a pathname. Drives the
 * active-state highlighting in the sidebar and mobile nav without any client
 * state — the URL is the source of truth.
 */
export function resolveDashboardScope(pathname: string): DashboardScope {
  const brandMatch = pathname.match(/^\/dashboard\/brands\/([^/]+)(?:\/([^/]+))?/)
  if (brandMatch && brandMatch[1] !== 'new') {
    const slug = brandMatch[1]
    const segment = brandMatch[2] ?? ''
    // Material create/edit lives under the "materials" panel for highlighting.
    const normalized = segment === 'materials' ? 'materials' : segment
    const navItem = BRAND_NAV.find((n) => n.segment === normalized)
    return { kind: 'brand', slug, activeKey: navItem?.key ?? 'brand' }
  }

  const userMatch = pathname.match(/^\/dashboard\/([^/]+)/)
  const segment = userMatch?.[1] ?? 'profile'
  const navItem = USER_NAV.find((n) => n.key === segment)
  return { kind: 'user', activeKey: navItem?.key ?? 'profile' }
}

/** Two-letter initials from a display name (e.g. "Jeroen van Oostveen" → JO). */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
