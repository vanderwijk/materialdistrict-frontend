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
  Layers,
  BookOpen,
  Building2,
  Calendar,
  Book,
  Mic,
  type LucideIcon,
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
  /** Lucide icon-component voor mobile-menu rendering. */
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { key: 'materials', label: 'Materials', href: '/materials', icon: Layers },
  { key: 'articles', label: 'Stories', href: '/articles', icon: BookOpen },
  { key: 'brands', label: 'Brands', href: '/brands', icon: Building2 },
  { key: 'events', label: 'Events', href: '/events', icon: Calendar },
  { key: 'books', label: 'Books', href: '/books', icon: Book },
  { key: 'talks', label: 'Talks', href: '/talks', icon: Mic },
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

  // Sessie 7 fix Punt 20: click-buiten sluit search-overlay.
  // Vervangt de oude `onBlur` op het input-veld (die was te aggressief —
  // sluit ook wanneer je naar de close-knop tikt). Listener gebruikt
  // mousedown ipv click zodat de overlay sluit vóórdat een eventuele
  // klik op een ander element gefired wordt.
  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null
      const wrap = searchInputRef.current?.closest('.search-wrap')
      if (wrap && target && !wrap.contains(target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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

        {/* Search overlay — verschijnt over de header heen.
            Sessie 7 fix Punt 20: op mobile is dit een full-width strip
            over de hele header-rij (CSS-only). De close-knop is op
            desktop verborgen via CSS — daar sluit ESC of klik-buiten
            de overlay. onBlur is verwijderd omdat hij op mobile direct
            triggerde bij tikken op de close-knop en ook op desktop te
            aggressief was (sluiten bij tab-out naar submit). */}
        <div className={cn('search-wrap', searchOpen && 'open')}>
          <form onSubmit={handleSearchSubmit} role="search">
            <input
              ref={searchInputRef}
              type="text"
              className="header-search"
              placeholder="Search materials, brands, articles…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="Search"
            />
            <button
              type="button"
              className="header-search-close"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={16} strokeWidth={2} />
            </button>
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

          {/* Sessie 7 fix Punt 23: Save / Board / Cart-icoons alleen op
              desktop in de header-rij. Op mobile waren ze daar te druk
              en liepen ze uit beeld. Mobile-equivalenten staan in de
              drawer onderaan dit component. */}
          <Link
            href="/dashboard/bookmarks"
            className="icon-btn hide-mobile"
            aria-label="Bookmarks"
          >
            <Bookmark size={16} strokeWidth={2} />
          </Link>

          <Link
            href="/dashboard/boards"
            className="icon-btn hide-mobile"
            aria-label="Boards"
          >
            <Folder size={16} strokeWidth={2} />
          </Link>

          <Link
            href="/cart"
            className="icon-btn cart-btn hide-mobile"
            aria-label="Shopping cart"
          >
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
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
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
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="mobile-nav-item-icon"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mobile-nav-actions">
              {/* Sessie 7 fix Punt 19+23: Save / Board / Cart als eerste
                  groep onder de nav. Insider-features (Boards) krijgen
                  een teal-mark voor non-members; CartCount-badge blijft
                  zichtbaar als > 0. Save staat hierboven los van Boards
                  omdat Save geen Insider-feature is. */}
              <div className="mobile-nav-icon-row">
                <Link
                  href="/dashboard/bookmarks"
                  className="mobile-nav-icon-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <Bookmark size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Save</span>
                </Link>
                <Link
                  href="/dashboard/boards"
                  className="mobile-nav-icon-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <Folder size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Boards</span>
                  {!isMember && (
                    <InsiderIcon size={12} className="mobile-nav-icon-mark" />
                  )}
                </Link>
                <Link
                  href="/cart"
                  className="mobile-nav-icon-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span
                      className="mobile-nav-icon-badge"
                      aria-label={`${cartCount} items`}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Sessie 7 fix Punt 19: auth-acties onderaan, gescheiden
                  door een hr (CSS border-top). Voor anonieme users:
                  Login + Create account. Voor ingelogde: Dashboard. */}
              {!isLoggedIn ? (
                <div className="mobile-nav-auth">
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
                  <Link
                    href="/register"
                    className="btn btn-primary"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Create account
                  </Link>
                  {/* Sessie 7 — Become an Insider CTA voor anonieme users.
                      Teal-styling consistent met `btn-member` zodat de
                      Insider-feature visueel herkenbaar blijft. Linkt naar
                      /membership waar de upsell-content staat. */}
                  <Link
                    href="/membership"
                    className="btn btn-member mobile-nav-insider-cta"
                    onClick={() => setMobileOpen(false)}
                  >
                    <InsiderIcon size={16} />
                    Become an Insider
                  </Link>
                </div>
              ) : (
                <div className="mobile-nav-auth">
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
                  {isMember && (
                    <button
                      type="button"
                      className="btn btn-member"
                      onClick={() => {
                        setMobileOpen(false)
                        onInsiderClick?.()
                      }}
                      style={{
                        width: '100%',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <InsiderIcon size={16} />
                      Insider
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
