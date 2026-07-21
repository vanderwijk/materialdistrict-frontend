'use client'

/**
 * BoardPickerModal
 * ----------------------------------------------------------------------
 * "Add to board" overlay (Insider). Opent vanaf de detail-actions; laat de
 * gebruiker het huidige content-item aan een bestaand board toevoegen of een
 * nieuw board aanmaken.
 *
 * Hergebruikt bewust de `git-*` modal-shell (zelfde als GetInTouchModal) +
 * de bestaande `git-option`-rijen, zodat er GEEN nieuwe CSS nodig is.
 *
 * Flow:
 *  - Bij openen: GET /api/dashboard/boards → lijst.
 *  - Klik op een board → POST /api/dashboard/boards/{id}/items { type, itemId }.
 *  - "New board" → naam via prompt → POST /api/dashboard/boards → meteen het
 *    item toevoegen aan het nieuwe board.
 *  - Succes → bevestigingsscherm (git-success).
 *
 * Gating (ingelogd + Insider) gebeurt in `DetailActions` vóór `onAddToBoard`,
 * dus deze modal gaat ervan uit dat de gebruiker een Insider is.
 *
 * Accessibility: role="dialog", aria-modal, ESC sluit, backdrop-klik sluit,
 * body-scroll-lock, focus naar de eerste rij bij open.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { IconBoard, IconBoardAdd, IconClose, IconLoading } from '@/components/ui/icons'
import type { Board, BookmarkType } from '@/types/dashboard'
import { formatBoardSummaryFromBoard } from '@/lib/dashboard/board-summary'
import { BOOKMARK_TYPE_SINGULAR } from '@/lib/dashboard/bookmark-labels'

export interface BoardPickerModalProps {
  open: boolean
  onClose: () => void
  /** Content-type van het item dat wordt toegevoegd. */
  type: BookmarkType
  /** Onderliggende WP-post-id van het item. */
  itemId: number
  /** Titel van het item (voor de modal-kop). */
  title?: string
}

const SINGULAR = BOOKMARK_TYPE_SINGULAR

export function BoardPickerModal({ open, onClose, type, itemId, title }: BoardPickerModalProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState<string | null>(null) // board-id of 'new' tijdens schrijven
  const [error, setError] = useState<string | null>(null)
  const [savedTo, setSavedTo] = useState<string | null>(null) // board-naam na succes
  const firstRowRef = useRef<HTMLButtonElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Tab-focus binnen de modal houden (WCAG 2.4.3, Focus Order).
  useFocusTrap(open, containerRef)

  // Reset + laad boards bij openen
  useEffect(() => {
    if (!open) return
    setError(null)
    setSavedTo(null)
    setBusy(null)
    let cancelled = false
    setLoading(true)
    fetch('/api/dashboard/boards', { method: 'GET' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Board[]) => {
        if (!cancelled && Array.isArray(data)) setBoards(data)
      })
      .catch(() => {
        /* lege lijst — gebruiker kan alsnog een nieuw board maken */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  // ESC sluit
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Body-scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus eerste rij bij open
  useEffect(() => {
    if (open && !loading && firstRowRef.current) firstRowRef.current.focus()
  }, [open, loading])

  const handleBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  /** Voeg het item toe aan een board; gooit bij falen. Retourneert het board. */
  async function postItem(boardId: string): Promise<Board> {
    const res = await fetch(`/api/dashboard/boards/${encodeURIComponent(boardId)}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, itemId }),
    })
    if (!res.ok) throw new Error('add failed')
    return (await res.json()) as Board
  }

  async function addToBoard(board: Board) {
    if (busy) return
    setBusy(board.id)
    setError(null)
    try {
      const updated = await postItem(board.id)
      setSavedTo(updated.name || board.name)
    } catch {
      setError('Could not add to this board. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  async function createAndAdd() {
    if (busy) return
    const name = window.prompt('Board name')?.trim()
    if (!name) return
    setBusy('new')
    setError(null)
    try {
      const res = await fetch('/api/dashboard/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('create failed')
      const board = (await res.json()) as Board
      setBoards((b) => [board, ...b])
      const updated = await postItem(board.id)
      setSavedTo(updated.name || board.name)
    } catch {
      setError('Could not create the board. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  if (!open) return null

  const itemLabel = SINGULAR[type]

  return (
    <div
      ref={containerRef}
      className="git-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bp-title"
      onClick={handleBackdrop}
    >
      <div className="git-modal">
        <header className="git-header">
          <div>
            <p className="git-eyebrow">ADD TO BOARD</p>
            <h2 id="bp-title" className="git-title">
              {title ?? 'Add to board'}
            </h2>
            <p className="git-submeta">Save this {itemLabel} to one of your boards</p>
          </div>
          <button type="button" className="git-close" onClick={onClose} aria-label="Close">
            <IconClose size={18} strokeWidth={2.5} />
          </button>
        </header>

        {savedTo ? (
          <div className="git-success">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>Added to board</h3>
            <p>
              This {itemLabel} was added to <strong>{savedTo}</strong>.
            </p>
            <button type="button" className="git-success-close" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="git-form">
            <p className="git-intro">
              Pick a board to save this {itemLabel} to, or create a new one.
            </p>

            {loading ? (
              <p className="git-footer-hint">Loading your boards…</p>
            ) : (
              <ul className="git-options" role="list">
                <li>
                  <button
                    ref={firstRowRef}
                    type="button"
                    className="git-option"
                    onClick={createAndAdd}
                    disabled={busy !== null}
                  >
                    <span className="git-option-icon" aria-hidden="true">
                      {busy === 'new' ? <IconLoading size={18} /> : <IconBoardAdd size={18} />}
                    </span>
                    <span className="git-option-text">
                      <span className="git-option-label">New board</span>
                      <span className="git-option-hint">Create a board for this {itemLabel}</span>
                    </span>
                  </button>
                </li>

                {boards.map((board) => (
                  <li key={board.id}>
                    <button
                      type="button"
                      className="git-option"
                      onClick={() => addToBoard(board)}
                      disabled={busy !== null}
                    >
                      <span className="git-option-icon" aria-hidden="true">
                        {busy === board.id ? <IconLoading size={18} /> : <IconBoard size={18} />}
                      </span>
                      <span className="git-option-text">
                        <span className="git-option-label">{board.name}</span>
                        <span className="git-option-hint">{formatBoardSummaryFromBoard(board)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="git-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
