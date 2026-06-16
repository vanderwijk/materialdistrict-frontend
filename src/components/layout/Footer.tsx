import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { ClientNewsletterForm } from './ClientNewsletterForm'

interface FooterLink {
  label: string
  href: string
  /** Externe link — opent in nieuw tabblad met security-attributen. */
  external?: boolean
}

interface FooterProps {
  /**
   * Optional callback voor newsletter-submit. Wanneer afwezig, gebruikt de form
   * een server action (komt in sessie 4). Voor nu kan de parent een handler meegeven.
   */
  onNewsletterSubmit?: (email: string) => void
  className?: string
}

const DISCOVER_LINKS: FooterLink[] = [
  { label: 'Materials', href: '/material' },
  { label: 'Stories', href: '/article' },
  { label: 'Events', href: '/event' },
  { label: 'Talks', href: '/talk' },
  { label: 'Books', href: '/books' },
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
  { label: 'List your materials', href: '/register?type=show' },
  { label: 'Brand profile', href: '/brand' },
  { label: 'Reach 80,000+ specifiers', href: '/register?type=show' },
  { label: 'Sample requests', href: '/register?type=show' },
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
export function Footer({ onNewsletterSubmit, className }: FooterProps) {
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
          <NewsletterForm onSubmit={onNewsletterSubmit} />
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
        <span>© {new Date().getFullYear()} MaterialDistrict</span>
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

function NewsletterForm({ onSubmit }: { onSubmit?: (email: string) => void }) {
  if (onSubmit) {
    return <ClientNewsletterForm onSubmit={onSubmit} />
  }
  return (
    <>
      <div className="footer-eyebrow">Newsletter — 2× per week</div>
      <form
        className="footer-newsletter"
        action="/api/newsletter"
        method="post"
      >
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          required
          aria-label="Email address"
        />
        <button type="submit">Subscribe</button>
      </form>
      <div className="footer-newsletter-note">
        New materials, articles and events. No spam.
      </div>
    </>
  )
}
