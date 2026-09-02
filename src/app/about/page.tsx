/**
 * `/about` — wie MaterialDistrict is.
 *
 * Bewust gescheiden van `/our-mission`: die pagina beantwoordt waaróm we
 * bestaan, deze wie we zijn. In het eerste concept waren ze samengevoegd,
 * waardoor de geschiedenis en de praktische feiten nergens stonden.
 *
 * Tekst in WordPress (page-slug `about`), vormgeving hier.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import {
  EditorialPage,
  type EditorialImage,
  type SectionVariant,
} from '@/components/content/EditorialPage'

const WP_SLUG = 'about'

/** ISR — herstelt na een build terwijl het CMS down was. */
export const revalidate = 3600

const VARIANTS: Record<string, SectionVariant> = {
  'what-we-do-today': 'cards',
  facts: 'facts',
}

const IMAGES: Record<string, EditorialImage> = {
  'what-we-do-today': {
    src: '/images/mission/meeting.jpg',
    alt: 'Three people in conversation at a stand at MaterialDistrict Utrecht.',
    caption: 'MaterialDistrict Utrecht — where the platform becomes a room.',
    credit: 'Viorica Cernica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_SLUG)
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }
  return buildPageMetadata(page, '/about')
}

export default async function AboutPage() {
  const page = await getPage(WP_SLUG)
  if (!page) notFound()

  return (
    <EditorialPage
      title={page.title}
      eyebrow="About"
      html={page.contentHtml}
      variants={VARIANTS}
      images={IMAGES}
      footer={
        <section className="ed-cta">
          <h2 className="ed-cta-title">Want to know more?</h2>
          <div className="ed-cta-grid">
            <div className="ed-cta-card">
              <h3>Our mission</h3>
              <p>
                Why we exist, what we mean by sustainable, and the commitment we
                made for 2030.
              </p>
              <Link href="/our-mission" className="btn btn-outline">
                Read our mission
              </Link>
            </div>
            <div className="ed-cta-card">
              <h3>Get in touch</h3>
              <p>
                Editorial submissions, memberships, events, publications or
                anything else — we will point you to the right person.
              </p>
              <Link href="/contact" className="btn btn-outline">
                Contact us
              </Link>
            </div>
          </div>
        </section>
      }
    />
  )
}
