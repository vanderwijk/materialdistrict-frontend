/**
 * BookDetailSidebar
 * ----------------------------------------------------------------------
 * Sidebar voor de book-detailpagina (grid-kolom 2, op paper). Bovenaan de
 * auth-aware koop-card, daaronder een "Book details"-card met de bibliografie
 * (auteur, ISBN, uitgever, pagina's, jaar). Rijen zonder waarde worden
 * overgeslagen. Hergebruikt de gedeelde `article-detail-sidebar` /
 * `article-side-*`-CSS; alleen de meta-rijen zijn book-specifiek (§BOOKS).
 *
 * Server-component: alleen de geneste `BookBuyCard` is client (auth-aware).
 */

import type { Book } from '@/types/book'
import { BookBuyCard } from './BookBuyCard'

export interface BookDetailSidebarProps {
  book: Book
}

export function BookDetailSidebar({ book }: BookDetailSidebarProps) {
  const rows: Array<{ label: string; value: string }> = []
  if (book.author) rows.push({ label: 'Author', value: book.author })
  if (book.isbn) rows.push({ label: 'ISBN', value: book.isbn })
  if (book.publisher) rows.push({ label: 'Publisher', value: book.publisher })
  if (book.pages) rows.push({ label: 'Pages', value: String(book.pages) })
  if (book.publicationYear) {
    rows.push({ label: 'Published', value: String(book.publicationYear) })
  }

  return (
    <aside className="article-detail-sidebar">
      <BookBuyCard
        title={book.title}
        price={book.price}
        inStock={book.inStock}
        buyUrl={book.buyUrl}
      />

      {rows.length > 0 && (
        <div className="article-side-card">
          <div className="article-side-eyebrow">Book details</div>
          {rows.map((row) => (
            <div key={row.label} className="book-meta-row">
              <span className="book-meta-row-key">{row.label}</span>
              <span className="book-meta-row-value">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
