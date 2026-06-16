/**
 * `/books/[slug]` — book-detailpagina (Designerbooks-layout).
 *
 * Server Component. Flow van boven naar onder:
 *   header        — breadcrumb + titel
 *   hero          — cover (links) · koop-kolom (korte beschrijving + BookBuyCard)
 *   body          — volledige beschrijving
 *   spreads       — binnenwerk-foto's uit de product-gallery (images[1..])
 *   specs         — "Additional information"-tabel (attributes)
 *   more books    — BookCard-grid
 *
 * Cover = images[0]; spreads = de gallery — géén afbeeldingen in tekstvakken.
 * Auteur/format/jaar/pagina's komen uit attributes; ontbreken ze nog, dan
 * worden die rijen simpelweg overgeslagen (placeholder-bestendig).
 *
 * Koop-kolom: BookBuyCard is auth-aware (Insider-prijs als weergave). Kopen
 * loopt via add-to-cart → /cart → /checkout.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { getBook, listBooks } from '@/lib/api/books'
import { JsonLd, buildBook, buildBreadcrumbList } from '@/lib/seo'
import { MaterialBody } from '@/app/materials/[slug]/_components/MaterialBody'
import { BookCard } from '../_components/BookCard'
import { BookBuyCard } from './_components/BookBuyCard'

const MORE_SCAN = 24
const MORE_BOOKS = 6

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

  const specRows = [
    book.author && { label: 'Authors', value: book.author },
    book.format && { label: 'Format', value: book.format },
    book.isbn && { label: 'ISBN', value: book.isbn },
    book.pages && { label: 'Number of pages', value: String(book.pages) },
    book.publicationYear && {
      label: 'Year of Publishing',
      value: String(book.publicationYear),
    },
    book.publisher && { label: 'Publisher', value: book.publisher },
  ].filter(Boolean) as Array<{ label: string; value: string }>

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
      <article className="book-detail ov-wrap-single">
        <header className="book-detail-head">
          <Breadcrumb
            items={[{ label: 'Books', href: '/books' }, { label: book.title }]}
          />
          <h1 className="t-display-lg book-detail-title">{book.title}</h1>
        </header>

        <div className="book-detail-hero">
          <div className="book-detail-hero-cover">
            {book.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover.url} alt={book.cover.alt || book.title} />
            )}
          </div>

          <div className="book-detail-hero-buy">
            {book.excerptHtml && (
              <div className="book-detail-shortdesc">
                <MaterialBody html={book.excerptHtml} />
              </div>
            )}
            <BookBuyCard
              title={book.title}
              productId={book.wcProductId ?? book.id}
              price={book.price}
              inStock={book.inStock}
            />
          </div>
        </div>

        {book.contentHtml && (
          <section className="book-detail-body">
            <MaterialBody html={book.contentHtml} />
          </section>
        )}

        {book.gallery.length > 0 && (
          <section className="book-detail-spreads" aria-label="Inside this book">
            {book.gallery.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${img.url}-${i}`}
                src={img.url}
                alt={img.alt || `${book.title} — spread ${i + 1}`}
                loading="lazy"
              />
            ))}
          </section>
        )}

        {specRows.length > 0 && (
          <section className="book-detail-specs">
            <h2 className="book-detail-specs-head">Additional information</h2>
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

        {more.length > 0 && (
          <section className="book-more" aria-label="More books">
            <h2 className="book-more-head t-display-md">More books</h2>
            <div className="book-grid">
              {more.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        )}
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
