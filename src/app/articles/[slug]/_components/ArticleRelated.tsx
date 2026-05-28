/**
 * ArticleRelated
 * ----------------------------------------------------------------------
 * "Related articles"-blok onderaan de article-detail-page. Conform de
 * mockup: een compacte rij-lijst (thumb · type-pill · datum · titel ·
 * 2-regelig excerpt) — geen card-grid. De page levert de gerelateerde
 * items als props (server-side berekend: zelfde story-type, andere slug).
 *
 * Sessie 6. Rendert niets bij een lege lijst.
 *
 * Insider-mark: items tonen een Insider-pill zodra `insiderOnly` true is
 * (D2, voorbereid — voorlopig altijd false tot Johan koppelt).
 */

import Link from 'next/link'
import { InsiderMark } from '@/components/ui'
import { STORY_TYPE_META, type StoryType } from '@/lib/config/story-types'

export interface ArticleRelatedItem {
  id: number
  slug: string
  title: string
  type: StoryType
  dateLabel: string
  excerpt?: string
  heroUrl?: string
  insiderOnly: boolean
}

export interface ArticleRelatedProps {
  items: ArticleRelatedItem[]
}

export function ArticleRelated({ items }: ArticleRelatedProps) {
  if (items.length === 0) return null

  return (
    <section className="article-related" aria-label="Related articles">
      <h2 className="article-related-head t-display-md">Related articles</h2>
      <ul className="article-related-list" role="list">
        {items.map((item) => {
          const meta = STORY_TYPE_META[item.type]
          return (
            <li key={item.id}>
              <Link
                href={`/articles/${item.slug}`}
                className="article-related-item"
              >
                <span
                  className="article-related-thumb"
                  style={
                    item.heroUrl
                      ? { backgroundImage: `url(${item.heroUrl})` }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <span className="article-related-body">
                  <span className="article-related-meta">
                    <span
                      className="article-related-pill"
                      style={{ background: meta.pale, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="article-related-date">
                      {item.dateLabel}
                    </span>
                    {item.insiderOnly && <InsiderMark size="xs" />}
                  </span>
                  <span className="article-related-title">{item.title}</span>
                  {item.excerpt && (
                    <span className="article-related-excerpt">
                      {item.excerpt}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
