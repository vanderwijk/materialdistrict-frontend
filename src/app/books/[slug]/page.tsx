/**
 * /books/[slug] — book detail page.
 *
 * Spiegelt de material-detailshell 1-op-1 (zelfde witte "vel" op de paper-
 * achtergrond), zodat book-detail één familie is met material-detail:
 *
 *   pub-wrap > mat-detail-wrap >
 *     detail-back-row     (← Back to Books)
 *     detail-sheet        (wit vel)
 *       DetailHeader      (titel + meta: by publisher · pages · year)
 *       mat-main
 *         BookGallery     (cover + spreads, hero + filmstrip)
 *         DetailReadingTools
 *         "About this book"
 *         excerpt + body
 *         "Book details"  (mat-properties-pills)
 *     mat-sidebar         (BookBuyCard — donker ink-paneel, auth-aware)
 *     detail-prevnext-row (prev/next)
 *   MoreBooks             (buiten het vel)
 *
 * Prijzen: de koop-card toont de WC-prijs (incl. btw, = wat je betaalt). Het
 * overzicht toont ex btw; dat verschil is bewust (browse ex, koop incl).
 */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { DetailReadingTools } from '@/components/ui/DetailReadingTools'
import { getBook, listBooks } from '@/lib/api/books'
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'
import { JsonLd, buildBook, buildBreadcrumbList } from '@/lib/seo'
import { BookGallery } from './_components/BookGallery'
import { BookBuyCard } from './_components/BookBuyCard'
import { BookCard } from '../_components/BookCard'
import type { BookListItem } from '@/types/book'

interface BookDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    return { title: 'Book not found', robots: { index: false, follow: false } }
  }

  const description = stripHtml(book.excerptHtml) || undefined

  return {
    title: book.title,
    description,
    alternates: { canonical: `/books/${book.slug}` },
    openGraph: {
      title: book.title,
      description,
      type: 'book',
      url: `/books/${book.slug}`,
    },
  }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    notFound()
  }

  // Eén lijst-fetch (newest-first) voor prev/next + "More books".
  const list = await listBooks({ page: 1, perPage: 100 })
  const items = list.items
  const idx = items.findIndex((b) => b.slug === book.slug)
  const prev = idx > 0 ? items[idx - 1] : null
  const next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null
  const moreBooks = items.filter((b) => b.slug !== book.slug).slice(0, 6)

  // Meta-regel: by [publisher] · [pages] pages · [year]
  const metaParts: Array<{ key: string; node: ReactNode }> = []
  if (book.publisher) {
    metaParts.push({
      key: 'publisher',
      node: (
        <>
          by <strong>{book.publisher}</strong>
        </>
      ),
    })
  }
  if (book.pages) metaParts.push({ key: 'pages', node: <>{book.pages} pages</> })
  if (book.format) metaParts.push({ key: 'format', node: <>{book.format}</> })
  if (book.publicationYear)
    metaParts.push({ key: 'year', node: <>{book.publicationYear}</> })

  // "Book details"-pills (alleen ingevulde velden).
  const detailPills: Array<{ label: string; value: string }> = []
  if (book.publisher) detailPills.push({ label: 'Publisher', value: book.publisher })
  if (book.format) detailPills.push({ label: 'Format', value: book.format })
  if (book.pages) detailPills.push({ label: 'Pages', value: String(book.pages) })
  if (book.publicationYear)
    detailPills.push({ label: 'Year', value: String(book.publicationYear) })
  if (book.isbn) detailPills.push({ label: 'ISBN', value: book.isbn })

  const hasBody = Boolean(book.excerptHtml || book.contentHtml)

  const bookJsonLd = buildBook({
    slug: book.slug,
    title: book.title,
    description: stripHtml(book.excerptHtml) || undefined,
    coverImage: book.cover?.url,
    author: book.author ? { name: book.author } : undefined,
    isbn: book.isbn ?? undefined,
    pages: book.pages ?? undefined,
    publishedAt: book.publicationYear ? `${book.publicationYear}` : undefined,
    publisher: book.publisher ? { name: book.publisher } : undefined,
  })

  return (
    <>
      <article className="pub-wrap">
        <div className="mat-detail-wrap">
          <div className="detail-back-row">
            <Link href="/books" className="detail-header-back">
              <span aria-hidden="true">←</span> Back to Books
            </Link>
          </div>

          <div className="detail-sheet">
            <DetailHeader
              tags={[]}
              title={book.title}
              meta={
                metaParts.length > 0 ? (
                  <>
                    {metaParts.map((part, i) => (
                      <span key={part.key}>
                        {i > 0 && ' · '}
                        {part.node}
                      </span>
                    ))}
                  </>
                ) : undefined
              }
            />

            <div className="mat-main">
              <BookGallery
                cover={book.cover}
                gallery={book.gallery}
                title={book.title}
              />

              <DetailReadingTools />

              {hasBody && (
                <div className="detail-about-eyebrow">About this book</div>
              )}

              {book.excerptHtml && <MaterialBody html={book.excerptHtml} />}

              {book.contentHtml && book.contentHtml !== book.excerptHtml && (
                <MaterialBody html={book.contentHtml} />
              )}

              {detailPills.length > 0 && (
                <section className="mat-properties" aria-labelledby="book-details-title">
                  <h2 id="book-details-title" className="mat-section-title">
                    Book details
                  </h2>
                  <div className="mat-properties-grid">
                    <div className="mat-property-group">
                      <div className="mat-property-group-tags">
                        {detailPills.map((p) => (
                          <span key={p.label} className="mat-property-tag is-neutral">
                            <span className="mat-property-tag-key">{p.label}:</span>
                            {p.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          <aside className="mat-sidebar">
            <BookBuyCard
              title={book.title}
              productId={book.wcProductId ?? book.id}
              price={book.price}
              inStock={book.inStock}
            />
          </aside>

          <div className="detail-prevnext-row">
            <BookPrevNext prev={prev} next={next} />
          </div>
        </div>
      </article>

      {moreBooks.length > 0 && (
        <section className="mat-morefrombrand" aria-labelledby="more-books-title">
          <header className="mat-morefrombrand-header">
            <h2 id="more-books-title" className="mat-section-title mat-morefrombrand-heading">
              More books
            </h2>
            <Link href="/books" className="mat-morefrombrand-viewall">
              View all <span aria-hidden="true">→</span>
            </Link>
          </header>
          <div className="mat-morefrombrand-grid">
            {moreBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={[
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Books', url: '/books' },
            { label: book.title },
          ]),
          bookJsonLd,
        ]}
      />
    </>
  )
}

/** Server-side prev/next (newest-first lijstvolgorde), mirror van mat-prevnext. */
function BookPrevNext({
  prev,
  next,
}: {
  prev: BookListItem | null
  next: BookListItem | null
}) {
  if (!prev && !next) return null

  return (
    <nav className="mat-prevnext" aria-label="Book navigation">
      {prev ? (
        <Link href={`/books/${prev.slug}`} className="mat-prevnext-link">
          <span className="mat-prevnext-arrow" aria-hidden="true">
            ←
          </span>
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {prev.cover?.thumbnailUrl ?? prev.cover?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={prev.cover?.thumbnailUrl ?? prev.cover?.url} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Previous</span>
            <span className="mat-prevnext-title">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="mat-prevnext-spacer" aria-hidden="true" />
      )}

      {next && (
        <Link
          href={`/books/${next.slug}`}
          className="mat-prevnext-link mat-prevnext-link--right"
        >
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Next</span>
            <span className="mat-prevnext-title">{next.title}</span>
          </span>
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {next.cover?.thumbnailUrl ?? next.cover?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={next.cover?.thumbnailUrl ?? next.cover?.url} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      )}
    </nav>
  )
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
