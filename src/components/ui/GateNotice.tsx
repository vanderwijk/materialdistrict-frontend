'use client'

/**
 * GateNotice — gedeelde, niet-blokkerende melding + board-flow voor de
 * overzicht-kaarten (§F2.7, punt 4 + board-uitbreiding B2).
 *
 * Drie meldings-vormen via één Provider (hoog in de tree, binnen
 * BookmarksProvider, zodat elk client-eiland ze deelt):
 *
 *  1. `notifyLogin()`  — niet-ingelogde bezoeker klikt Save → toast met
 *     inline "Sign in"-link (geen redirect; bezoeker blijft op het overzicht).
 *  2. `notify(text)`   — generieke melding zonder actie.
 *  3. `notifySaved()`  — ingelogde bezoeker heeft zojuist bewaard → toast
 *     "Saved ✓" met een "Add to board"-actie (hybride: opslaan blijft
 *     instant, board hangen is één klik extra).
 *
 * Board-flow (umbrella over bookmark — flat bookmark = basis, board =
 * optionele Insider-laag erbovenop):
 *  - Insider  → "Add to board" opent de bestaande `BoardPickerModal`
 *    (bestaand board kiezen of nieuw board aanmaken-en-toevoegen).
 *  - Niet-Insider → de actie is zichtbaar (teaser) maar opent de
 *    Insider-gate (`feature="boards"`), zodat de feature wel in beeld komt.
 *
 * Hergebruikt bestaande modal-CSS (BoardPickerModal = git-shell, InsiderGate
 * = eigen shell) — geen nieuwe styling nodig in deze batch.
 *
 * Loose mode: buiten een Provider zijn de calls no-ops.
 */

import Link from 'next/link'
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/components/providers/AuthContext'
import { BoardPickerModal } from './BoardPickerModal'
import { InsiderGate } from './InsiderGate'
import type { BookmarkType } from '@/types/dashboard'

interface SavedItem {
  type: BookmarkType
  itemId: number
  title?: string
}

interface NoticeState {
  text: string
  /** Toon een inline "Sign in"-link (login-melding). */
  signIn?: boolean
  /** Toon de "Add to board"-actie voor dit zojuist bewaarde item. */
  saved?: SavedItem
}

interface GateNoticeContextValue {
  notifyLogin: (text?: string) => void
  notify: (text: string) => void
  /** Meld een zojuist toegevoegde bookmark; biedt "Add to board" aan. */
  notifySaved: (item: SavedItem) => void
}

const GateNoticeContext = createContext<GateNoticeContextValue | null>(null)

const DEFAULT_LOGIN_TEXT = 'Sign in to save items to your account.'
const SAVED_TEXT = 'Saved to your bookmarks.'
const AUTO_DISMISS_MS = 5000

export function GateNoticeProvider({ children }: { children: ReactNode }) {
  const { isMember } = useAuth()
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const [boardItem, setBoardItem] = useState<SavedItem | null>(null)
  const [boardGateOpen, setBoardGateOpen] = useState(false)
  const timer = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const show = useCallback(
    (next: NoticeState) => {
      clearTimer()
      setNotice(next)
      if (typeof window !== 'undefined') {
        timer.current = window.setTimeout(() => setNotice(null), AUTO_DISMISS_MS)
      }
    },
    [clearTimer],
  )

  const notifyLogin = useCallback(
    (text?: string) => show({ text: text ?? DEFAULT_LOGIN_TEXT, signIn: true }),
    [show],
  )
  const notify = useCallback((text: string) => show({ text }), [show])
  const notifySaved = useCallback(
    (item: SavedItem) => show({ text: SAVED_TEXT, saved: item }),
    [show],
  )

  const dismiss = useCallback(() => {
    clearTimer()
    setNotice(null)
  }, [clearTimer])

  const signInHref = (): string => {
    if (typeof window === 'undefined') return '/sign-in'
    const next = window.location.pathname + window.location.search
    return `/sign-in?next=${encodeURIComponent(next)}`
  }

  // "Add to board": Insider → board-picker; anders → Insider-gate (teaser).
  const handleAddToBoard = useCallback(
    (item: SavedItem) => {
      dismiss()
      if (isMember) setBoardItem(item)
      else setBoardGateOpen(true)
    },
    [dismiss, isMember],
  )

  return (
    <GateNoticeContext.Provider value={{ notifyLogin, notify, notifySaved }}>
      {children}

      {notice && (
        <div className="gate-notice" role="status" aria-live="polite">
          <span className="gate-notice-text">{notice.text}</span>
          {notice.signIn && (
            <Link className="gate-notice-action" href={signInHref()} onClick={dismiss}>
              Sign in
            </Link>
          )}
          {notice.saved && (
            <button
              type="button"
              className="gate-notice-action"
              onClick={() => handleAddToBoard(notice.saved as SavedItem)}
            >
              Add to board
            </button>
          )}
          <button
            type="button"
            className="gate-notice-close"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Board-picker (Insider) — bestaande modal, alle content-types. */}
      <BoardPickerModal
        open={boardItem !== null}
        onClose={() => setBoardItem(null)}
        type={boardItem?.type ?? 'materials'}
        itemId={boardItem?.itemId ?? 0}
        title={boardItem?.title}
      />

      {/* Insider-gate voor non-members die "Add to board" aanraken. */}
      <InsiderGate
        variant="modal"
        feature="boards"
        open={boardGateOpen}
        onClose={() => setBoardGateOpen(false)}
        ctaHref="/dashboard/membership"
      />
    </GateNoticeContext.Provider>
  )
}

export function useGateNotice(): GateNoticeContextValue {
  const ctx = useContext(GateNoticeContext)
  if (!ctx) {
    return { notifyLogin: () => {}, notify: () => {}, notifySaved: () => {} }
  }
  return ctx
}
