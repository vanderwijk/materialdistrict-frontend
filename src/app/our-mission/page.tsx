/**
 * `/our-mission` — de missiepagina.
 *
 * Eigen ontworpen route i.p.v. de generieke `[pageSlug]`-template. De tekst
 * blijft in WordPress (page-slug `our-mission`); `EditorialPage` bepaalt de
 * vormgeving per sectie.
 *
 * Twee keuzes die de moeite van het onthouden waard zijn:
 *
 *  - **De ambitie 2030 krijgt een eigen getint vlak.** Dat is de scherpste
 *    publieke uitspraak die MaterialDistrict doet; als alinea tussen andere
 *    alinea's verdwijnt hij. Zie `variants` hieronder.
 *  - **Illustratie komt uit de eigen materialendatabase**, niet uit stock. Een
 *    missiepagina over materiaalinnovatie met een generieke kantoorfoto maakt
 *    het verhaal ongeloofwaardiger; de materialen zelf zijn het bewijs.
 *
 * Wijzigt de redactie een `<h2>`, dan valt die sectie terug op `prose`. Dat is
 * bewust: liever een sectie die er gewoon uitziet dan een pagina die breekt.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPage, listMaterials } from '@/lib/api'
import { buildPageMetadata } from '@/lib/seo/page-metadata'
import { EditorialPage, type SectionVariant } from '@/components/content/EditorialPage'

const WP_SLUG = 'our-mission'

/** Aantal materialen in de beeldband. Vier past op alle breedtes. */
const STRIP_COUNT = 4

const VARIANTS: Record<string, SectionVariant> = {
  'what-we-mean-by-sustainable': 'cards',
  'our-ambition-for-2030': 'highlight',
  'more-than-an-online-platform': 'checklist',
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_SLUG)
  if (!page) {
    return { title: 'Page not found', robots: { index: false, follow: false } }
  }
  return buildPageMetadata(page, '/our-mission')
}

export default async function OurMissionPage() {
  const page = await getPage(WP_SLUG)
  if (!page) notFound()

  // Illustratie uit de eigen database. Faalt dit, dan valt de band gewoon weg;
  // de pagina mag er niet op stuklopen.
  let strip: Array<{ id: number; title: string; image: string; href: string }> = []
  try {
    const { items } = await listMaterials({ perPage: 12 })
    strip = items
      .map((m) => {
        const image = m.hero?.sourceUrl ?? null
        if (!image) return null
        return {
          id: m.id,
          title: m.title,
          image,
          href: m.link || `/material/${m.slug}/`,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, STRIP_COUNT)
  } catch {
    strip = []
  }

  return (
    <EditorialPage
      title={page.title}
      eyebrow="Our mission"
      html={page.contentHtml}
      variants={VARIANTS}
      afterHero={
        strip.length > 0 ? (
          <div className="ed-strip" aria-label="Materials from our database">
            {strip.map((item) => (
              <Link key={item.id} href={item.href} className="ed-strip-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" loading="lazy" />
                <span className="ed-strip-caption">{item.title}</span>
              </Link>
            ))}
          </div>
        ) : null
      }
      footer={
        <section className="ed-cta">
          <h2 className="ed-cta-title">Choose your route</h2>
          <div className="ed-cta-grid">
            <div className="ed-cta-card">
              <h3>I am a professional</h3>
              <p>
                Discover relevant materials, follow the channels that matter to
                your practice and build your own material knowledge.
              </p>
              <Link href="/register" className="btn btn-outline">
                Create a free account
              </Link>
            </div>
            <div className="ed-cta-card">
              <h3>I am a brand</h3>
              <p>
                Bring your materials to the attention of architects, designers
                and other professionals who influence specification.
              </p>
              <Link href="/become-a-partner" className="btn btn-outline">
                See the options
              </Link>
            </div>
          </div>
        </section>
      }
    />
  )
}
