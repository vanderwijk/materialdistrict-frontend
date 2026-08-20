/**
 * `/our-mission` — de missiepagina.
 *
 * Eigen ontworpen route i.p.v. de generieke `[pageSlug]`-template. De tekst
 * blijft in WordPress (page-slug `our-mission`); `EditorialPage` bepaalt de
 * vormgeving per sectie.
 *
 * **Beeldkeuze (04-08-2026, besluit Jeroen).** Eerder stond hier een band met
 * vier materiaalfoto's uit de database, onder de aanname dat een missiepagina
 * over materiaalinnovatie materialen moet tonen. Dat was de verkeerde lezing:
 * MaterialDistrict is een platform dat mensen verbindt, met het materiaal als
 * matchmaker. Het beeld toont daarom mensen — gesprekken bij een stand, handen
 * die monsters kiezen, de vloer van MaterialDistrict Utrecht.
 *
 * Beeld staat niet meer gebundeld bovenaan maar verdeeld over de pagina, één
 * per inhoudelijk blok. Gekoppeld aan de sectiekop en niet aan een volgnummer,
 * dus schuift de redactie een sectie op, dan schuift het beeld mee.
 *
 * Wijzigt de redactie een `<h2>`, dan valt die sectie terug op `prose` en komt
 * het bijbehorende beeld te vervallen. Bewust: liever een pagina zonder foto
 * dan een pagina die breekt.
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
import { MdImage } from '@/components/ui/MdImage'

const WP_SLUG = 'our-mission'

const VARIANTS: Record<string, SectionVariant> = {
  'what-we-mean-by-sustainable': 'cards',
  'our-ambition-for-2030': 'highlight',
  'more-than-an-online-platform': 'checklist',
}

/**
 * Beeld per sectie. Sleutel = de sectiekop via `sectionKey()`.
 * Wil je een foto wisselen: alleen `src`, `alt` en `caption` aanpassen.
 */
const IMAGES: Record<string, EditorialImage> = {
  'why-materialdistrict-exists': {
    src: '/images/mission/conversation.jpg',
    alt: 'A manufacturer explains a material to two visitors at MaterialDistrict Utrecht.',
    caption: 'A material only travels as far as the conversation around it.',
    credit: 'Viorica Cernica',
  },
  'from-innovation-to-application': {
    src: '/images/mission/samples.jpg',
    alt: 'A visitor picks up a material sample from a table of samples.',
    caption: 'The moment that matters: a specifier choosing.',
    credit: 'Viorica Cernica',
  },
  'our-ambition-for-2030': {
    src: '/images/mission/circular.jpg',
    alt: 'Three people discussing circular building materials at a stand marked “circulair”.',
    caption: 'Circular materials at MaterialDistrict Utrecht.',
    credit: 'Viorica Cernica',
  },
  'more-than-an-online-platform': {
    src: '/images/mission/sample-tables.jpg',
    alt: 'Visitors browsing long tables of material samples in the Werkspoorkathedraal.',
    caption: 'MaterialDistrict Utrecht, Werkspoorkathedraal.',
    wide: true,
  },
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

  return (
    <EditorialPage
      title={page.title}
      eyebrow="Our mission"
      html={page.contentHtml}
      variants={VARIANTS}
      images={IMAGES}
      afterHero={
        <figure className="ed-figure ed-figure-lead">
          <MdImage
            src="/images/mission/hall.jpg"
            role="detail-hero"
            alt="The exhibition floor of MaterialDistrict Utrecht in the Werkspoorkathedraal."
            priority
          />
        </figure>
      }
      footer={
        <section className="ed-route">
          <div className="ed-route-inner">
            <div className="ed-route-copy">
              <h2 className="ed-route-title">Choose your route</h2>
              <p className="ed-route-lede">
                Two ways in — one for the people who specify materials, one for
                the people who make them.
              </p>
            </div>
            <div className="ed-route-grid">
              <div
                className="ed-route-card ed-route-card-pro"
                data-audience="For specifiers"
              >
                <h3>I am a professional</h3>
                <p>
                  Discover relevant materials, follow the channels that matter
                  to your practice and build your own material knowledge.
                </p>
                <Link href="/register" className="btn btn-lg">
                  Create a free account
                </Link>
              </div>
              <div
                className="ed-route-card ed-route-card-brand"
                data-audience="For manufacturers"
              >
                <h3>I am a brand</h3>
                <p>
                  Bring your materials to the attention of architects, designers
                  and other professionals who influence specification.
                </p>
                <Link href="/become-a-partner" className="btn btn-lg">
                  See the options
                </Link>
              </div>
            </div>
          </div>
        </section>
      }
    />
  )
}
