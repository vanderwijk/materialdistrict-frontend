import type { Metadata } from 'next'
import { canonicalPath } from '@/lib/seo/urls'
import { PartnerCta } from './_components/PartnerCta'
import {
  MANUFACTURER_PRICING,
  MANUFACTURER_TIER_COLORS,
  FAIR_DISCOUNT,
  canManufacturerAccess,
  getMaterialLimit,
  type ManufacturerTier,
  type ManufacturerFeature,
} from '@/lib/config/membership'

/**
 * /become-a-partner — publieke manufacturer-pagina.
 * ----------------------------------------------------------------------
 * Marketing-variant van het brand-dashboard membership-paneel: dezelfde
 * tier-data, maar publiek en met "Become a partner"-CTA's i.p.v. de
 * "Select tier"-knoppen (die in het dashboard horen, Fase 2).
 *
 * Server-component; auth-logica zit alleen in <PartnerCta /> (client).
 *
 * Prijzen/tiers/feature-gates komen volledig uit
 * `src/lib/config/membership.ts` — de mockup-tabel bevatte verouderde
 * tarieven en is hier bewust NIET de bron. Marketing-copy (kop/omschrijving/
 * card-highlights) staat hardcoded zodat Jeroen 'm los kan herschrijven.
 *
 * Let op: deze route vervangt de oude WP-`advertise`-contentpagina. Daarom is
 * `become-a-partner` uit `PAGE_SLUG_MAP` (static-pages.ts) verwijderd — een
 * statisch route-segment wint altijd van de generieke [pageSlug]-template.
 */

export const metadata: Metadata = {
  title: 'Become a partner',
  description:
    'List your brand and materials on MaterialDistrict. Reach specifiers ' +
    'with a free brand page, or publish materials with a Basis, Plus or ' +
    'Partner membership.',
  alternates: { canonical: canonicalPath('/become-a-partner') },
}

const TIER_ORDER: readonly ManufacturerTier[] = ['free', 'basis', 'plus', 'partner']
const TIER_LABELS: Record<ManufacturerTier, string> = {
  free: 'Free',
  basis: 'Basis',
  plus: 'Plus',
  partner: 'Partner',
}
/** Most-popular highlight. */
const FEATURED_TIER: ManufacturerTier = 'plus'

/** Card-highlights per tier (marketing-copy, los aanpasbaar). */
const TIER_HIGHLIGHTS: Record<ManufacturerTier, readonly string[]> = {
  free: ['Listed in the brand directory', 'Your own brand page', 'Publish materials at €250 / material / year'],
  basis: ['5 materials included', 'Receive sample & info requests', 'Basic statistics'],
  plus: ['15 materials included', 'Full statistics & geo-based lead routing', 'Brochures, videos & keywords'],
  partner: ['Unlimited materials', 'Self-service featured placement', 'Exclusive networking events'],
}

/** Geordende feature-rijen voor de vergelijkingstabel. */
const COMPARE_FEATURES: readonly ManufacturerFeature[] = [
  'Listed in Brand Directory',
  'Individual Brand Page',
  'Receive Sample & Info Requests',
  'Access to Statistics',
  'Geo-based Lead Routing',
  'Add Brochures & Videos',
  'PDF & EPD downloads',
  'Keywords',
  'Featured placement',
  'Exclusive Networking Events',
]

/**
 * Free-model parity met het dashboard (review 12.5): voor Free zijn dit
 * conditionele features — pas zichtbaar zodra de brand minstens één materiaal
 * publiceert. In de tabel tonen we ze met een "* met publicatie"-markering.
 */
const FREE_CONDITIONAL = new Set<ManufacturerFeature>([
  'Listed in Brand Directory',
  'Individual Brand Page',
  'Receive Sample & Info Requests',
])

function eur(amount: number): string {
  return `€${amount.toLocaleString('nl-NL')}`
}

function materialsLabel(tier: ManufacturerTier): string {
  const limit = getMaterialLimit(tier)
  if (limit === Infinity) return 'Unlimited'
  if (limit === 0) return `${eur(MANUFACTURER_PRICING.free.materialPrice)} / material / yr`
  return `${limit} included`
}

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
function Cond() {
  return (
    <span className="cmp-cond" aria-label="Included once you publish at least one material">
      <svg className="cmp-yes" width="16" height="16" viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" fill="none" />
      </svg>
      <sup>*</sup>
    </span>
  )
}

export default function BecomeAPartnerPage() {
  return (
    <main className="ov-wrap-single">
      <section className="mkt-hero">
        <p className="mkt-eyebrow">For manufacturers</p>
        <h1 className="page-title">Become a MaterialDistrict partner</h1>
        <p className="mkt-lede">
          Put your materials in front of architects, designers and specifiers.
          Start with a free brand page, or publish your materials with a
          membership that fits your range.
        </p>
        <PartnerCta />
      </section>

      <h2 className="mkt-section-title">Choose your membership</h2>
      <div className="tier-grid">
        {TIER_ORDER.map((tier) => {
          const isFree = tier === 'free'
          const priceMain = isFree ? eur(0) : eur(MANUFACTURER_PRICING[tier].annual)
          const isFeatured = tier === FEATURED_TIER
          const accent = MANUFACTURER_TIER_COLORS[tier]
          const href = tier === 'partner' ? '/contact' : '/register?next=/become-a-partner'
          const ctaLabel =
            tier === 'partner' ? 'Choose Partner' : isFree ? 'Start free' : `Choose ${TIER_LABELS[tier]}`

          return (
            <div
              key={tier}
              className={`tier-card${isFeatured ? ' is-featured' : ''}`}
              style={{ borderTopColor: accent }}
            >
              {isFeatured && (
                <div className="tier-badge" style={{ background: accent }}>Most popular</div>
              )}
              <div className="tier-name">{TIER_LABELS[tier]}</div>
              <div className="tier-price">
                {priceMain}
                {!isFree && <span className="tier-price-per"> / yr</span>}
              </div>
              <div className="tier-meta">{materialsLabel(tier)}</div>

              <ul className="tier-features">
                {TIER_HIGHLIGHTS[tier].map((h) => (
                  <li key={h}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>

              <a href={href} className={`btn ${isFeatured ? 'btn-primary' : 'btn-outline'}`}>
                {ctaLabel}
              </a>
            </div>
          )
        })}
      </div>

      <h2 className="mkt-section-title">Compare all features</h2>
      <div className="compare-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              {TIER_ORDER.map((tier) => (
                <th key={tier} className="col-val">{TIER_LABELS[tier]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Individual material pages</td>
              {TIER_ORDER.map((tier) => (
                <td key={tier} className="col-val">{materialsLabel(tier)}</td>
              ))}
            </tr>
            {COMPARE_FEATURES.map((feature) => (
              <tr key={feature}>
                <td>{feature}</td>
                {TIER_ORDER.map((tier) => {
                  const included = canManufacturerAccess(tier, feature)
                  const conditional =
                    tier === 'free' && included && FREE_CONDITIONAL.has(feature)
                  return (
                    <td key={tier} className="col-val">
                      {conditional ? <Cond /> : included ? <Yes /> : <No />}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td>Fair discount on stand space</td>
              {TIER_ORDER.map((tier) => (
                <td key={tier} className="col-val">
                  {FAIR_DISCOUNT[tier] > 0 ? `${Math.round(FAIR_DISCOUNT[tier] * 100)}%` : <No />}
                </td>
              ))}
            </tr>
            <tr className="cmp-rate-row">
              <td>Yearly rate</td>
              {TIER_ORDER.map((tier) => (
                <td key={tier} className="col-val">
                  {tier === 'free' ? eur(0) : eur(MANUFACTURER_PRICING[tier].annual)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mkt-footnote">
        <sup>*</sup> Free brand visibility — brand directory listing, brand page
        and sample &amp; info requests — activates once you publish at least one
        material.
      </p>

      <p className="mkt-lede" style={{ textAlign: 'center', marginTop: '20px' }}>
        All prices excl. VAT · annual commitment. Need a tailored Partner
        package?{' '}
        <a href="/contact" className="text-link">Contact us for custom pricing</a>.
      </p>
    </main>
  )
}
