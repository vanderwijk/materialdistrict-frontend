/**
 * `/faq` — Frequently Asked Questions.
 * ----------------------------------------------------------------------
 * Eigen route i.p.v. de generieke `[pageSlug]`-template, om twee redenen:
 *
 *  1. **Uitklapbare vragen.** Een FAQ als doorlopend proza dwingt je te
 *     scrollen langs antwoorden die je niet zocht. Gebouwd op native
 *     `<details>/<summary>`: werkt zonder JavaScript, is toetsenbord-
 *     toegankelijk en heeft geen client-component nodig.
 *  2. **`FAQPage`-structured data.** Levert uitgeklapte antwoorden in de
 *     Google-resultaten. Kan alleen als we de vraag/antwoord-paren kennen,
 *     dus moet de HTML uit elkaar getrokken worden.
 *
 * De inhoud blijft in WordPress (page-slug `faq`) — de redactie schrijft,
 * deze route rendert. Verwachte structuur, zoals het importscript hem
 * wegschrijft: `<h2>` = categorie, `<h3>` = vraag, alles daarna tot de
 * volgende kop = antwoord. Kopt de HTML niet zo, dan valt de pagina terug
 * op de gewone prose-weergave i.p.v. leeg te renderen.
 *
 * `faq` is daarom uit `PAGE_SLUG_MAP` gehaald: een statisch route-segment
 * wint altijd van het dynamische `[pageSlug]`, dus het stond er dubbel in.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import { MaterialBody } from '@/app/material/[slug]/_components/MaterialBody'

const WP_SLUG = 'faq'

export const dynamicParams = false

interface FaqItem {
  question: string
  answerHtml: string
}

interface FaqSection {
  heading: string
  items: FaqItem[]
}

/** Verwijdert tags en zet entiteiten om — voor JSON-LD en `<summary>`. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splitst de WP-HTML in secties (`<h2>`) met vragen (`<h3>`).
 * Geeft een lege array terug als de structuur niet herkend wordt; de
 * aanroeper valt dan terug op de gewone prose-rendering.
 */
function parseFaq(html: string): FaqSection[] {
  if (!/<h3[\s>]/i.test(html)) return []

  const sections: FaqSection[] = []
  // Splits eerst op h2. Het eerste fragment kan een intro zonder kop zijn.
  const byH2 = html.split(/<h2[^>]*>/i)
  const chunks: Array<{ heading: string; body: string }> = []

  byH2.forEach((chunk, index) => {
    if (index === 0) {
      if (/<h3[\s>]/i.test(chunk)) chunks.push({ heading: '', body: chunk })
      return
    }
    const close = chunk.search(/<\/h2>/i)
    if (close === -1) return
    chunks.push({
      heading: toPlainText(chunk.slice(0, close)),
      body: chunk.slice(close + 5),
    })
  })

  for (const chunk of chunks) {
    const parts = chunk.body.split(/<h3[^>]*>/i)
    const items: FaqItem[] = []

    parts.forEach((part, index) => {
      if (index === 0) return
      const close = part.search(/<\/h3>/i)
      if (close === -1) return
      const question = toPlainText(part.slice(0, close))
      const answerHtml = part.slice(close + 5).trim()
      if (question && toPlainText(answerHtml)) {
        items.push({ question, answerHtml })
      }
    })

    if (items.length > 0) {
      sections.push({ heading: chunk.heading, items })
    }
  }

  return sections
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_SLUG)
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }
  return buildPageMetadata(page, '/faq')
}

export default async function FaqPage() {
  const page = await getPage(WP_SLUG)
  if (!page) notFound()

  const sections = parseFaq(page.contentHtml)
  const allItems = sections.flatMap((section) => section.items)

  // FAQPage-schema. Alleen wegschrijven als er echt vraag/antwoord-paren
  // zijn — een leeg schema is erger dan geen schema.
  const jsonLd =
    allItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: allItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: toPlainText(item.answerHtml),
            },
          })),
        }
      : null

  return (
    <main className="ov-wrap-single">
      <h1 className="page-title">{page.title}</h1>

      {sections.length === 0 ? (
        // Terugval: structuur niet herkend, toon de pagina gewoon als proza.
        <MaterialBody html={page.contentHtml} />
      ) : (
        <div className="faq-wrap">
          {sections.map((section) => (
            <section className="faq-section" key={section.heading || 'intro'}>
              {section.heading && (
                <h2 className="faq-section-title">{section.heading}</h2>
              )}
              {section.items.map((item) => (
                <details className="faq-item" key={item.question}>
                  <summary className="faq-q">
                    <span className="faq-q-text">{item.question}</span>
                    <svg
                      className="faq-chevron"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <polyline
                        points="6 9 12 15 18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </summary>
                  <div
                    className="faq-a"
                    dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                  />
                </details>
              ))}
            </section>
          ))}
        </div>
      )}

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </main>
  )
}
