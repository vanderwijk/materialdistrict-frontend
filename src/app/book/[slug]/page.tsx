/**
 * /book/[slug] — book detail page.
 *
 * STIJL & STRUCTUUR volgens de materiaaldetailpagina (één wit "vel" +
 * donker koop-zijkaartje), zodat books één familie zijn met de rest van
 * de detailpagina's. Hergebruikt de materials-detailshell:
 *
 *   pub-wrap.book-detail >
 *     mat-detail-wrap                         (grid: vel | sidebar)
 *       detail-back-row                       (← Back to Books)
 *       detail-sheet                          → het witte vel:
 *         DetailHeader                        (categorie/channel-pills, titel,
 *                                              meta, Save/Share)
 *         book-detail-cover-hero              (cover op zacht paneel)
 *         book-detail-about                   ("About this book" + beschrijving)
 *         book-detail-spreads                 (binnenwerk groot, onder elkaar)
 *         book-detail-specs                   (Book details als pills; publisher/
 *                                              author/year klikbaar)
 *       mat-sidebar                           → BookBuyCard + uitgever-kaartje
 *       detail-prevnext-row                   (vorige/volgende — op velbreedte)
 *     book-morebooks                          (More books — één rij witte tegels)
 *
 * Klikbare details deep-linken naar het overzicht (`/book?publisher=` /
 * `?author=` / `?year=` / `?tag=`); die filters draaien JS-side in het
 * overzicht, dus ze werken zonder extra backend-facetten.
 */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBook, listBooks } from '@/lib/api/books'
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { JsonLd, buildBook, buildBreadcrumbList, canonicalPath } from '@/lib/seo'
import { ViewLogger } from '@/components/ui/ViewLogger'
import { BookBuyCard } from './_components/BookBuyCard'
import { BookDetailActions } from './_components/BookDetailActions'
import { BookCard } from '../_components/BookCard'
import type { BookListItem } from '@/types/book'
import { PreferredSourceEndBlock } from '@/components/ui/PreferredSourceEndBlock'

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
  // Eén rij: vier boeken (zie .book-morebooks in globals.css).
  const moreBooks = items.filter((b) => b.slug !== book.slug).slice(0, 4)

  // Design-discipline categorieën boven de titel
  // (deep-link → /book?category=<slug>, hetzelfde filter als de Category-sectie
  // in de sidebar). Boeken zónder discipline (handmatig nog te categoriseren in
  // WooCommerce) vallen terug op product-tags (→ /book?tag=<slug>), zodat de kop
  // niet leeg is.
  const categoryPills: ReactNode =
    book.disciplines.length > 0 ? (
      <>
        {book.disciplines.map((d) => (
          <Link
            key={d.slug}
            href={`/book?category=${encodeURIComponent(d.slug)}`}
            className="mat-detail-tag"
          >
            {d.name}
          </Link>
        ))}
      </>
    ) : book.tags.length > 0 ? (
      <>
        {book.tags.map((t) => (
          <Link
            key={t.slug}
            href={`/book?tag=${encodeURIComponent(t.slug)}`}
            className="mat-detail-tag"
          >
            {t.name}
          </Link>
        ))}
      </>
    ) : undefined

  const channelPills = book.channels.map((c) => ({ slug: c.slug, label: c.name }))

  // Meta-regel: by [Publisher] · [n] pages · [year] — alleen ingevulde delen.
  const metaBits: ReactNode[] = [
    book.publisher ? (
      <>
        by <strong>{book.publisher}</strong>
      </>
    ) : null,
    book.pages ? <>{book.pages} pages</> : null,
    book.publicationYear ? <>{book.publicationYear}</> : null,
  ].filter(Boolean) as ReactNode[]
  const meta: ReactNode =
    metaBits.length > 0 ? (
      <>
        {metaBits.map((bit, i) => (
          <span key={i}>
            {i > 0 ? ' · ' : ''}
            {bit}
          </span>
        ))}
      </>
    ) : undefined

  // "Book details"-pills. Publisher/Author/Year linken naar het overzicht;
  // Format/Pages/ISBN zijn platte feiten (daar zoek je niet op).
  const specPills: Array<{ label: string; value: string; href?: string }> = []
  if (book.publisher)
    specPills.push({
      label: 'Publisher',
      value: book.publisher,
      href: `/book?publisher=${encodeURIComponent(book.publisher)}`,
    })
  if (book.author)
    specPills.push({
      label: 'Author',
      value: book.author,
      href: `/book?author=${encodeURIComponent(book.author)}`,
    })
  if (book.format) specPills.push({ label: 'Format', value: book.format })
  if (book.pages) specPills.push({ label: 'Pages', value: String(book.pages) })
  if (book.publicationYear)
    specPills.push({
      label: 'Year',
      value: String(book.publicationYear),
      href: `/book?year=${encodeURIComponent(String(book.publicationYear))}`,
    })
  if (book.isbn) specPills.push({ label: 'ISBN', value: book.isbn })

  const hasBody = Boolean(book.excerptHtml || book.contentHtml)
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
        <div className="mat-detail-wrap">
          <div className="detail-back-row">
            <Link href="/book" className="detail-header-back">
              <span aria-hidden="true">←</span> Back to Books
            </Link>
          </div>

          {/* Het witte vel: alle informatie over het boek. */}
          <div className="detail-sheet">
            <DetailHeader
              tags={[]}
              leadingTags={categoryPills}
              channels={channelPills}
              title={book.title}
              meta={meta}
              actions={
                <BookDetailActions
                  bookId={book.id}
                  bookSlug={book.slug}
                  bookTitle={book.title}
                />
              }
            />

            {book.cover && (
              <div className="book-detail-cover-hero">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={book.cover.url} alt={book.cover.alt || book.title} />
              </div>
            )}

            {hasBody && (
              <div className="book-detail-about">
                <p className="book-detail-about-eyebrow">About this book</p>
                {book.excerptHtml && (
                  <div
                    className="book-detail-lead"
                    dangerouslySetInnerHTML={{ __html: book.excerptHtml }}
                  />
                )}
                {longBody && <MaterialBody html={longBody} />}
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

            {/* Book details — pills; sommige klikbaar. */}
            {specPills.length > 0 && (
              <section
                className="book-detail-specs"
                aria-labelledby="book-details-title"
              >
                <h2 id="book-details-title" className="book-detail-specs-head">
                  Book details
                </h2>
                <div className="book-spec-pills">
                  {specPills.map((s) =>
                    s.href ? (
                      <Link
                        key={s.label}
                        href={s.href}
                        className="book-spec-pill book-spec-pill--link"
                      >
                        <b>{s.label}:</b>
                        <span>{s.value}</span>
                      </Link>
                    ) : (
                      <span key={s.label} className="book-spec-pill">
                        <b>{s.label}:</b>
                        {s.value}
                      </span>
                    ),
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: koop-card (donker) + uitgever-kaartje. */}
          <aside className="mat-sidebar">
            <BookBuyCard
              title={book.title}
              productId={book.wcProductId ?? book.id}
              price={book.price}
              priceExVat={book.priceExVat}
              inStock={book.inStock}
            />

            {book.publisher && (
              <Link
                href={`/book?publisher=${encodeURIComponent(book.publisher)}`}
                className="book-publisher-card"
              >
                <span className="book-publisher-card-text">
                  <span className="book-publisher-card-name">{book.publisher}</span>
                  <span className="book-publisher-card-meta">Publisher</span>
                </span>
                <span className="book-publisher-card-chevron" aria-hidden="true">
                  ›
                </span>
              </Link>
            )}
          </aside>

          <PreferredSourceEndBlock placement="book" />

          <div className="detail-prevnext-row">
            <BookPrevNext prev={prev} next={next} />
          </div>
        </div>
      </article>

      {moreBooks.length > 0 && (
        <section
          className="mat-morefrombrand book-morebooks"
          aria-labelledby="more-books-title"
        >
          <header className="mat-morefrombrand-header">
            <h2
              id="more-books-title"
              className="mat-section-title mat-morefrombrand-heading"
            >
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

      <ViewLogger objectType="book" objectId={book.id} />
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
