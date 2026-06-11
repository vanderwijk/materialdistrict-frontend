/**
 * `/books/[slug]` — book-detailpagina.
 *
 * Stap 3 (books-vertical). Server Component. Haalt het boek op (incl. cover) en
 * — uit één datum-gesorteerde scan — "More books" (laatste, excl. huidige).
 * Rendert de F2 detail-shell, identiek aan /talks en /articles:
 *
 *   pub-wrap > pub-layout
 *     detail-back-row   (← Books, op paper boven het vel)
 *     detail-sheet      (DetailHeader + main: cover · about)
 *     BookDetailSidebar (koop-card · book details, op paper)
 *     detail-related-row (More books)
 *
 * Prijs/Insider: de koop-card in de sidebar is auth-aware (zie BookBuyCard).
 * Add-to-cart via Store API-cart; checkout volgt in een latere fase.
 *
 * JSON-LD: Book + BreadcrumbList. notFound() bij onbekende slug.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { ContentCard } from '@/components/ui'
import { getBook, listBooks } from '@/lib/api/books'
import { JsonLd, buildBook, buildBreadcrumbList } from '@/lib/seo'
import { MaterialBody } from '@/app/materials/[slug]/_components/MaterialBody'
import { formatEur } from '@/lib/utils/format-price'
import { BookDetailSidebar } from './_components/BookDetailSidebar'

const MORE_SCAN = 24
const MORE_BOOKS = 4

interface BookDetailPageProps {
  params: Promise<{ slug: string }>
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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
      type: 'website',
      url: `/books/${book.slug}`,
      ...(book.cover?.url ? { images: [book.cover.url] } : {}),
    },
  }
}

/** "More books": laatste titels, excl. de huidige. Faalbestendig (lege lijst). */
async function getMoreBooks(currentSlug: string) {
  try {
    const { items } = await listBooks({
      perPage: MORE_SCAN,
      orderby: 'date',
      order: 'desc',
    })
    return items.filter((b) => b.slug !== currentSlug).slice(0, MORE_BOOKS)
  } catch {
    return []
  }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params

  const book = await getBook(slug)
  if (!book) notFound()

  const more = await getMoreBooks(slug)
  const bodyHtml = book.contentHtml || book.excerptHtml

  const metaText = [
    book.author,
    book.publicationYear ? String(book.publicationYear) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const bookSchema = buildBook({
    slug: book.slug,
    title: book.title,
    description: stripHtml(book.excerptHtml) || undefined,
    coverImage: book.cover?.url,
    author: book.author ? { name: book.author } : undefined,
    isbn: book.isbn ?? undefined,
    pages: book.pages ?? undefined,
    publishedAt: book.date || undefined,
    publisher: book.publisher ? { name: book.publisher } : undefined,
  })

  return (
    <>
      <article className="pub-wrap">
        <div className="pub-layout">
          <div className="detail-back-row">
            <a href="/books" className="article-detail-back">
              ← Books
            </a>
          </div>

          <div className="detail-sheet">
            <DetailHeader
              tags={[{ type: 'content', contentType: 'book' }]}
              title={book.title}
              meta={metaText || undefined}
            />

            {/* Main column */}
            <div>
              {book.cover && (
                <div className="book-detail-cover">
                  <img
                    src={book.cover.url}
                    alt={book.cover.alt || book.title}
                  />
                </div>
              )}

              {bodyHtml && (
                <section className="book-about">
                  <div className="book-about-eyebrow">About this book</div>
                  <MaterialBody html={bodyHtml} />
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <BookDetailSidebar book={book} />

          <div className="detail-related-row">
            {more.length > 0 && (
              <section className="book-more" aria-label="More books">
                <h2 className="book-more-head t-display-md">More books</h2>
                <div className="ov-grid-3">
                  {more.map((b) => (
                    <ContentCard
                      key={b.id}
                      href={`/books/${b.slug}`}
                      contentType="book"
                      showTypeBadge={false}
                      thumbRatio="portrait"
                      thumbSrc={b.cover?.thumbnailUrl ?? b.cover?.url}
                      thumbAlt={b.cover?.alt || b.title}
                      eyebrow={b.author ?? undefined}
                      title={b.title}
                      meta={
                        b.inStock
                          ? formatEur(b.price)
                          : [formatEur(b.price), 'Sold out']
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>

      <JsonLd
        data={[
          ...(bookSchema ? [bookSchema] : []),
          buildBreadcrumbList([
            { label: 'Home', url: '/' },
            { label: 'Books', url: '/books' },
            { label: book.title },
          ]),
        ]}
      />
    </>
  )
}
