'use client'

/**
 * AccountMenu — avatar + voornaam + dropdown in de header (feedback 21-06).
 * ----------------------------------------------------------------------
 * Vervangt de losse "Insider"-knop (die verwarrend naar de upsell linkte
 * terwijl je al Insider was). Het menu past zich aan op de status:
 *
 *  - Insider  → avatar met teal Insider-ring + badge "Insider"; menu met
 *               Your account · Membership & billing · Insider insights.
 *  - Gratis   → avatar zonder ring + badge "Free account"; menu met
 *               Your account · Become an Insider.
 *
 * Log out staat onderaan het menu (rood), gescheiden door een divider.
 * Presentational + callbacks; de routing/auth zit in HeaderShell. Desktop-
 * only (de mobiele drawer regelt account-acties zelf).
 */

import { useState, useRef, useEffect } from 'react'
import { User as UserIcon, CreditCard, Sparkles, LogOut } from 'lucide-react'
import { InsiderIcon } from '@/components/ui/icons/InsiderIcon'
import { cn } from '@/lib/utils/cn'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const second = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : ''
  return (first + second).toUpperCase() || '?'
}

export interface AccountMenuProps {
  firstName: string
  isMember: boolean
  avatarUrl?: string | null
  onAccount: () => void
  onMembership: () => void
  onInsiderInsights: () => void
  onBecomeInsider: () => void
  onLogout: () => void
  className?: string
}

export function AccountMenu({
  firstName,
  isMember,
  avatarUrl,
  onAccount,
  onMembership,
  onInsiderInsights,
  onBecomeInsider,
  onLogout,
  className,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  const avatar = (
    <span className={cn('account-avatar', isMember && 'is-insider')}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" />
      ) : (
        initials(firstName)
      )}
    </span>
  )

  return (
    <div className={cn('account-menu', className)} ref={rootRef}>
      <button
        type="button"
        className="account-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {avatar}
        <span className="account-name">{firstName}</span>
        <svg
          className="account-chev"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="account-pop" role="menu">
          <div className="account-pop-head">
            {avatar}
            <div className="account-pop-id">
              <div className="account-pop-name">{firstName}</div>
              <span
                className={cn('account-pop-badge', !isMember && 'is-free')}
              >
                {isMember ? 'Insider' : 'Free account'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="account-pop-item"
            role="menuitem"
            onClick={() => go(onAccount)}
          >
            <UserIcon size={16} strokeWidth={2} />
            Your account
          </button>

          {isMember ? (
            <>
              <button
                type="button"
                className="account-pop-item"
                role="menuitem"
                onClick={() => go(onMembership)}
              >
                <CreditCard size={16} strokeWidth={2} />
                Membership &amp; billing
              </button>
              <button
                type="button"
                className="account-pop-item"
                role="menuitem"
                onClick={() => go(onInsiderInsights)}
              >
                <Sparkles size={16} strokeWidth={2} />
                Insider insights
              </button>
            </>
          ) : (
            <button
              type="button"
              className="account-pop-item is-upsell"
              role="menuitem"
              onClick={() => go(onBecomeInsider)}
            >
              <InsiderIcon size={16} />
              Become an Insider
            </button>
          )}

          <div className="account-pop-divider" />
          <button
            type="button"
            className="account-pop-item is-logout"
            role="menuitem"
            onClick={() => go(onLogout)}
          >
            <LogOut size={16} strokeWidth={2} />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
