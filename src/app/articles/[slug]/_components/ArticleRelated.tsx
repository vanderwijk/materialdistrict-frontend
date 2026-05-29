/**
 * ArticleRelated
 * ----------------------------------------------------------------------
 * "Related"-blok onderaan de article-detail-page. Conform de mockup een
 * compacte rij-lijst (thumb · type-pill · titel) — geen card-grid.
 *
 * Sessie 6b (D5): de items komen nu uit het SearchWP-Related-endpoint en
 * zijn GEMIXT (article/material/talk), geleverd als `RelatedItem`'s door
 * `getRelatedContent()`. Het endpoint levert geen datum/excerpt/insider-
 * vlag, dus de rij toont type-pill + titel + thumbnail.
 *
 * Rendert niets bij een lege lijst.
 */

import Link from 'next/link'
import type { RelatedContentType, RelatedItem } from '@/types/article'

const TYPE_LABEL: Record<RelatedContentType, string> = {
  article: 'Article',
  material: 'Material',
  talk: 'Talk',
}

/**
 * Interne route per type. Articles (sessie 6), materials (sessie 4/5) en
 * talks (sessie 7) hebben een detail-route. Onbekende types vallen terug op
 * de door WP geleverde permalink (`item.link`).
 */
function hrefFor(item: RelatedItem): string {
  switch (item.type) {
    case 'article':
      return `/articles/${item.slug}`
    case 'material':
      return `/materials/${item.slug}`
    case 'talk':
      return `/talks/${item.slug}`
    default:
      return item.link
  }
}

export interface ArticleRelatedProps {
  items: RelatedItem[]
}

export function ArticleRelated({ items }: ArticleRelatedProps) {
  if (items.length === 0) return null

  return (
    <section className="article-related" aria-label="Related">
      <h2 className="article-related-head t-display-md">Related</h2>
      <ul className="article-related-list" role="list">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link href={hrefFor(item)} className="article-related-item">
              <span
                className="article-related-thumb"
                style={
                  item.thumbnail
                    ? { backgroundImage: `url(${item.thumbnail})` }
                    : undefined
                }
                aria-hidden="true"
              />
              <span className="article-related-body">
                <span className="article-related-meta">
                  <span
                    className="article-related-pill"
                    data-content-type={item.type}
                  >
                    {TYPE_LABEL[item.type]}
                  </span>
                </span>
                <span className="article-related-title">{item.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
