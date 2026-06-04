import Link from 'next/link'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconBoard } from '@/components/ui/icons'
import type { BoardDetail } from '@/types/dashboard'

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
      <div className="panel-head-row">
        <p className="board-meta">
          {board.materialCount} materials · {board.articleCount} articles
        </p>
        <Link href="/dashboard/boards" className="btn btn-outline btn-sm">
          ← Your boards
        </Link>
      </div>

      {board.items.length === 0 ? (
        <EmptyState
          icon={<IconBoard size={28} />}
          title="This board is empty"
          description="Add materials and articles to this board from their detail pages."
          actions={
            <Link href="/materials" className="btn btn-primary">
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
                <Link
                  href={item.href}
                  className="bm-cover"
                  style={cover}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" />
                  )}
                </Link>
                <div className="bm-body">
                  <span className="tag">{item.label}</span>
                  <h3 className="bm-title">
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
