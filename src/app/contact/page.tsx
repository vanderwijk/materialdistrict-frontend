/**
 * `/contact` — contactpagina.
 * ======================================================================
 * Deze route bestond niet. Dat was een gat: de footer had alleen een
 * mailadres en telefoonnummer, en alle "contact us"-verwijzingen in de FAQ,
 * op de Innovation Fund-pagina en bij de membership-CTA's wezen naar een 404.
 *
 * **Bewust nog géén formulier.** Er is geen algemeen contact-endpoint in de
 * backend — `/api/get-in-touch` en `/api/sample-request` hangen allebei aan een
 * materiaal of merk en vereisen dat je ingelogd bent, dus die zijn hier niet
 * bruikbaar. Een formulier dat er wel staat maar niets verstuurt is erger dan
 * geen formulier: de bezoeker denkt dat zijn bericht aankomt.
 *
 * Daarom: onderwerpkeuze die een voorgeadresseerde mail opent. Werkt vanaf dag
 * één, zonder backend, en het onderwerp komt al goed binnen zodat de mail bij
 * de juiste persoon terechtkomt. Zodra er een `POST /md/v2/contact` is, kan
 * hier een echt formulier overheen — de onderwerpindeling blijft dan gelijk.
 *
 * Queryparams vanaf `/become-a-partner` (`?subject=membership&tier=plus`)
 * markeren de Brand Membership-kaart en vullen de mailto-onderwerpregel.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { canonicalPath } from '@/lib/seo/urls'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact MaterialDistrict about editorial submissions, memberships, the ' +
    'Innovation Fund, events, publications, exhibitions or technical support.',
  alternates: { canonical: canonicalPath('/contact') },
}

const INBOX = 'info@materialdistrict.com'

interface ContactTopic {
  id: string
  title: string
  desc: string
  /** Onderwerpregel van de mail — zorgt dat hij intern goed doorgezet wordt. */
  subject: string
}

const TOPICS: ContactTopic[] = [
  {
    id: 'editorial',
    title: 'Editorial and news',
    desc: 'Share a relevant press release, research development, project or material innovation with our editorial team.',
    subject: 'Editorial submission',
  },
  {
    id: 'membership',
    title: 'Brand Membership',
    desc: 'Ask about listing a material, a Basic, Plus or Partner membership, and the best way to present your brand.',
    subject: 'Brand Membership',
  },
  {
    id: 'insider',
    title: 'Insider Membership',
    desc: 'Get help with your membership, benefits, billing or access.',
    subject: 'Insider Membership',
  },
  {
    id: 'event',
    title: 'MaterialDistrict Utrecht',
    desc: 'Ask about visiting, exhibiting, partnerships, the programme or practical event information.',
    subject: 'MaterialDistrict Utrecht',
  },
  {
    id: 'innovation-fund',
    title: 'Innovation Fund',
    desc: 'Apply for support, or ask whether your innovation qualifies.',
    subject: 'Innovation Fund application',
  },
  {
    id: 'books',
    title: 'Books and publications',
    desc: 'Ask about orders, deliveries, bulk purchases or taking part in a publication.',
    subject: 'Books and publications',
  },
  {
    id: 'exhibitions',
    title: 'Material exhibitions',
    desc: 'Discuss taking part in a curated exhibition, or a collaboration at another location.',
    subject: 'Material exhibitions',
  },
  {
    id: 'support',
    title: 'Technical support',
    desc: 'Get help with signing in, account access, profiles or website functionality.',
    subject: 'Technical support',
  },
  {
    id: 'general',
    title: 'General enquiry',
    desc: 'Use this when none of the subjects above applies.',
    subject: 'General enquiry',
  },
]

function mailto(subject: string): string {
  return `mailto:${INBOX}?subject=${encodeURIComponent(subject)}`
}

function membershipSubject(tier: string | undefined): string {
  if (!tier) return 'Brand Membership'
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return `Brand Membership — ${label}`
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; tier?: string }>
}) {
  const params = await searchParams
  const subjectKey = (params.subject ?? '').toLowerCase()
  const highlightedId =
    subjectKey === 'membership' || subjectKey === 'brand-membership'
      ? 'membership'
      : TOPICS.some((t) => t.id === subjectKey)
        ? subjectKey
        : null

  return (
    <main className="ed-page">
      <header className="ed-hero">
        <div className="ed-hero-inner">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <p className="ed-eyebrow">Contact</p>
          <h1 className="ed-title">How can we help?</h1>
          <div className="ed-hero-lede">
            <p>
              Choose the subject that best matches your question. We will make
              sure it reaches the right person.
            </p>
          </div>
        </div>
      </header>

      <div className="ed-body">
        <section className="ed-section">
          <div className="ct-grid">
            {TOPICS.map((topic) => {
              const isHighlighted = highlightedId === topic.id
              const subject =
                topic.id === 'membership'
                  ? membershipSubject(params.tier)
                  : topic.subject

              return (
                <a
                  className={`ct-card${isHighlighted ? ' is-highlighted' : ''}`}
                  key={topic.id}
                  href={mailto(subject)}
                  id={topic.id === 'membership' ? 'brand-membership' : undefined}
                >
                  <span className="ct-card-title">{topic.title}</span>
                  <span className="ct-card-desc">{topic.desc}</span>
                  <span className="ct-card-action">Send an email</span>
                </a>
              )
            })}
          </div>
        </section>

        <section className="ed-section">
          <h2 className="ed-section-title">Contact details</h2>
          <div className="ct-details">
            <address className="ct-address">
              MaterialDistrict B.V.
              <br />
              Amsterdamsestraatweg 43-A2
              <br />
              1411 AX Naarden
              <br />
              The Netherlands
            </address>
            <div className="ct-direct">
              <a href={`mailto:${INBOX}`} className="text-link">
                {INBOX}
              </a>
              <a href="tel:+31207130650" className="text-link">
                +31 (0)20 71 30 650
              </a>
            </div>
          </div>
          <p className="ct-note">
            Looking for an answer straight away? Many questions are covered in
            the{' '}
            <Link href="/faq" className="text-link">
              frequently asked questions
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
