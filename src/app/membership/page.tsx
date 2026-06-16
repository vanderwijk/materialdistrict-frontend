import type { Metadata } from 'next'
import { Suspense } from 'react'
import { canonicalPath } from '@/lib/seo/urls'
import { MembershipCta } from './_components/MembershipCta'
import { CheckoutNotice } from './_components/CheckoutNotice'
import {
  INSIDER_PRICING,
  BOOK_DISCOUNT,
  READER_FEATURES,
} from '@/lib/config/membership'

/**
 * /membership — publieke Insider-pagina.
 * ----------------------------------------------------------------------
 * De permanente tegenhanger van het post-register Insider-upsell-scherm:
 * altijd bereikbaar via de footer ("Insider membership"), via de
 * "See Insider benefits"-CTA in `InsiderCtaBlock`, en voor wie bij
 * registratie op "maybe later" klikte en later alsnog wil upgraden.
 *
 * Server-component: de pagina-inhoud is statisch en SEO-relevant. De enige
 * auth-afhankelijke logica zit in <MembershipCta /> (client).
 *
 * Bron van waarheid voor prijs/periode/features: `src/lib/config/membership.ts`
 * — nooit hardcoded in deze pagina (kwaliteitseis 5). De marketing-copy
 * (titels/omschrijvingen) staat bewust hardcoded hier, zodat Jeroen 'm los
 * van de code-logica kan herschrijven.
 */

export const metadata: Metadata = {
  title: 'Insider membership',
  description:
    'Unlock the full MaterialDistrict platform: side-by-side comparison, ' +
    'datasheets & EPDs, saved searches, boards and quarterly trend reports.',
  alternates: { canonical: canonicalPath('/membership') },
}

const { monthly, annual } = INSIDER_PRICING

/** Marketing-omschrijving per Insider-feature (copy door Jeroen aanpasbaar). */
const FEATURE_CARDS: ReadonlyArray<{ title: string; desc: string }> = [
  {
    title: 'Compare materials',
    desc: 'Side-by-side comparison of sensorial, technical and environmental properties.',
  },
  {
    title: 'Quarterly trend reports',
    desc: 'PDF reports on sustainable material trends, market signals and innovation.',
  },
  {
    title: 'Download datasheets & EPDs',
    desc: 'Full technical PDFs, installation guides and environmental declarations.',
  },
  {
    title: 'Saved searches & alerts',
    desc: 'Save filter combinations and get notified when new materials match your criteria.',
  },
  {
    title: 'Boards',
    desc: 'Organise materials, articles and books per project — export as PDF for clients.',
  },
  {
    title: 'Insider articles',
    desc: 'In-depth analyses, material spotlights and specification guides.',
  },
]

/**
 * Free vs. Insider-vergelijking. De waarheid (welke tier wat krijgt) komt uit
 * `READER_FEATURES`; alleen de leesbare labels staan hier. Zo blijft de tabel
 * automatisch kloppen als de config wijzigt.
 */
const COMPARE_ROWS: ReadonlyArray<{
  label: string
  free: boolean
  insider: boolean
}> = [
  { label: 'Browse & bookmark materials', free: READER_FEATURES.free.bookmarks, insider: READER_FEATURES.insider.bookmarks },
  { label: 'Full side-by-side comparison', free: READER_FEATURES.free.fullCompare, insider: READER_FEATURES.insider.fullCompare },
  { label: 'Download datasheets & EPDs', free: READER_FEATURES.free.downloadPdfsEpds, insider: READER_FEATURES.insider.downloadPdfsEpds },
  { label: 'Export comparison as PDF', free: READER_FEATURES.free.exportCompareAsPdf, insider: READER_FEATURES.insider.exportCompareAsPdf },
  { label: 'Saved searches & alerts', free: READER_FEATURES.free.savedSearchesAlerts, insider: READER_FEATURES.insider.savedSearchesAlerts },
  { label: 'Boards', free: READER_FEATURES.free.boards, insider: READER_FEATURES.insider.boards },
  { label: 'Insider insights & trend reports', free: READER_FEATURES.free.insiderInsights, insider: READER_FEATURES.insider.insiderArticles },
  { label: 'Insider articles', free: READER_FEATURES.free.insiderArticles, insider: READER_FEATURES.insider.insiderArticles },
  { label: 'Discount on books', free: READER_FEATURES.free.bookDiscount, insider: READER_FEATURES.insider.bookDiscount },
  { label: 'Free event entry (1× / year)', free: READER_FEATURES.free.freeEventEntryPerYear, insider: READER_FEATURES.insider.freeEventEntryPerYear },
]

function Yes() {
  return (
    <svg className="cmp-yes" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="Included" role="img">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  )
}
function No() {
  return <span className="cmp-no" aria-label="Not included">—</span>
}

export default function MembershipPage() {
  const bookDiscountPct = Math.round(BOOK_DISCOUNT.insiderDiscount * 100)

  return (
    <main className="ov-wrap-single">
      <Suspense fallback={null}>
        <CheckoutNotice />
      </Suspense>
      <section className="mkt-hero">
        <p className="mkt-eyebrow">MaterialDistrict Insider</p>
        <h1 className="page-title">Become a MaterialDistrict Insider</h1>
        <p className="mkt-lede">
          Your free account gives you access to thousands of materials. Insider
          adds the tools serious specifiers need — comparison, downloads, trend
          reports and more.
        </p>

        <div className="mkt-price">
          <span className="mkt-price-amt">€{monthly.amount}</span>
          <span className="mkt-price-per">/ month</span>
        </div>
        <span className="mkt-price-note">
          or €{annual.amount} / year · cancel anytime · all prices excl. VAT
        </span>

        <MembershipCta />
      </section>

      <h2 className="mkt-section-title">What you unlock</h2>
      <div className="grid-3">
        {FEATURE_CARDS.map((f) => (
          <div className="mkt-feature" key={f.title}>
            <div className="mkt-feature-title">{f.title}</div>
            <div className="mkt-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <h2 className="mkt-section-title">Free vs. Insider</h2>
      <div className="compare-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th className="col-val">Free</th>
              <th className="col-val">Insider</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="col-val">{row.free ? <Yes /> : <No />}</td>
                <td className="col-val">{row.insider ? <Yes /> : <No />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mkt-lede" style={{ textAlign: 'center', marginTop: '20px' }}>
        Insiders also get a {bookDiscountPct}% discount on all books in the shop.
      </p>
    </main>
  )
}
