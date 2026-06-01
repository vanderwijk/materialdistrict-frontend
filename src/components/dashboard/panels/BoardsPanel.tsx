'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconBoard, IconBoardAdd, IconDelete } from '@/components/ui/icons'
import type { Board } from '@/types/dashboard'

const NEW_GRADIENTS = [
  'linear-gradient(135deg,#d7e8b6,#eef6ff)',
  'linear-gradient(135deg,#d6e6f0,#eef2d8)',
  'linear-gradient(135deg,#e7dfd2,#eef6ff)',
  'linear-gradient(135deg,#e5dde8,#f4f3f8)',
]

/**
 * Boards panel (Insider). Project folders grouping saved materials/articles.
 * Create/delete are optimistic local state until the boards endpoints land
 * (`POST/DELETE /md/v2/dashboard/boards`).
 */
export function BoardsPanel({ initial }: { initial: Board[] }) {
  const [boards, setBoards] = useState(initial)

  function createBoard() {
    const name = window.prompt('Board name')?.trim()
    if (!name) return
    const board: Board = {
      id: `local-${Date.now()}`,
      name,
      createdAt: new Date().toISOString().slice(0, 10),
      materialCount: 0,
      articleCount: 0,
      coverGradient: NEW_GRADIENTS[boards.length % NEW_GRADIENTS.length],
    }
    setBoards((b) => [board, ...b])
  }

  function remove(id: string) {
    setBoards((b) => b.filter((x) => x.id !== id))
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
                <div className="board-cover" style={cover} />
                <div className="board-body">
                  <h3 className="board-name">{board.name}</h3>
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
