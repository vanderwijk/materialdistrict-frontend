import type { Metadata } from 'next'
import { canonicalPath } from '@/lib/seo/urls'
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
 * Need-led marketing-variant van het brand-dashboard membership-paneel:
 * dezelfde tier-data, maar publiek. Volledig server-component; geen
 * client-eilanden (de hero-CTA is bewust verwijderd — een knop die enkel
 * dupliceert wat de tier-knoppen al doen heeft geen eigen functie; de actie
 * zit nu bij de plannen).
 *
 * Prijzen/tiers/feature-gates komen volledig uit
 * `src/lib/config/membership.ts`. Marketing-copy (kop/lede/card-highlights)
 * staat hardcoded zodat ze los herschreven kan worden.
 *
 * Free is pay-per-material: een gratis merk zonder gelist materiaal is
 * onzichtbaar. Brand page + directory + requests gaan pas live met het eerste
 * materiaal (€250/jaar) — daarom tonen we die rijen in de Free-kolom als
 * voorwaarde ("With a material") i.p.v. een kale ✓.
 *
 * Let op: deze route vervangt de oude WP-`advertise`-contentpagina. Daarom is
 * `become-a-partner` uit `PAGE_SLUG_MAP` (static-pages.ts) verwijderd — een
 * statisch route-segment wint altijd van de generieke [pageSlug]-template.
 */

export const metadata: Metadata = {
  title: 'Become a partner',
  description:
    'List your materials on MaterialDistrict and get found by architects, ' +
    'designers and specifiers. Pay per material, or choose a Basis, Plus or ' +
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
  free: [
    'List materials at €250 each / year',
    'Your brand page goes live with your first material',
    'Listed in the brand directory',
  ],
  basis: ['List up to 5 materials', 'Receive sample & info requests', 'Basic performance stats'],
  plus: ['List up to 15 materials', 'Full statistics & geo-based lead routing', 'Brochures, videos & keywords'],
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

/** Free-features die pas gelden zódra er een materiaal gelist is. */
const FREE_CONDITIONAL: ReadonlySet<ManufacturerFeature> = new Set([
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
  return <span className="cmp-cond">With a material</span>
}

export default function BecomeAPartnerPage() {
  return (
    <main className="ov-wrap-single">
      <section className="mkt-hero">
        <p className="mkt-eyebrow">For material manufacturers</p>
        <h1 className="page-title">Get your materials specified.</h1>
        <p className="mkt-lede">
          Reach 80,000+ architects, designers and specifiers searching for
          materials right now. List your materials from €250, get found in the
          brand directory, and turn that visibility into sample requests and
          qualified leads — with full insight into who&rsquo;s looking.
        </p>
      </section>

      <h2 className="mkt-section-title">Choose the plan that fits your range</h2>
      <div className="tier-grid">
        {TIER_ORDER.map((tier) => {
          const isFree = tier === 'free'
          const isFeatured = tier === FEATURED_TIER
          const priceMain = isFree ? eur(0) : eur(MANUFACTURER_PRICING[tier].annual)
          const accent = isFeatured ? 'var(--green)' : MANUFACTURER_TIER_COLORS[tier]
          const ctaLabel = isFree ? 'Start free' : `Choose ${TIER_LABELS[tier]}`

          return (
            <div
              key={tier}
              className={`tier-card${isFeatured ? ' is-featured' : ''}`}
              style={{ borderTopColor: accent }}
            >
              {isFeatured && (
                <div className="tier-badge" style={{ background: 'var(--green-mid)' }}>Most popular</div>
              )}
              <div className="tier-name">{TIER_LABELS[tier]}</div>
              <div className="tier-price">
                {priceMain}
                {!isFree && <span className="tier-price-per"> / yr</span>}
              </div>
              <div className="tier-meta">{isFree ? 'Pay per material' : materialsLabel(tier)}</div>

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

              <a href="/register?next=/become-a-partner" className="btn btn-outline">
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
                  const allowed = canManufacturerAccess(tier, feature)
                  const conditional = tier === 'free' && allowed && FREE_CONDITIONAL.has(feature)
                  return (
                    <td key={tier} className="col-val">
                      {conditional ? <Cond /> : allowed ? <Yes /> : <No />}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td>Discount on add-ons (banners, fairs &amp; more)</td>
              {TIER_ORDER.map((tier) => (
                <td key={tier} className="col-val">
                  {FAIR_DISCOUNT[tier] > 0 ? `${Math.round(FAIR_DISCOUNT[tier] * 100)}%` : <No />}
                </td>
              ))}
            </tr>
            <tr>
              <td>Yearly rate</td>
              {TIER_ORDER.map((tier) => (
                <td key={tier} className="col-val">
                  <strong>{tier === 'free' ? eur(0) : eur(MANUFACTURER_PRICING[tier].annual)}</strong>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mkt-lede" style={{ textAlign: 'center', marginTop: '20px' }}>
        All prices excl. VAT · memberships billed annually. Free is
        pay-per-material (€250 / material / year) — your brand page, directory
        listing and requests go live with your first listed material.
      </p>
      <p className="mkt-lede" style={{ textAlign: 'center', marginTop: '8px' }}>
        Bigger range or specific goals? We&rsquo;ll tailor a plan that fits.{' '}
        <a href="/contact" className="text-link">Talk to us</a>.
      </p>
    </main>
  )
}
