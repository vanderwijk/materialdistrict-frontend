/**
 * IconsSection — overzicht van de centrale icon-registry op `/style-guide`.
 *
 * Itereert over `ICON_REGISTRY` (uit `@/components/ui/icons`) en rendert per
 * categorie een grid met:
 *   - visuele preview van het icoon (de echte component, niet een placeholder)
 *   - semantische naam (zoals geëxporteerd: `IconSave`, `IconCompare`)
 *   - onderliggende bron-pad (bv. `lucide-react/Bookmark`)
 *
 * Architectuur:
 *   - `ICON_REGISTRY` is metadata; voor de visuele rendering is een aparte
 *     `iconMap` nodig die naam → component mapt. Dat dubbele bookkeeping is
 *     bewust: in productie-componenten importeer je `IconSave` direct (geen
 *     string-lookup), de map bestaat alleen voor deze style-guide-pagina.
 *   - Wanneer je een icoon toevoegt aan `index.ts`, voeg je hier ook één regel
 *     in `iconMap` toe. De compiler vangt vergeten entries niet op (mapping is
 *     `Record<string, ComponentType>`), dus we hebben een runtime-check
 *     onderaan die alle registry-namen tegen de map valideert in development.
 *
 * Inline styles: deze file zit in `src/app/style-guide/` (niet in
 * `src/components/`), dus valt onder design-system §8 uitzondering 3
 * (eenmalige page-specifieke layout-tweaks). Toch zijn alle stijlen via
 * klassen geïmplementeerd in `globals.css §40`. Geen inline styles.
 */

'use client'

import type { ComponentType, SVGProps } from 'react'
import {
  // Acties
  IconSave, IconSaved, IconSaveSearch, IconCompare, IconShare, IconBoard,
  IconBoardAdd, IconDelete, IconDownload, IconUpload, IconEdit, IconAdd,
  IconClose, IconSearch, IconFilter, IconFilterAlt, IconCopy, IconExternal,
  // Navigatie
  IconChevronRight, IconChevronLeft, IconChevronUp, IconChevronDown,
  IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown,
  IconMenu, IconMoreHorizontal, IconMoreVertical,
  // Status & feedback
  IconCheck, IconErrorMark, IconWarning, IconInfo, IconAlert, IconLoading,
  IconLock, IconLockOpen, IconShield, IconShieldCheck, IconEye, IconEyeOff,
  // Content-type
  IconMaterial, IconArticle, IconEvent, IconBook, IconBrand, IconTalk,
  IconPeople, IconStory,
  // UI & contact
  IconMail, IconPhone, IconMapPin, IconSettings, IconSun, IconMoon,
  IconCart, IconHeart, IconBell, IconTagFilter, IconImage, IconGlobe,
  IconLogin, IconLogout, IconHelp,
  // Featured & highlight
  IconFeatured,
  // Insider Insights
  IconInsiderInsights,
  // Socials
  IconLinkedin, IconX, IconFacebook, IconInstagram, IconYoutube, IconPinterest,
  // Registry-metadata
  ICON_REGISTRY,
} from '@/components/ui/icons'

// ============================================================
// iconMap: registry-naam → echte component
//
// Lucide-iconen accepteren `size`/`strokeWidth`-props. React-icons accepteren
// een `size`-prop. Beide accepteren `className`. We typen dit als de
// gemeenschappelijke deler.
// ============================================================

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & {
  size?: number | string
  strokeWidth?: number | string
}>

const iconMap: Record<string, IconComponent> = {
  // Acties
  IconSave, IconSaved, IconSaveSearch, IconCompare, IconShare, IconBoard,
  IconBoardAdd, IconDelete, IconDownload, IconUpload, IconEdit, IconAdd,
  IconClose, IconSearch, IconFilter, IconFilterAlt, IconCopy, IconExternal,
  // Navigatie
  IconChevronRight, IconChevronLeft, IconChevronUp, IconChevronDown,
  IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown,
  IconMenu, IconMoreHorizontal, IconMoreVertical,
  // Status & feedback
  IconCheck, IconErrorMark, IconWarning, IconInfo, IconAlert, IconLoading,
  IconLock, IconLockOpen, IconShield, IconShieldCheck, IconEye, IconEyeOff,
  // Content-type
  IconMaterial, IconArticle, IconEvent, IconBook, IconBrand, IconTalk,
  IconPeople, IconStory,
  // UI & contact
  IconMail, IconPhone, IconMapPin, IconSettings, IconSun, IconMoon,
  IconCart, IconHeart, IconBell, IconTagFilter, IconImage, IconGlobe,
  IconLogin, IconLogout, IconHelp,
  // Featured & highlight
  IconFeatured,
  // Insider Insights
  IconInsiderInsights,
  // Socials
  IconLinkedin, IconX, IconFacebook, IconInstagram, IconYoutube, IconPinterest,
}

// Development-time guard: waarschuwt als ICON_REGISTRY een naam bevat die
// niet in iconMap zit (vergeten import na toevoeging van nieuw icoon).
if (process.env.NODE_ENV !== 'production') {
  const missing = ICON_REGISTRY
    .flatMap((c) => c.items.map((i) => i.name))
    .filter((name) => !(name in iconMap))
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[IconsSection] ICON_REGISTRY bevat namen die niet in iconMap staan:',
      missing,
    )
  }
}

// ============================================================
// Section
// ============================================================

export function IconsSection() {
  return (
    <section className="sg-section" id="icons" aria-labelledby="icons-heading">
      <div className="sg-section-header">
        <h2 id="icons-heading" className="t-display-md">Iconen</h2>
        <p className="t-body sg-section-desc">
          Centrale registry op{' '}
          <code>src/components/ui/icons/index.ts</code>. Alle componenten
          importeren via semantische aliases (<code>IconSave</code>,{' '}
          <code>IconCompare</code>) — niet rechtstreeks uit{' '}
          <code>lucide-react</code> of <code>react-icons/fa6</code>. Sizes per
          call meegeven (<code>{`<IconSave size={16} />`}</code>).
        </p>
      </div>

      {ICON_REGISTRY.map((category) => (
        <div key={category.title} className="sg-icon-category">
          <h3 className="t-display-xs sg-subsection-title">{category.title}</h3>
          <p className="t-body-sm sg-subsection-desc">{category.description}</p>
          <div className="sg-icons-grid" role="list">
            {category.items.map((entry) => {
              const Icon = iconMap[entry.name]
              return (
                <div
                  key={entry.name}
                  className="sg-icon-tile"
                  role="listitem"
                  title={entry.description}
                >
                  <div className="sg-icon-preview" aria-hidden="true">
                    {Icon ? <Icon size={22} strokeWidth={1.75} /> : '?'}
                  </div>
                  <div className="sg-icon-meta">
                    <code className="sg-icon-name">{entry.name}</code>
                    <span className="sg-icon-source">{entry.source}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
