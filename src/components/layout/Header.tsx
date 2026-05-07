'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  Bookmark,
  Folder,
  ShoppingBag,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { InsiderIcon } from '@/components/ui/icons/InsiderIcon'
import { Logo } from './Logo'

// ============================================================
// Types
// ============================================================

export type HeaderSection =
  | 'materials'
  | 'articles'
  | 'brands'
  | 'events'
  | 'books'
  | 'talks'

interface HeaderProps {
  /** Welke nav-tab moet als actief getoond worden. */
  currentSection?: HeaderSection
  /** Of de gebruiker is ingelogd. Bepaalt Login/Dashboard knop. */
  isLoggedIn?: boolean
  /** Of de gebruiker een Insider member is. Toont de Insider-knop. */
  isMember?: boolean
  /** Aantal items in de cart. Toont badge als > 0. */
  cartCount?: number
  /** Callback bij klik op login (als !isLoggedIn). */
  onLoginClick?: () => void
  /** Callback bij klik op dashboard (als isLoggedIn). */
  onDashboardClick?: () => void
  /** Callback bij klik op Insider-knop (als isMember). */
  onInsiderClick?: () => void
  /** Callback bij submit van header-search. */
  onSearch?: (query: string) => void
  /** Callback bij dark mode toggle. */
  onThemeToggle?: () => void
  /** Huidig thema (light of dark). */
  theme?: 'light' | 'dark'
}

interface NavItem {
  key: HeaderSection
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { key: 'materials', label: 'Materials', href: '/materials' },
  { key: 'articles', label: 'Stories', href: '/articles' },
  { key: 'brands', label: 'Brands', href: '/brands' },
  { key: 'events', label: 'Events', href: '/events' },
  { key: 'books', label: 'Books', href: '/books' },
  { key: 'talks', label: 'Talks', href: '/talks' },
]

/**
 * Header — sticky site-header met logo, nav, search overlay en action icons.
 *
 * Volledig client component vanwege de search-overlay state, mobile drawer state
 * en dark-mode toggle. Active section wordt via prop bepaald (loose coupling
 * met Next.js routing).
 *
 * @example
 *   <Header
 *     currentSection="materials"
 *     isLoggedIn={true}
 *     isMember={true}
 *     cartCount={3}
 *     onLoginClick={() => router.push('/login')}
 *     theme="light"
 *     onThemeToggle={toggleTheme}
 *   />
 */
export function Header({
  currentSection,
  isLoggedIn = false,
  isMember = false,
  cartCount = 0,
  onLoginClick,
  onDashboardClick,
  onInsiderClick,
  onSearch,
  onThemeToggle,
  theme = 'light',
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Body scroll lock voor mobile drawer
  useEffect(() => {
    if (!mobileOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileOpen])

  // Focus de search input wanneer overlay opent
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  // ESC sluit search overlay
  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [searchOpen])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch?.(searchValue)
    setSearchOpen(false)
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Logo */}
        <Link href="/" className="logo" aria-label="MaterialDistrict homepage">
          <Logo />
        </Link>

        {/* Hoofdnav — desktop */}
        <nav className="header-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'header-nav-link',
                `nav-${item.key}`,
                currentSection === item.key && 'active',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search overlay — verschijnt over de header heen */}
        <div className={cn('search-wrap', searchOpen && 'open')}>
          <form onSubmit={handleSearchSubmit} role="search">
            <input
              ref={searchInputRef}
              type="text"
              className="header-search"
              placeholder="Search materials, brands, articles…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={() => setSearchOpen(false)}
              aria-label="Search"
            />
          </form>
        </div>

        {/* Actie-icons rechts */}
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <Search size={16} strokeWidth={2} />
          </button>

          <Link href="/dashboard/bookmarks" className="icon-btn" aria-label="Bookmarks">
            <Bookmark size={16} strokeWidth={2} />
          </Link>

          <Link href="/dashboard/boards" className="icon-btn" aria-label="Boards">
            <Folder size={16} strokeWidth={2} />
          </Link>

          <Link href="/cart" className="icon-btn cart-btn" aria-label="Shopping cart">
            <ShoppingBag size={16} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="cart-badge" aria-label={`${cartCount} items in cart`}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login of Dashboard knop */}
          {isLoggedIn ? (
            <button
              type="button"
              className="btn btn-primary btn-sm hide-mobile"
              onClick={onDashboardClick}
            >
              Dashboard
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm hide-mobile"
              onClick={onLoginClick}
            >
              Login
            </button>
          )}

          {/* Insider knop — alleen voor members */}
          {isMember && (
            <button
              type="button"
              className="btn btn-member btn-sm hide-mobile"
              onClick={onInsiderClick}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <InsiderIcon size={16} />
              Insider
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            type="button"
            className="icon-btn"
            onClick={onThemeToggle}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun size={16} strokeWidth={2} />
            ) : (
              <Moon size={16} strokeWidth={2} />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="icon-btn show-mobile"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="mobile-nav-backdrop open"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="mobile-nav-drawer open"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">Menu</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <nav className="mobile-nav-list" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'mobile-nav-item',
                    `nav-${item.key}`,
                    currentSection === item.key && 'active',
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mobile-nav-actions">
              {!isLoggedIn && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setMobileOpen(false)
                    onLoginClick?.()
                  }}
                  style={{ width: '100%' }}
                >
                  Login
                </button>
              )}
              {isLoggedIn && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setMobileOpen(false)
                    onDashboardClick?.()
                  }}
                  style={{ width: '100%' }}
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
