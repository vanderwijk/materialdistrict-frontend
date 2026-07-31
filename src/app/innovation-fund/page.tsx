/**
 * `/innovation-fund` — de MaterialDistrict Innovation Fund.
 *
 * Deze pagina hoort in de evenement-context, niet bij Brand Membership: het
 * fonds subsidieert deelname aan MaterialDistrict Utrecht, geen lidmaatschap
 * op het platform. In het eerste concept stond het op de membershippagina,
 * waar het onvermijdelijk als korting op een abonnement gelezen werd.
 *
 * De evenementsite linkt naar deze route (`/innovation-fund`). Wijzigt de
 * slug, dan breekt die link.
 *
 * Tekst in WordPress (page-slug `innovation-fund`), vormgeving hier.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import { EditorialPage, type SectionVariant } from '@/components/content/EditorialPage'

const WP_SLUG = 'innovation-fund'

const VARIANTS: Record<string, SectionVariant> = {
  'what-the-fund-offers': 'highlight',
  'who-can-apply': 'checklist',
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_SLUG)
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }
  return buildPageMetadata(page, '/innovation-fund')
}

export default async function InnovationFundPage() {
  const page = await getPage(WP_SLUG)
  if (!page) notFound()

  return (
    <EditorialPage
      title={page.title}
      eyebrow="For start-ups"
      html={page.contentHtml}
      variants={VARIANTS}
      footer={
        <section className="ed-cta">
          <h2 className="ed-cta-title">Think you qualify?</h2>
          <div className="ed-cta-grid">
            <div className="ed-cta-card">
              <h3>Apply</h3>
              <p>
                Tell us what you have developed, which theme it belongs to and
                when your company was founded.
              </p>
              <Link href="/contact" className="btn btn-outline">
                Contact us
              </Link>
            </div>
            <div className="ed-cta-card">
              <h3>Our ambition for 2030</h3>
              <p>
                The fund is one half of a commitment. The other half is what we
                choose to put on the platform.
              </p>
              <Link href="/our-mission" className="btn btn-outline">
                Read our mission
              </Link>
            </div>
          </div>
        </section>
      }
    />
  )
}
