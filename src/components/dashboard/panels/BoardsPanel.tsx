'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconBoard, IconBoardAdd, IconDelete } from '@/components/ui/icons'
import type { Board } from '@/types/dashboard'

/**
 * Boards panel (Insider). Project folders grouping saved materials/articles.
 * Create → POST, delete → DELETE (`/md/v2/dashboard/boards`), both via the
 * `/api/dashboard/boards` proxy with optimistic UI.
 */
export function BoardsPanel({ initial }: { initial: Board[] }) {
  const [boards, setBoards] = useState(initial)

  async function createBoard() {
    const name = window.prompt('Board name')?.trim()
    if (!name) return
    try {
      const res = await fetch('/api/dashboard/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return
      const board = (await res.json()) as Board
      setBoards((b) => [board, ...b])
    } catch {
      // ignore — board not added
    }
  }

  async function remove(id: string) {
    const prev = boards
    setBoards((b) => b.filter((x) => x.id !== id)) // optimistic
    try {
      const res = await fetch(`/api/dashboard/boards/${id}`, { method: 'DELETE' })
      if (!res.ok) setBoards(prev)
    } catch {
      setBoards(prev)
    }
  }

  return (
    <div className="dash-panel">
      <div className="panel-head-row">
        <h2 className="panel-section-title">Your boards</h2>
        <button type="button" className="btn btn-primary btn-sm" onClick={createBoard}>
          <IconBoardAdd size={16} /> New board
        </button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          icon={<IconBoard size={28} />}
          title="No boards yet"
          description="Create a board to group materials and articles per project."
          actions={
            <button type="button" className="btn btn-primary" onClick={createBoard}>
              Create your first board
            </button>
          }
        />
      ) : (
        <div className="board-grid">
          {boards.map((board) => {
            const cover = { '--cover': board.coverGradient } as CSSProperties
            return (
              <article key={board.id} className="board-card">
                <Link
                  href={`/dashboard/boards/${board.id}`}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <div className="board-cover" style={cover} />
                </Link>
                <div className="board-body">
                  <h3 className="board-name">
                    <Link href={`/dashboard/boards/${board.id}`}>{board.name}</Link>
                  </h3>
                  <p className="board-meta">
                    {board.materialCount} materials · {board.articleCount} articles
                  </p>
                </div>
                <button
                  type="button"
                  className="board-remove"
                  onClick={() => remove(board.id)}
                  aria-label={`Delete board ${board.name}`}
                >
                  <IconDelete size={16} />
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
