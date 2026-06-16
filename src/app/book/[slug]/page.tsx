/**
 * /book/[slug] — book detail page.
 *
 * STRUCTUUR volgens Designerbooks, STIJL volgens MaterialDistrict. Gebruikt de
 * gedeelde book-detail-klassen uit globals.css (book-detail-hero / -hero-cover /
 * -hero-buy / -shortdesc / -body / -spreads / -specs + book-spec-table):
 *
 *   pub-wrap.book-detail >
 *     detail-back-row            (← Back to Books)
 *     book-detail-head           (titel)
 *     book-detail-hero           → cover (links) + koop-kolom (rechts):
 *                                  korte beschrijving + BookBuyCard
 *     book-detail-body           (lange beschrijving)
 *     book-detail-spreads        (binnenwerk groot, ONDER ELKAAR — geen filmstrip)
 *     book-detail-specs          (Book details als nette tabel)
 *     detail-prevnext-row
 *   mat-morefrombrand            (More books, buiten het vel)
 *
 * Prijs ex btw prominent (koop-card), incl btw klein; BTW bij checkout als regel.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBook, listBooks } from '@/lib/api/books'
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'
import { JsonLd, buildBook, buildBreadcrumbList, canonicalPath } from '@/lib/seo'
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
  const path = canonicalPath(`/book/${book.slug}`)

  return {
    title: book.title,
    description,
    alternates: { canonical: path },
    openGraph: { title: book.title, description, type: 'book', url: path },
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

  // "Book details"-tabel (alleen ingevulde velden).
  const specRows: Array<{ label: string; value: string }> = []
  if (book.publisher) specRows.push({ label: 'Publisher', value: book.publisher })
  if (book.author) specRows.push({ label: 'Author', value: book.author })
  if (book.format) specRows.push({ label: 'Format', value: book.format })
  if (book.pages) specRows.push({ label: 'Pages', value: String(book.pages) })
  if (book.publicationYear)
    specRows.push({ label: 'Year', value: String(book.publicationYear) })
  if (book.isbn) specRows.push({ label: 'ISBN', value: book.isbn })

  const longBody =
    book.contentHtml && book.contentHtml !== book.excerptHtml
      ? book.contentHtml
      : ''

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
      <article className="pub-wrap book-detail">
        <div className="detail-back-row">
          <Link href="/book" className="detail-header-back">
            <span aria-hidden="true">←</span> Back to Books
          </Link>
        </div>

        <div className="book-detail-head">
          <h1 className="t-display-lg book-detail-title">{book.title}</h1>
        </div>

        {/* Cover (links) + korte beschrijving + koop-card (rechts). */}
        <div className="book-detail-hero">
          <div className="book-detail-hero-cover">
            {book.cover ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={book.cover.url} alt={book.cover.alt || book.title} />
            ) : (
              <div className="book-card-cover-empty" aria-hidden="true" />
            )}
          </div>

          <div className="book-detail-hero-buy">
            {book.excerptHtml && (
              <div
                className="book-detail-shortdesc"
                dangerouslySetInnerHTML={{ __html: book.excerptHtml }}
              />
            )}
            <BookBuyCard
              title={book.title}
              productId={book.wcProductId ?? book.id}
              price={book.price}
              priceExVat={book.priceExVat}
              inStock={book.inStock}
            />
          </div>
        </div>

        {/* Lange beschrijving. */}
        {longBody && (
          <div className="book-detail-body">
            <MaterialBody html={longBody} />
          </div>
        )}

        {/* Binnenwerk-spreads — groot en onder elkaar (geen filmstrip). */}
        {book.gallery.length > 0 && (
          <div className="book-detail-spreads">
            {book.gallery.map((img, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={`${img.url}-${i}`}
                src={img.url}
                alt={img.alt || `${book.title} — spread ${i + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Book details — nette tabel. */}
        {specRows.length > 0 && (
          <section className="book-detail-specs" aria-labelledby="book-details-title">
            <h2 id="book-details-title" className="book-detail-specs-head">
              Book details
            </h2>
            <dl className="book-spec-table">
              {specRows.map((row) => (
                <div key={row.label} className="book-spec-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="detail-prevnext-row">
          <BookPrevNext prev={prev} next={next} />
        </div>
      </article>

      {moreBooks.length > 0 && (
        <section className="mat-morefrombrand" aria-labelledby="more-books-title">
          <header className="mat-morefrombrand-header">
            <h2 id="more-books-title" className="mat-section-title mat-morefrombrand-heading">
              More books
            </h2>
            <Link href="/book" className="mat-morefrombrand-viewall">
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
            { label: 'Books', url: '/book' },
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
        <Link href={`/book/${prev.slug}`} className="mat-prevnext-link">
          <span className="mat-prevnext-arrow" aria-hidden="true">←</span>
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {(prev.cover?.thumbnailUrl ?? prev.cover?.url) ? (
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
          href={`/book/${next.slug}`}
          className="mat-prevnext-link mat-prevnext-link--right"
        >
          <span className="mat-prevnext-label">
            <span className="mat-prevnext-eyebrow">Next</span>
            <span className="mat-prevnext-title">{next.title}</span>
          </span>
          <span className="mat-prevnext-thumb" aria-hidden="true">
            {(next.cover?.thumbnailUrl ?? next.cover?.url) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={next.cover?.thumbnailUrl ?? next.cover?.url} alt="" />
            ) : (
              <span className="mat-prevnext-thumb-placeholder" />
            )}
          </span>
          <span className="mat-prevnext-arrow" aria-hidden="true">→</span>
        </Link>
      )}
    </nav>
  )
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
