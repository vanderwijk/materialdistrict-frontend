/**
 * `/contact` — contactpagina met echt formulier.
 *
 * Posts to `POST /api/contact/` → WordPress `/md/v2/contact` → SES to
 * info@materialdistrict.com. Topic list stays the same as the earlier
 * mailto cards so become-a-partner deep links keep working.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ContactForm } from '@/components/contact/ContactForm'
import {
  CONTACT_INBOX,
  resolveContactTopicId,
} from '@/lib/config/contact'
import { canonicalPath } from '@/lib/seo/urls'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact MaterialDistrict about editorial submissions, memberships, the ' +
    'Innovation Fund, events, publications, exhibitions or technical support.',
  alternates: { canonical: canonicalPath('/contact') },
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; tier?: string }>
}) {
  const params = await searchParams
  const initialTopicId = resolveContactTopicId(params.subject)

  return (
    <main className="ed-page">
      <header className="ed-hero">
        <div className="ed-hero-inner">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <p className="ed-eyebrow">Contact</p>
          <h1 className="ed-title">How can we help?</h1>
          <div className="ed-hero-lede">
            <p>
              Choose the subject that best matches your question, then send us
              a short message. We will make sure it reaches the right person.
            </p>
          </div>
        </div>
      </header>

      <div className="ed-body">
        <section className="ed-section">
          <ContactForm
            initialTopicId={initialTopicId}
            initialTier={params.tier ?? null}
          />
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
              <a href={`mailto:${CONTACT_INBOX}`} className="text-link">
                {CONTACT_INBOX}
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
