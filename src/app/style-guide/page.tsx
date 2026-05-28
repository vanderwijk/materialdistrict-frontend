'use client'

import { useState } from 'react'
import {
  IconSave,
  IconCompare,
  IconShare,
  IconBoard,
  IconSearch,
  IconMail,
  IconBell,
  IconSettings,
  IconLinkedin,
  IconX,
  IconInstagram,
  IconYoutube,
  IconArticle,
  IconMaterial,
  IconEvent,
  IconBook,
} from '@/components/ui/icons'
import {
  Button,
  Badge,
  Tag,
  InsiderBadge,
  InsiderMark,
  Skeleton,
  EmptyState,
  ContentCard,
  ActionButton,
  Pagination,
  InsiderGate,
  BrandTierGate,
  PreviewModeIndicator,
  FilterSidebar,
  type FilterSelection,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  FormStateProvider,
  SubmitButton,
  TextLink,
  Tabs,
  TabItem,
  IconButton,
} from '@/components/ui'
import {
  Breadcrumb,
  DetailHeader,
  HeaderNavItem,
  MobileNavItem,
  FooterLink,
} from '@/components/layout'
import { DetailActions } from '@/components/ui/DetailActions'
import { IconsSection } from './sections/IconsSection'
import { BrandsSection } from './sections/BrandsSection'
import { PreviewModeProvider } from '@/lib/hooks/usePreviewMode'

/**
 * Style Guide pagina — `/style-guide`
 *
 * Visuele referentie voor alle UI-componenten en design tokens. Bestaat uit:
 *  1. Foundations — kleur, typografie, spacing, radius, shadow
 *  2. UI Components — buttons, badges, tags, forms, cards, etc.
 *  3. Patterns — page-templates, action-rows
 *
 * Niet voor productie — alleen voor design/dev-referentie.
 * Voor de regels achter dit systeem: zie `design-system.md`.
 */
export default function StyleGuidePage() {
  const [page, setPage] = useState(5)
  const [gateOpen, setGateOpen] = useState(false)
  const [filters, setFilters] = useState<FilterSelection>({})
  const [activeTab, setActiveTab] = useState('articles')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Apply theme to <html> via data-theme — works in style-guide preview only
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }

  return (
    <PreviewModeProvider>
      <header className="ov-page-header sg-page-header-with-toggle">
        <div>
          <Breadcrumb items={[{ label: 'Style guide' }]} />
          <h1 className="t-display-lg">Style guide</h1>
          <p className="t-body sg-intro">
            Visuele referentie van alle UI-componenten en design tokens.
            Voor de regels achter dit systeem: zie <code>design-system.md</code>.
          </p>
        </div>
        <div className="sg-theme-toggle-prominent" role="group" aria-label="Theme">
          <button
            type="button"
            className={`sg-theme-toggle-btn${theme === 'light' ? ' is-active' : ''}`}
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
          >
            ☀ Light
          </button>
          <button
            type="button"
            className={`sg-theme-toggle-btn${theme === 'dark' ? ' is-active' : ''}`}
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
          >
            ☾ Dark
          </button>
        </div>
      </header>

      <div className="sg-shell">
        <nav className="sg-nav" aria-label="Style guide secties">
          <p className="sg-nav-title">Foundations</p>
          <a className="sg-nav-link" href="#colors">Colors</a>
          <a className="sg-nav-link" href="#typography">Typography</a>
          <a className="sg-nav-link" href="#spacing">Spacing</a>
          <a className="sg-nav-link" href="#radius">Radius</a>
          <a className="sg-nav-link" href="#shadow">Shadow</a>
          <a className="sg-nav-link" href="#icons">Iconen</a>

          <p className="sg-nav-title sg-nav-subgroup">Components</p>
          <a className="sg-nav-link" href="#buttons">Buttons</a>
          <a className="sg-nav-link" href="#action-buttons">ActionButtons</a>
          <a className="sg-nav-link" href="#badges">Badges</a>
          <a className="sg-nav-link" href="#tags">Tags & Insider</a>
          <a className="sg-nav-link" href="#text-links">Text links</a>
          <a className="sg-nav-link" href="#tabs">Tabs</a>
          <a className="sg-nav-link" href="#icon-buttons">Icon buttons</a>
          <a className="sg-nav-link" href="#nav-items">Nav items</a>
          <a className="sg-nav-link" href="#footer-links">Footer links</a>
          <a className="sg-nav-link" href="#forms">Form fields</a>
          <a className="sg-nav-link" href="#cards">Cards</a>
          <a className="sg-nav-link" href="#skeletons">Skeletons</a>
          <a className="sg-nav-link" href="#empty">Empty state</a>
          <a className="sg-nav-link" href="#pagination">Pagination</a>
          <a className="sg-nav-link" href="#breadcrumb">Breadcrumb</a>
          <a className="sg-nav-link" href="#filters">Filter sidebar</a>

          <p className="sg-nav-title sg-nav-subgroup">Membership gates</p>
          <a className="sg-nav-link" href="#insider-gates">Insider gates</a>
          <a className="sg-nav-link" href="#brand-tier-gates">Brand-tier gates</a>

          <p className="sg-nav-title sg-nav-subgroup">Patterns</p>
          <a className="sg-nav-link" href="#detail-header">Detail header</a>
          <a className="sg-nav-link" href="#action-row">Action row</a>
        </nav>

        <main>
          {/* ============================================================
              Foundations
              ============================================================ */}

          {/* Colors */}
          <section className="sg-section" id="colors" aria-labelledby="colors-h">
            <div className="sg-section-header">
              <h2 id="colors-h" className="t-display-md">Colors</h2>
            </div>
            <p className="t-body sg-section-desc">
              Alle kleuren als CSS custom properties in <code>globals.css §2-3</code>.
              Light + dark mode automatisch via <code>[data-theme]</code>-prefix.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Brand</h3>
            <div className="sg-swatch-grid">
              <Swatch name="Navy" token="--navy" colorVar="var(--navy)" />
              <Swatch name="Navy mid" token="--navy-mid" colorVar="var(--navy-mid)" />
              <Swatch name="Navy light" token="--navy-light" colorVar="var(--navy-light)" />
              <Swatch name="Green" token="--green" colorVar="var(--green)" />
              <Swatch name="Green mid" token="--green-mid" colorVar="var(--green-mid)" />
              <Swatch name="Red" token="--red" colorVar="var(--red)" />
              <Swatch name="Amber" token="--amber" colorVar="var(--amber)" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Surfaces & text</h3>
            <div className="sg-swatch-grid">
              <Swatch name="Background" token="--bg" colorVar="var(--bg)" />
              <Swatch name="Surface" token="--surface" colorVar="var(--surface)" />
              <Swatch name="Surface 2" token="--surface2" colorVar="var(--surface2)" />
              <Swatch name="Border" token="--border" colorVar="var(--border)" />
              <Swatch name="Text" token="--text" colorVar="var(--text)" />
              <Swatch name="Text muted" token="--text-muted" colorVar="var(--text-muted)" />
              <Swatch name="Text hint" token="--text-hint" colorVar="var(--text-hint)" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Content types</h3>
            <div className="sg-swatch-grid">
              <Swatch name="Material" token="--ct-material" colorVar="var(--ct-material)" />
              <Swatch name="Article" token="--ct-article" colorVar="var(--ct-article)" />
              <Swatch name="Event" token="--ct-event" colorVar="var(--ct-event)" />
              <Swatch name="Book" token="--ct-book" colorVar="var(--ct-book)" />
              <Swatch name="Brand" token="--ct-brand" colorVar="var(--ct-brand)" />
              <Swatch name="Member / Talk" token="--ct-member" colorVar="var(--ct-member)" />
            </div>
          </section>

          {/* Typography */}
          <section className="sg-section" id="typography" aria-labelledby="typo-h">
            <div className="sg-section-header">
              <h2 id="typo-h" className="t-display-md">Typography</h2>
            </div>
            <p className="t-body sg-section-desc">
              Vijf display-niveaus + drie tekst-utilities, gegeneraliseerd uit 17 ad-hoc font-sizes
              in de mockup. DM Serif Display voor display, DM Sans voor body.
            </p>

            <div className="sg-preview is-stack is-tinted">
              <TypeRow size="t-display-xl" pixels="52px" sample="Channel hero" />
              <TypeRow size="t-display-lg" pixels="38px" sample="Page H1" />
              <TypeRow size="t-display-md" pixels="28px" sample="Section heading" />
              <TypeRow size="t-display-sm" pixels="22px" sample="Featured card title" />
              <TypeRow size="t-display-xs" pixels="18px" sample="Sidebar card title" />
              <TypeRow size="t-eyebrow" pixels="11px" sample="Eyebrow label" />
              <TypeRow size="t-meta" pixels="12px" sample="Meta text — datum, auteur, categorie" />
              <TypeRow size="t-body" pixels="14px" sample="Body text — reguliere tekst" />
              <TypeRow size="t-body-sm" pixels="13px" sample="Body small — kleinere tekst" />
              <TypeRow size="t-body-xs" pixels="12px" sample="Body extra-small" />
            </div>
          </section>

          {/* Spacing */}
          <section className="sg-section" id="spacing" aria-labelledby="spacing-h">
            <div className="sg-section-header">
              <h2 id="spacing-h" className="t-display-md">Spacing</h2>
            </div>
            <p className="t-body sg-section-desc">
              Tokens via <code>var(--space-N)</code>. Conventies: 4-8px voor binnen-element,
              12-16px tussen elementen, 24-32px tussen secties, 48-80px page-level.
            </p>
            <div className="sg-preview is-stack is-tinted">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => (
                <SpacingRow key={n} token={`--space-${n}`} px={n * 4} />
              ))}
            </div>
          </section>

          {/* Radius */}
          <section className="sg-section" id="radius" aria-labelledby="radius-h">
            <div className="sg-section-header">
              <h2 id="radius-h" className="t-display-md">Radius</h2>
            </div>
            <div className="sg-preview is-tinted">
              <div className="sg-radius-grid" style={{ width: '100%' }}>
                <div className="sg-radius-tile" style={{ borderRadius: 'var(--radius)' }}>--radius — 6px</div>
                <div className="sg-radius-tile" style={{ borderRadius: 'var(--radius-md)' }}>--radius-md — 8px</div>
                <div className="sg-radius-tile" style={{ borderRadius: 'var(--radius-lg)' }}>--radius-lg — 12px</div>
                <div className="sg-radius-tile" style={{ borderRadius: '50%' }}>circle — 50%</div>
              </div>
            </div>
          </section>

          {/* Shadow */}
          <section className="sg-section" id="shadow" aria-labelledby="shadow-h">
            <div className="sg-section-header">
              <h2 id="shadow-h" className="t-display-md">Shadow</h2>
            </div>
            <div className="sg-preview is-tinted">
              <div className="sg-shadow-grid" style={{ width: '100%' }}>
                <div className="sg-shadow-tile" style={{ boxShadow: 'var(--shadow)' }}>--shadow</div>
                <div className="sg-shadow-tile" style={{ boxShadow: 'var(--shadow-lg)' }}>--shadow-lg</div>
              </div>
            </div>
          </section>

          {/* Iconen — overzicht van centrale icon-registry */}
          <IconsSection />

          {/* Brands — sessie 5 (overzicht-component) */}
          <BrandsSection />

          {/* ============================================================
              UI Components
              ============================================================ */}

          {/* Buttons */}
          <section className="sg-section" id="buttons" aria-labelledby="btn-h">
            <div className="sg-section-header">
              <h2 id="btn-h" className="t-display-md">Buttons</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<Button>'}</code> — primaire acties, navigatie, forms. 7 varianten × 3 maten.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Variants (medium)</h3>
            <div className="sg-preview">
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="green">Green</Button>
              <Button variant="blue">Blue</Button>
              <Button variant="insider">Insider</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Sizes</h3>
            <div className="sg-preview">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>States</h3>
            <div className="sg-preview">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>

            <pre className="sg-code">{`<Button variant="primary" size="md">Save changes</Button>
<Button variant="outline" size="sm" as="link" href="/login">Sign in</Button>
<Button variant="danger" loading>Deleting…</Button>`}</pre>
          </section>

          {/* ActionButtons */}
          <section className="sg-section" id="action-buttons" aria-labelledby="ab-h">
            <div className="sg-section-header">
              <h2 id="ab-h" className="t-display-md">ActionButtons</h2>
            </div>
            <p className="t-body sg-section-desc">
              Icon+label utility-knop. <code>sm</code> voor card-overlays, <code>md</code> voor
              detail-page rows, <code>lg</code> voor primary CTA's.
            </p>

            <h3 className="t-display-xs sg-subsection-title">size="sm" (overlay op image)</h3>
            <div
              className="sg-preview"
              style={{ background: 'linear-gradient(135deg,#88a800,#4a5800)' }}
            >
              <ActionButton size="sm" icon={<IconSave size={14} />} ariaLabel="Save" />
              <ActionButton size="sm" icon={<IconCompare size={14} />} ariaLabel="Compare" />
              <ActionButton size="sm" icon={<IconShare size={14} />} ariaLabel="Share" />
              <ActionButton size="sm" icon={<IconSave size={14} fill="currentColor" />} isActive ariaLabel="Saved" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>size="md" (detail row)</h3>
            <div className="sg-preview">
              <ActionButton size="md" icon={<IconSave size={13} />} label="Save" />
              <ActionButton size="md" icon={<IconBoard size={13} />} label="Add to board" />
              <ActionButton size="md" icon={<IconCompare size={13} />} label="Compare" />
              <ActionButton size="md" icon={<IconCompare size={13} />} label="Added ✓" isActive />
              <ActionButton size="md" icon={<IconShare size={13} />} label="Share" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>size="lg" (CTA)</h3>
            <div className="sg-preview">
              <ActionButton size="lg" icon={<IconMail size={16} />} label="Get in touch" />
            </div>
          </section>

          {/* Badges */}
          <section className="sg-section" id="badges" aria-labelledby="badges-h">
            <div className="sg-section-header">
              <h2 id="badges-h" className="t-display-md">Badges</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<Badge>'}</code> — status-pills voor tabellen en dashboards.
            </p>
            <div className="sg-preview">
              <Badge variant="green">Paid</Badge>
              <Badge variant="amber">Pending</Badge>
              <Badge variant="blue">Request</Badge>
              <Badge variant="red">Failed</Badge>
              <Badge variant="gray">Draft</Badge>
            </div>
          </section>

          {/* Tags & Insider */}
          <section className="sg-section" id="tags" aria-labelledby="tags-h">
            <div className="sg-section-header">
              <h2 id="tags-h" className="t-display-md">Tags & Insider</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<Tag contentType>'}</code> voor content-type pills (met default-icoon per type),
              <code>{'<InsiderBadge>'}</code> voor Insider-content met label,
              <code>{'<InsiderMark>'}</code> voor icon-only Insider-marker.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Content tags — met default-icoon</h3>
            <p className="t-body-sm sg-subsection-desc">
              Sessie 3A batch 3: elk content-type krijgt een eigen icoon links van het label. De icoon-keuze
              komt uit de centrale icon-registry (<code>IconMaterial</code>, <code>IconArticle</code>, etc.).
            </p>
            <div className="sg-preview">
              <Tag contentType="material" />
              <Tag contentType="article" />
              <Tag contentType="event" />
              <Tag contentType="book" />
              <Tag contentType="brand" />
              <Tag contentType="talk" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Tag — icoon uitgeschakeld of custom</h3>
            <div className="sg-preview">
              <Tag contentType="material" icon={false} />
              <Tag contentType="article" icon={false}>Featured</Tag>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Insider badge</h3>
            <p className="t-body-sm sg-subsection-desc">
              Pill met ster-cirkel + label. Alignment-fix: tekst-baseline staat nu op de optical mid van de cirkel.
              Sessie 3B correctie 4: padding consistent over alle varianten (sterretje altijd dezelfde optische
              afstand van de linker rand). Hier staat ook de <code>{'<Tag contentType="insider">'}</code> —
              die hoort bij de Insider-componenten, niet bij content-types (sessie 3B correctie 3).
            </p>
            <div className="sg-preview">
              <Tag contentType="insider" />
              <InsiderBadge />
              <InsiderBadge size="sm" />
              <InsiderBadge padded>Insider settings</InsiderBadge>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Insider mark</h3>
            <p className="t-body-sm sg-subsection-desc">
              Icon-only sterretje-in-cirkel — voor plekken waar de "Insider"-tekst te uitgesproken zou zijn.
              3 maten: <code>xs</code> / <code>sm</code> / <code>md</code>.
            </p>
            <div className="sg-preview">
              <InsiderMark size="xs" />
              <InsiderMark size="sm" />
              <InsiderMark size="md" />
            </div>
            <div className="sg-preview" style={{ marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <InsiderMark size="xs" />
                <span style={{ fontSize: 14 }}>Inline naast tekst (xs)</span>
              </span>
            </div>
          </section>

          {/* Text links */}
          <section className="sg-section" id="text-links" aria-labelledby="tl-h">
            <div className="sg-section-header">
              <h2 id="tl-h" className="t-display-md">Text links</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<TextLink>'}</code> — navy tekstlink met optionele trailing-arrow.
              Vervangt het inline "All materials →" patroon.
            </p>
            <div className="sg-preview" style={{ gap: 16, flexWrap: 'wrap' }}>
              <TextLink href="#materials">All materials</TextLink>
              <TextLink href="#articles">All articles</TextLink>
              <TextLink href="#x" arrow={false}>No arrow</TextLink>
              <TextLink href="#x" variant="muted">Muted variant</TextLink>
            </div>
          </section>

          {/* Tabs */}
          <section className="sg-section" id="tabs" aria-labelledby="tabs-h">
            <div className="sg-section-header">
              <h2 id="tabs-h" className="t-display-md">Tabs</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<Tabs>'}</code> + <code>{'<TabItem>'}</code> — underline-style tabs voor o.a.
              "Articles | Materials" filtering.
            </p>
            <div className="sg-preview is-stack">
              <Tabs value={activeTab} onChange={setActiveTab} ariaLabel="Content type">
                <TabItem value="articles" count={142}>Articles</TabItem>
                <TabItem value="materials" count={3204}>Materials</TabItem>
                <TabItem value="brands" count={67}>Brands</TabItem>
                <TabItem value="events" count={12}>Events</TabItem>
                <TabItem value="disabled" disabled>Coming soon</TabItem>
              </Tabs>
            </div>
          </section>

          {/* Icon buttons */}
          <section className="sg-section" id="icon-buttons" aria-labelledby="ib-h">
            <div className="sg-section-header">
              <h2 id="ib-h" className="t-display-md">Icon buttons</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<IconButton>'}</code> — generieke icon-only button. Klasse-gestuurd,
              <strong> geen inline styles</strong>. Voor header-actions, footer-socials, theme-toggles.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Sizes (ghost variant)</h3>
            <div className="sg-preview" style={{ gap: 12 }}>
              <IconButton icon={<IconSearch size={14} />} ariaLabel="Search" size="sm" />
              <IconButton icon={<IconSearch size={16} />} ariaLabel="Search" size="md" />
              <IconButton icon={<IconSearch size={18} />} ariaLabel="Search" size="lg" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Variants</h3>
            <div className="sg-preview" style={{ gap: 12 }}>
              <IconButton icon={<IconBell size={16} />} ariaLabel="Notifications" variant="ghost" />
              <IconButton icon={<IconSettings size={16} />} ariaLabel="Settings" variant="subtle" />
              <IconButton icon={<IconShare size={16} />} ariaLabel="Share" variant="solid" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>States</h3>
            <div className="sg-preview" style={{ gap: 12 }}>
              <IconButton icon={<IconBell size={16} />} ariaLabel="Notifications (5 new)" hasIndicator />
              <IconButton icon={<IconSave size={16} />} ariaLabel="Saved" active />
              <IconButton icon={<IconShare size={16} />} ariaLabel="Disabled" disabled />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Socials (sm ghost)</h3>
            <div className="sg-preview" style={{ gap: 8 }}>
              <IconButton icon={<IconLinkedin size={16} />} ariaLabel="LinkedIn" size="sm" />
              <IconButton icon={<IconX size={16} />} ariaLabel="X (Twitter)" size="sm" />
              <IconButton icon={<IconInstagram size={16} />} ariaLabel="Instagram" size="sm" />
              <IconButton icon={<IconYoutube size={16} />} ariaLabel="YouTube" size="sm" />
            </div>
          </section>

          {/* Nav items */}
          <section className="sg-section" id="nav-items" aria-labelledby="ni-h">
            <div className="sg-section-header">
              <h2 id="ni-h" className="t-display-md">Navigation items</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<HeaderNavItem>'}</code> voor de site-header en
              <code>{'<MobileNavItem>'}</code> voor de mobile drawer. Vervangen inline-anchors
              die voorheen in <code>Header.tsx</code> stonden.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Header nav (desktop)</h3>
            <div className="sg-preview is-tinted" style={{ gap: 4, padding: 12 }}>
              <HeaderNavItem href="#materials">Materials</HeaderNavItem>
              <HeaderNavItem href="#articles" active>Articles</HeaderNavItem>
              <HeaderNavItem href="#brands" hasDropdown>Brands</HeaderNavItem>
              <HeaderNavItem href="#insider" insider>Insider</HeaderNavItem>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Mobile drawer</h3>
            <div className="sg-preview is-tinted" style={{ display: 'block', padding: 0, maxWidth: 360 }}>
              <MobileNavItem href="#m" icon={<IconMaterial size={20} />}>Materials</MobileNavItem>
              <MobileNavItem href="#a" icon={<IconArticle size={20} />} active>Articles</MobileNavItem>
              <MobileNavItem href="#e" icon={<IconEvent size={20} />}>Events</MobileNavItem>
              <MobileNavItem href="#b" icon={<IconBook size={20} />}>Books</MobileNavItem>
              <MobileNavItem href="#i" insider>Insider</MobileNavItem>
            </div>
          </section>

          {/* Footer links */}
          <section className="sg-section" id="footer-links" aria-labelledby="fl-h">
            <div className="sg-section-header">
              <h2 id="fl-h" className="t-display-md">Footer links</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<FooterLink>'}</code> — site-footer text-link. Vervangt inline-styled
              <code>{'<a>'}</code>'s in <code>Footer.tsx</code>.
            </p>
            <div className="sg-preview is-stack" style={{ gap: 4, alignItems: 'flex-start' }}>
              <FooterLink href="#about">About</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
              <FooterLink href="#docs" external>Documentation</FooterLink>
              <FooterLink href="#privacy">Privacy policy</FooterLink>
            </div>
          </section>

          {/* Form fields */}
          <section className="sg-section" id="forms" aria-labelledby="forms-h">
            <div className="sg-section-header">
              <h2 id="forms-h" className="t-display-md">Form fields</h2>
            </div>
            <p className="t-body sg-section-desc">
              Validatie-feedback gaat via een <code>FieldStatus</code>-cirkel rechts-boven het veld:
              groen vink bij correct, rood X bij incorrect. Geen rode borders, geen error-tekst onder
              het veld. Live tijdens typen.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Input — alle states</h3>
            <p className="t-body-sm sg-subsection-desc">
              Typ in de "Required" en "With validate" velden om de live status-indicator te zien.
            </p>
            <div className="sg-preview is-grid-3 is-tinted">
              <Input label="Default" placeholder="Type something…" />
              <Input label="With value" defaultValue="Recycled glass" showFilledState />
              <Input label="Required" required placeholder="Required field" helper="Cirkel verschijnt zodra je iets typt." />
              <Input label="Optional" optional placeholder="Optional field" />
              <Input
                label="With validate"
                type="email"
                required
                defaultValue="invalid"
                placeholder="you@example.com"
                validate={(v) => /^\S+@\S+\.\S+$/.test(v) || 'Enter a valid email'}
              />
              <Input label="Disabled" disabled defaultValue="Read-only value" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Input — met icoon</h3>
            <div className="sg-preview is-grid-3 is-tinted">
              <Input label="Search" placeholder="Search materials…" iconBefore={<IconSearch size={14} />} />
              <Input label="Email" type="email" placeholder="you@example.com" iconBefore={<IconMail size={14} />} />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Textarea</h3>
            <div className="sg-preview is-stack is-tinted">
              <Textarea
                label="Description"
                placeholder="Tell us about the material…"
                helper="Max 500 characters."
                required
                rows={4}
                validate={(v) => v.length >= 10 || 'At least 10 characters'}
              />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Select</h3>
            <div className="sg-preview is-grid-3 is-tinted">
              <Select
                label="Default"
                options={[
                  { value: 'wood', label: 'Wood' },
                  { value: 'glass', label: 'Glass' },
                  { value: 'metals', label: 'Metals' },
                  { value: 'composites', label: 'Composites' },
                ]}
                placeholder="Choose a category"
              />
              <Select
                label="Required"
                required
                options={[
                  { value: 'a', label: 'Option A' },
                  { value: 'b', label: 'Option B' },
                ]}
                placeholder="Select…"
                helper="Maak een keuze om de groene cirkel te zien."
              />
              <Select
                label="Disabled"
                disabled
                options={[{ value: 'a', label: 'Option A' }]}
                defaultValue="a"
              />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Checkbox</h3>
            <div className="sg-preview is-stack is-tinted">
              <Checkbox label="I agree to the terms and conditions" required />
              <Checkbox label="Subscribe to newsletter" description="2× per week, no spam." defaultChecked />
              <Checkbox label="Disabled option" disabled />
              <Checkbox label="Disabled and checked" disabled defaultChecked />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Radio group</h3>
            <p className="t-body-sm sg-subsection-desc">
              <code>{'<fieldset>'}</code>/<code>{'<legend>'}</code> met browser-default reset.
              Validatie op groep-niveau via de hook.
            </p>
            <div className="sg-preview is-stack is-tinted">
              <RadioGroup label="Sample request type" name="sg-radio-1" required helper="Kies een type voor de groene cirkel.">
                <Radio value="option-a" label="Standard sample" description="Free, ~5 working days delivery." />
                <Radio value="option-b" label="Express sample" description="€ 25, next-day delivery." />
                <Radio value="option-c" label="Custom request" description="Discuss specifications with the brand." />
              </RadioGroup>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>Complete form — submit-flow</h3>
            <p className="t-body-sm sg-subsection-desc">
              Klik op "Sign up" met velden onvolledig: de submit-knop kleurt rood en toont
              "Please fill in all required fields". Vul alles correct → knop terug naar primary.
            </p>
            <div className="sg-preview is-stack is-tinted">
              <FormStateProvider>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}
                >
                  <Input label="Full name" required placeholder="Your name" />
                  <Input
                    label="Email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    iconBefore={<IconMail size={14} />}
                    validate={(v) => /^\S+@\S+\.\S+$/.test(v) || 'Enter a valid email'}
                  />
                  <Select
                    label="I'm a…"
                    required
                    options={[
                      { value: 'architect', label: 'Architect' },
                      { value: 'designer', label: 'Designer' },
                      { value: 'manufacturer', label: 'Manufacturer' },
                    ]}
                    placeholder="Choose your role"
                  />
                  <Checkbox label="I accept the terms and conditions" required />
                  <SubmitButton>Sign up</SubmitButton>
                </form>
              </FormStateProvider>
            </div>
          </section>

          {/* Cards */}
          <section className="sg-section" id="cards" aria-labelledby="cards-h">
            <div className="sg-section-header">
              <h2 id="cards-h" className="t-display-md">Cards</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<ContentCard>'}</code> voor alle content-types. Sessie 3A batch 3 nieuwe layout:
              Tag als overlay linksboven op de thumb, channel-tags linksonder (max 2),
              body met eyebrow → titel (28px) → meta. <code>isInsiderOnly</code> toont een InsiderMark vóór de titel.
            </p>

            <h3 className="t-display-xs sg-subsection-title">ContentCard — alle types</h3>
            <div className="sg-preview is-grid-3 is-tinted">
              <ContentCard
                href="#material"
                contentType="material"
                thumbBackground="linear-gradient(135deg,#88a800,#4a5800)"
                eyebrow="Eternit"
                title="Recycled Glass Composite"
                meta="Added 12 days ago"
                channelTags={['Sustainability', 'Healthcare']}
                actions={
                  <>
                    <ActionButton size="sm" icon={<IconSave size={14} />} ariaLabel="Save material" />
                    <ActionButton size="sm" icon={<IconCompare size={14} />} ariaLabel="Compare material" />
                  </>
                }
              />
              <ContentCard
                href="#article"
                contentType="article"
                thumbBackground="linear-gradient(135deg,#dce8f8,#4070b0)"
                eyebrow="3 May 2026"
                title="The Quiet Revolution in Bio-based Insulation"
                meta="6 min read"
              />
              <ContentCard
                href="#event"
                contentType="event"
                thumbBackground="linear-gradient(135deg,#d8f0e8,#007838)"
                eyebrow="Amsterdam"
                title="Material Innovation Week 2026"
                meta="15-19 Sep"
              />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>ContentCard — Insider-only</h3>
            <p className="t-body-sm sg-subsection-desc">
              Met <code>isInsiderOnly</code>: kleine teal sterretje-cirkel verschijnt vóór de titel.
            </p>
            <div className="sg-preview is-grid-3 is-tinted">
              <ContentCard
                href="#article-i"
                contentType="article"
                thumbBackground="linear-gradient(135deg,#dce8f8,#4070b0)"
                eyebrow="2 May 2026"
                title="Insider deep-dive: bio-composites from agricultural waste"
                meta="12 min read"
                isInsiderOnly
              />
              <ContentCard
                href="#talk-i"
                contentType="talk"
                thumbBackground="linear-gradient(135deg,#ddf2f5,#007890)"
                eyebrow="Lidewij Edelkoort"
                title="Beyond Sustainability"
                meta="42 min"
                channelTags={['Trends']}
                isInsiderOnly
              />
              <ContentCard
                href="#material-i"
                contentType="material"
                thumbBackground="linear-gradient(135deg,#f4e9d8,#7a5e30)"
                eyebrow="Confidential brand"
                title="Pre-release sample: pigmented bio-resin"
                meta="Just added"
                channelTags={['New', 'Sample']}
                isInsiderOnly
              />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 24 }}>ContentCard — alternatieve ratios</h3>
            <div className="sg-preview is-grid-3 is-tinted">
              <ContentCard
                href="#book"
                contentType="book"
                thumbRatio="portrait"
                thumbBackground="linear-gradient(135deg,#f8f5d0,#706800)"
                eyebrow="2025"
                title="Material Innovation Atlas"
                meta="256 pages"
              />
              <ContentCard
                href="#brand"
                contentType="brand"
                thumbRatio="square"
                thumbBackground="linear-gradient(135deg,#dce8f8,#4070b0)"
                eyebrow="Belgium"
                title="Eternit"
                meta="Building elements"
              />
              <ContentCard
                href="#talk-l"
                contentType="talk"
                thumbRatio="landscape"
                thumbBackground="linear-gradient(135deg,#ddf2f5,#007890)"
                eyebrow="Andrea Trimarchi"
                title="Beyond Sustainability"
                meta="42 min"
              />
            </div>
          </section>

          {/* Skeletons */}
          <section className="sg-section" id="skeletons" aria-labelledby="sk-h">
            <div className="sg-section-header">
              <h2 id="sk-h" className="t-display-md">Skeleton loaders</h2>
            </div>
            <div className="sg-preview is-grid-3 is-tinted">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card">
                  <Skeleton variant="thumb" />
                  <div className="card-body">
                    <Skeleton width="30%" />
                    <Skeleton variant="title" width="90%" />
                    <Skeleton width="50%" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Empty state */}
          <section className="sg-section" id="empty" aria-labelledby="empty-h">
            <div className="sg-section-header">
              <h2 id="empty-h" className="t-display-md">Empty state</h2>
            </div>
            <div className="sg-preview is-stack is-light">
              <EmptyState
                title="No materials found"
                description="Try removing some filters or broadening your search."
                actions={
                  <>
                    <Button variant="outline" size="sm">Clear filters</Button>
                    <Button size="sm">Browse all</Button>
                  </>
                }
              />
            </div>
          </section>

          {/* Pagination */}
          <section className="sg-section" id="pagination" aria-labelledby="pag-h">
            <div className="sg-section-header">
              <h2 id="pag-h" className="t-display-md">Pagination</h2>
            </div>
            <p className="t-body sg-section-desc">
              1-based, met ellipsis voor lange ranges. <code>siblingCount</code> bepaalt
              hoeveel buurpagina's worden getoond rond de huidige.
            </p>
            <div className="sg-preview is-stack is-light">
              <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
              <div className="t-meta" style={{ textAlign: 'center' }}>
                Page {page} of 10
              </div>
            </div>
          </section>

          {/* Breadcrumb */}
          <section className="sg-section" id="breadcrumb" aria-labelledby="bc-h">
            <div className="sg-section-header">
              <h2 id="bc-h" className="t-display-md">Breadcrumb</h2>
            </div>
            <div className="sg-preview is-stack is-light">
              <Breadcrumb
                items={[
                  { label: 'Materials', href: '/materials' },
                  { label: 'Composites', href: '/materials?material_type=composites' },
                  { label: 'Recycled Glass Composite' },
                ]}
              />
            </div>
          </section>

          {/* Filter sidebar — compact */}
          <section className="sg-section" id="filters" aria-labelledby="filters-h">
            <div className="sg-section-header">
              <h2 id="filters-h" className="t-display-md">Filter sidebar</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<FilterSidebar>'}</code> ondersteunt single-select (radio-stijl) en multi-select (checkboxes),
              filter-count badges per sectie, en optionele save-search-knop.
            </p>
            <p className="t-body sg-section-desc">
              <strong>Sessie W6 (09-05-2026)</strong>: drie eerder geparkeerde features zijn al in de
              component aanwezig — collapse/expand per sectie, search-binnen-sectie, en{' '}
              <code>defaultOpen</code>-prop. De preview hieronder activeert ze allemaal:
              "Sustainability" is <code>searchable</code> met veel opties (typ in de zoekbalk om
              te filteren), en "Application" begint <em>ingeklapt</em> (klik op de header om uit te
              klappen). Klik op een section-header om collapse/expand te demonstreren — de chevron
              roteert mee.
            </p>
            <div className="sg-preview is-light" style={{ alignItems: 'flex-start' }}>
              <FilterSidebar
                mobileTrigger={false}
                sections={[
                  {
                    key: 'type',
                    title: 'Material type',
                    defaultOpen: true,
                    selectMode: 'single',
                    options: [
                      { value: 'wood', label: 'Wood', count: 932 },
                      { value: 'glass', label: 'Glass', count: 241 },
                      { value: 'metals', label: 'Metals', count: 89 },
                    ],
                  },
                  {
                    key: 'sustainability',
                    title: 'Sustainability',
                    defaultOpen: true,
                    searchable: true,
                    options: [
                      { value: 'biobased', label: 'Bio-based', count: 89 },
                      { value: 'recycled', label: 'Recycled', count: 167 },
                      { value: 'recyclable', label: 'Recyclable', count: 142 },
                      { value: 'circular', label: 'Circular', count: 78 },
                      { value: 'low-carbon', label: 'Low carbon', count: 211 },
                      { value: 'cradle-to-cradle', label: 'Cradle to cradle', count: 34 },
                      { value: 'compostable', label: 'Compostable', count: 22 },
                      { value: 'biodegradable', label: 'Biodegradable', count: 47 },
                      { value: 'renewable', label: 'Renewable', count: 95 },
                      { value: 'reusable', label: 'Reusable', count: 63 },
                      { value: 'epd-certified', label: 'EPD certified', count: 38 },
                      { value: 'fsc-certified', label: 'FSC certified', count: 81 },
                      { value: 'cradle-certified', label: 'Cradle Cert.', count: 19 },
                    ],
                  },
                  {
                    key: 'application',
                    title: 'Application',
                    defaultOpen: false,
                    options: [
                      { value: 'interior', label: 'Interior', count: 487 },
                      { value: 'exterior', label: 'Exterior', count: 312 },
                      { value: 'flooring', label: 'Flooring', count: 156 },
                      { value: 'wall', label: 'Wall finishes', count: 218 },
                      { value: 'ceiling', label: 'Ceiling', count: 87 },
                      { value: 'facade', label: 'Facade', count: 134 },
                    ],
                  },
                ]}
                selected={filters}
                onChange={setFilters}
                onClearAll={() => setFilters({})}
              />
            </div>
          </section>

          {/* Insider gates */}
          <section className="sg-section" id="insider-gates" aria-labelledby="ig-h">
            <div className="sg-section-header">
              <h2 id="ig-h" className="t-display-md">Insider gates</h2>
            </div>
            <p className="t-body sg-section-desc">
              Content-gating voor visitors/specifiers. Vier varianten: <code>modal</code>,{' '}
              <code>paywall</code>, <code>panel</code>, <code>card</code>. Geen preview-modus —
              toegang of gate.
            </p>
            <p className="t-body sg-section-desc">
              <strong>Sessie 3B correctie 8</strong>: alle varianten herzien naar het mockup-patroon —
              teal-block bovenste helft (icoon-vierkant + INSIDER ONLY-eyebrow + titel + uitleg, in wit),
              wit-block onderste helft met benefits als kaartjes en teal CTA-knop ("Become an Insider").
            </p>

            <h3 className="t-display-xs sg-subsection-title">Modal variant</h3>
            <p className="t-body-sm sg-subsection-desc">
              Pop-up wanneer een free user op een gated feature klikt. Inclusief
              "Don't show this again"-checkbox (sessie 3B correctie 8).
            </p>
            <div className="sg-preview" style={{ gap: 12 }}>
              <Button variant="outline" onClick={() => setGateOpen(true)}>
                Open Insider modal
              </Button>
              <InsiderGate
                variant="modal"
                open={gateOpen}
                onClose={() => setGateOpen(false)}
                onDismissForever={() => { /* preview-only, geen persistence */ }}
                feature="compare"
              />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 32 }}>Card variant</h3>
            <p className="t-body-sm sg-subsection-desc">
              Compacte sidebar-card binnen artikel-content.
            </p>
            <div className="sg-preview is-tinted">
              <InsiderGate variant="card" feature="insights" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 32 }}>Paywall variant</h3>
            <p className="t-body-sm sg-subsection-desc">
              Article cut-off pattern: gefadede preview-content boven de gate.
            </p>
            <div className="sg-preview is-stack is-tinted" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 40 }}>
              <p className="t-body" style={{ maxWidth: 640 }}>
                Recycled glass composites have emerged as one of the most surprising
                solutions to construction-waste reuse — combining post-consumer cullet
                with bio-resins to create surfaces with both unusual translucency and
                high impact resistance.
              </p>
              <p className="t-body" style={{ maxWidth: 640 }}>
                In 2025, a consortium of Belgian and Dutch manufacturers began testing
                these composites in interior cladding for healthcare environments,
                where the aesthetic transparency proved as valuable as the technical
                performance. Early case studies suggest…
              </p>
              <InsiderGate variant="paywall" feature="article" />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 32 }}>Panel variant</h3>
            <p className="t-body-sm sg-subsection-desc">
              Volledig page-niveau (Saved searches, Insider insights, Boards landing).
            </p>
            <div className="sg-preview is-stack is-tinted">
              <InsiderGate variant="panel" feature="savedSearch" />
            </div>
          </section>

          {/* Brand-tier gates */}
          <section className="sg-section" id="brand-tier-gates" aria-labelledby="btg-h">
            <div className="sg-section-header">
              <h2 id="btg-h" className="t-display-md">Brand-tier gates</h2>
            </div>
            <p className="t-body sg-section-desc">
              Functionaliteit-gating voor brand-eigenaren in het dashboard. Navy/grijs styling,
              "Upgrade to {'{tier}'}". Twee varianten: <code>page</code> (geen preview) en
              <code>section</code> (met preview-modus). Section-preview activeert de globale
              <code>{'<PreviewModeIndicator>'}</code> onderaan deze pagina.
            </p>

            <h3 className="t-display-xs sg-subsection-title">Page variant — Plus</h3>
            <div className="sg-preview is-tinted" style={{ minHeight: 320 }}>
              <BrandTierGate
                variant="page"
                required="plus"
                title="Statistics"
                description="See who views and downloads your samples. Plus members get monthly reports including engagement breakdown by region."
                upgradeHref="#upgrade"
              />
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 32 }}>Section variant — Plus, with preview</h3>
            <p className="t-body-sm sg-subsection-desc">
              Klik <strong>Preview</strong> om de gated content tijdelijk te ontgrendelen.
              De globale <code>PreviewModeIndicator</code> verschijnt onderaan de pagina met
              een "Close all previews"-knop.
            </p>
            <div className="sg-preview is-stack is-tinted">
              <BrandTierGate
                variant="section"
                required="plus"
                title="Brochures"
                description="Upload PDF brochures with each material. Plus members can attach up to 3 documents per material."
                upgradeHref="#upgrade"
              >
                <div style={{ padding: 16 }}>
                  <Input label="Brochure title" placeholder="2025 product catalog" />
                  <div style={{ marginTop: 12 }}>
                    <Input label="PDF file" type="file" />
                  </div>
                </div>
              </BrandTierGate>
            </div>

            <h3 className="t-display-xs sg-subsection-title" style={{ marginTop: 32 }}>Section variant — Partner</h3>
            <div className="sg-preview is-stack is-tinted">
              <BrandTierGate
                variant="section"
                required="partner"
                title="Lead routing rules"
                description="Define automated routing rules for incoming sample requests. Partner-tier feature."
                upgradeHref="#upgrade"
              >
                <div style={{ padding: 16 }}>
                  <Select
                    label="Default assignee"
                    options={[
                      { value: 'mark', label: 'Mark Janssen' },
                      { value: 'sara', label: 'Sara de Vries' },
                    ]}
                    placeholder="Choose…"
                  />
                </div>
              </BrandTierGate>
            </div>
          </section>

          {/* ============================================================
              Patterns
              ============================================================ */}

          {/* Detail header pattern */}
          <section className="sg-section" id="detail-header" aria-labelledby="dh-h">
            <div className="sg-section-header">
              <h2 id="dh-h" className="t-display-md">Detail page header</h2>
            </div>
            <p className="t-body sg-section-desc">
              Universele header voor detail-pagina's. Bevat back-knop, content-type tags,
              h1-titel, meta-regel en action-row.
            </p>
            <div className="sg-preview is-stack is-light" style={{ padding: 0 }}>
              <DetailHeader
                back={{ label: 'Materials', href: '/materials' }}
                tags={[{ type: 'content', contentType: 'material' }]}
                title="Recycled Glass Composite"
                meta={
                  <>
                    By <strong>Eternit</strong> · Added 12 days ago · Composites
                  </>
                }
                actions={<DetailActions type="material" itemId={1} includeCompare />}
              />
            </div>
          </section>

          {/* Action row pattern */}
          <section className="sg-section" id="action-row" aria-labelledby="ar-h">
            <div className="sg-section-header">
              <h2 id="ar-h" className="t-display-md">Action row</h2>
            </div>
            <p className="t-body sg-section-desc">
              <code>{'<DetailActions>'}</code> standaardiseert Save / Add to board / Compare / Share met Insider-gating
              voor non-members.
            </p>
            <div className="sg-preview is-light">
              <DetailActions type="material" itemId={1} includeCompare isMember={false} isLoggedIn={false} />
            </div>
            <p className="t-body-sm" style={{ marginTop: 8 }}>
              Hierboven met <code>isMember=false</code> — let op de Insider-marks naast Add to board en Compare.
            </p>
          </section>
        </main>
      </div>
      <PreviewModeIndicator />
    </PreviewModeProvider>
  )
}

// ============================================================
// Sub-componenten — alleen binnen deze page
// ============================================================

function Swatch({ name, token, colorVar }: { name: string; token: string; colorVar: string }) {
  return (
    <div className="sg-swatch">
      <span className="sg-swatch-color" style={{ background: colorVar }} aria-hidden="true" />
      <div className="sg-swatch-meta">
        <div className="sg-swatch-name">{name}</div>
        <div className="sg-swatch-token">{token}</div>
      </div>
    </div>
  )
}

function TypeRow({
  size,
  pixels,
  sample,
}: {
  size: string
  pixels: string
  sample: string
}) {
  return (
    <div className="sg-type-row">
      <div className="sg-type-meta">
        .{size}
        <br />
        {pixels}
      </div>
      <div className={size}>{sample}</div>
    </div>
  )
}

function SpacingRow({ token, px }: { token: string; px: number }) {
  return (
    <div className="sg-spacing-row">
      <div className="sg-type-meta">
        {token}
        <br />
        {px}px
      </div>
      <div className="sg-spacing-bar" style={{ width: `${px}px` }} aria-hidden="true" />
    </div>
  )
}
