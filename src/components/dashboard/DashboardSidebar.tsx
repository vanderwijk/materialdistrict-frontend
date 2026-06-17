'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/shared'
import { useAuth } from '@/components/providers'
import {
  USER_NAV,
  BRAND_NAV,
  brandPanelHref,
  initialsFrom,
  type DashboardScope,
} from '@/lib/dashboard/nav'
import { IconChevronDown, IconChevronRight, IconArrowRight, IconAdd, IconLogout } from '@/components/ui/icons'

/**
 * Adaptive dashboard sidebar.
 *
 * One integrated navigation for the logged-in person: the Account scope
 * (personal panels) plus a scope per managed brand (`user.brands[]`, an
 * array → multi-brand). The active scope is expanded and shows its panel
 * list; the others collapse to a single scope button. Everything is a real
 * link — the active state comes from the resolved scope, not local state.
 */
export function DashboardSidebar({
  user,
  scope,
}: {
  user: User
  scope: DashboardScope
}) {
  const isUserScope = scope.kind === 'user'
  const { signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="dash-sidebar-wrap">
      <div className="sb-section">
        {/* Account scope */}
        <div className="sb-section-hd">Account</div>
        <div className={`sb-scope ${isUserScope ? 'active' : ''}`}>
          <Link href="/dashboard/profile" className="sb-scope-btn">
            <span className="sb-scope-id">
              <span className="sb-avatar">{initialsFrom(user.displayName || user.name)}</span>
              <span className="sb-scope-text">
                <span className="sb-scope-name">{user.displayName || user.name}</span>
                <span className="sb-scope-sub">Personal account</span>
              </span>
            </span>
            {isUserScope ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </Link>
          {isUserScope && (
            <nav className="sb-nav" aria-label="Personal navigation">
              {USER_NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`sb-nav-item ${scope.activeKey === item.key ? 'active' : ''}`}
                  aria-current={scope.activeKey === item.key ? 'page' : undefined}
                >
                  {item.label}
                  <IconArrowRight size={14} />
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Brand scopes — one per managed brand */}
        <div className="sb-section-hd sb-section-hd--brands">Brands</div>
        {user.brands.map((brand) => {
          const isOpen = scope.kind === 'brand' && scope.slug === brand.slug
          // A draft/new brand can have an empty slug — its pages don't exist
          // yet, so linking would 404. Show it as a non-clickable placeholder
          // until WordPress assigns a slug.
          if (!brand.slug) {
            return (
              <div key={brand.id} className="sb-scope sb-scope--pending">
                <span className="sb-scope-btn is-disabled" aria-disabled="true">
                  <span className="sb-scope-id">
                    <span className="sb-avatar is-brand">{initialsFrom(brand.name)}</span>
                    <span className="sb-scope-name">{brand.name}</span>
                  </span>
                  <span className="sb-scope-pending-tag">Pending setup</span>
                </span>
              </div>
            )
          }
          return (
            <div key={brand.id} className={`sb-scope ${isOpen ? 'active' : ''}`}>
              <Link href={brandPanelHref(brand.slug, '')} className="sb-scope-btn">
                <span className="sb-scope-id">
                  <span className="sb-avatar is-brand">{initialsFrom(brand.name)}</span>
                  <span className="sb-scope-text">
                    <span className="sb-scope-name">{brand.name}</span>
                    <span className="sb-scope-sub">Brand account</span>
                  </span>
                </span>
                {isOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </Link>
              {isOpen && (
                <nav className="sb-nav" aria-label={`${brand.name} navigation`}>
                  {BRAND_NAV.map((item) => (
                    <Link
                      key={item.key}
                      href={brandPanelHref(brand.slug, item.segment)}
                      className={`sb-nav-item ${scope.activeKey === item.key ? 'active' : ''}`}
                      aria-current={scope.activeKey === item.key ? 'page' : undefined}
                    >
                      {item.label}
                      <IconArrowRight size={14} />
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          )
        })}

        <Link href="/dashboard/brands/new" className="sb-add-brand">
          <IconAdd size={16} /> Add brand
        </Link>
      </div>

      <div className="sb-footer">
        <Link href="/" className="btn btn-outline sb-back-btn">
          ← Back to homepage
        </Link>
        <button type="button" className="sb-signout" onClick={handleSignOut}>
          <IconLogout size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}
