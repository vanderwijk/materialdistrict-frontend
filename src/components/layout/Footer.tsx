import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { FollowDigestBlock } from './FollowDigestBlock'
import { PreferredSourceButton } from '@/components/ui/PreferredSourceButton'
import { getChannelCatalog } from '@/lib/api/channels'

interface FooterLink {
  label: string
  href: string
  /** Externe link — opent in nieuw tabblad met security-attributen. */
  external?: boolean
}

interface FooterProps {
  className?: string
}

const DISCOVER_LINKS: FooterLink[] = [
  { label: 'Materials', href: '/material' },
  { label: 'Stories', href: '/article' },
  { label: 'Events', href: '/event' },
  { label: 'Talks', href: '/talk' },
  { label: 'Books', href: '/book' },
  { label: 'Brands', href: '/brand' },
]

const SPECIFIER_LINKS: FooterLink[] = [
  { label: 'Create free account', href: '/register' },
  { label: 'Insider membership', href: '/membership' },
  { label: 'Compare materials', href: '/compare' },
  { label: 'Boards', href: '/dashboard/boards' },
  { label: 'Insider insights', href: '/membership' },
  { label: 'Changemakers', href: '/changemakers' },
  { label: 'Transitioners', href: '/transitioners' },
]

const MANUFACTURER_LINKS: FooterLink[] = [
  { label: 'List your materials', href: '/become-a-partner' },
  { label: 'Brand profile', href: '/brand' },
  { label: 'Reach 80,000+ specifiers', href: '/become-a-partner' },
  { label: 'Sample requests', href: '/become-a-partner' },
]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy policy', href: '/privacy-statement' },
  // Terms blijft voorlopig een versievast PDF-document (besluit 29-05, S11.5):
  // directe link naar de stabiele asset-host (HTTP 200, application/pdf, geen
  // redirect, buiten de WAF). Externe download in nieuw tabblad via `external`.
  // Geen CSP-aanpassing nodig zolang we niet embedden (iframe/object).
  {
    label: 'Terms of use',
    href: 'https://materiahost.nl/assets/MaterialDistrict_TermsConditions_V20-01.pdf',
    external: true,
  },
  // Verborgen tot er een cookie-consent-tool is — dit hoort een knop te zijn
  // die de consent-manager opent, geen route. Zie open issue S11.6.
  // { label: 'Cookie settings', href: '/legal/cookies' },
]

const SOCIAL_LINKS: FooterLink[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/materialdistrict' },
  { label: 'Instagram', href: 'https://instagram.com/materialdistrict' },
  { label: 'X', href: 'https://x.com/materialdistrict' },
]

/**
 * Footer — 5-koloms grid met newsletter, links per categorie, contact en socials.
 *
 * Server component. Newsletter-form gebruikt een optionele `onNewsletterSubmit`
 * callback die door een client-wrapper kan worden aangeleverd. Zonder callback
 * is de form niet-werkend; in sessie 4 wordt dit vervangen door een Server Action.
 */
export async function Footer({ className }: FooterProps) {
  const channels = await getChannelCatalog().catch(() => [])
  const digestChannels = [...channels]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((c) => ({ id: c.id, slug: c.slug, label: c.label }))
  return (
    <footer className={cn('site-footer', className)}>
      <div className="footer-inner">
        {/* Brand + newsletter */}
        <div className="footer-col footer-col-brand">
          <div className="footer-title is-brand">MaterialDistrict</div>
          <div className="footer-tagline">
            The leading platform for innovative and sustainable materials —
            for architects, designers and manufacturers.
          </div>
          <FollowDigestBlock channels={digestChannels} />
        </div>

        {/* Discover */}
        <FooterColumn title="Discover" links={DISCOVER_LINKS} />

        {/* For specifiers */}
        <FooterColumn title="For specifiers" links={SPECIFIER_LINKS} />

        {/* For manufacturers */}
        <FooterColumn title="For manufacturers" links={MANUFACTURER_LINKS} />

        {/* Contact + socials */}
        <div className="footer-col">
          <div className="footer-title">Contact</div>
          <div className="footer-contact">
            <a href="mailto:info@materialdistrict.com" className="footer-link">
              info@materialdistrict.com
            </a>
            <a href="tel:+31207130650" className="footer-link">
              +31 (0)20 71 30 650
            </a>
            <address className="footer-address">
              MaterialDistrict B.V.<br />
              Amsterdamsestraatweg 43-A2<br />
              NL-1411 AX Naarden<br />
              The Netherlands
            </address>
            <div className="footer-registration">
              KvK 60837802<br />
              VAT NL854081732B01
            </div>
          </div>
          <div className="footer-socials">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="footer-social-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span>© 1999–{new Date().getFullYear()} MaterialDistrict</span>
          <PreferredSourceButton
            variant="compact"
            placement="footer"
            label="Add MaterialDistrict to Google"
          />
        </div>
        <div className="footer-legal-links">
          {LEGAL_LINKS.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href}>
                {l.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// Sub-components
// ============================================================

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="footer-col">
      <div className="footer-title">{title}</div>
      {links.map((link) => (
        <Link key={link.label} href={link.href} className="footer-link">
          {link.label}
        </Link>
      ))}
    </div>
  )
}
