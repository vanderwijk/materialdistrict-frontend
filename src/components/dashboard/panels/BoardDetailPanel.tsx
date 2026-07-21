import Link from 'next/link'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconBoard } from '@/components/ui/icons'
import type { BoardDetail } from '@/types/dashboard'
import { formatBoardSummaryFromItems } from '@/lib/dashboard/board-summary'

/**
 * BoardDetailPanel — toont de opgeslagen items van één board.
 *
 * Hergebruikt bewust de bookmark-card-opmaak (`bm-grid` / `bm-card`) zodat er
 * geen nieuwe CSS nodig is. Read-only in v1: items verwijderen zit hier (nog)
 * niet — dat wacht op een DELETE-endpoint.
 *
 * Server component: geen interactie, dus geen client-bundle nodig.
 */
export function BoardDetailPanel({ board }: { board: BoardDetail }) {
  return (
    <div className="dash-panel">
      <Link href="/dashboard/boards" className="detail-header-back">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to boards
      </Link>
      <h2 className="panel-section-title board-detail-name">{board.name}</h2>
      <p className="board-meta">{formatBoardSummaryFromItems(board.items)}</p>

      {board.items.length === 0 ? (
        <EmptyState
          icon={<IconBoard size={28} />}
          title="This board is empty"
          description="Add materials and articles to this board from their detail pages."
          actions={
            <Link href="/material" className="btn btn-primary">
              Browse materials
            </Link>
          }
        />
      ) : (
        <div className="bm-grid">
          {board.items.map((item) => {
            const cover = { '--cover': item.gradient ?? 'var(--surface2)' } as CSSProperties
            return (
              <article key={`${item.type}:${item.itemId}`} className="bm-card">
                <Link href={item.href} className="bm-card-link">
                  <div className="bm-cover" style={cover}>
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" />
                    )}
                  </div>
                  <div className="bm-body">
                    <span className="tag">{item.label}</span>
                    <h3 className="bm-title">{item.title}</h3>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
