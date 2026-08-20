/**
 * EditorialPage — ontworpen weergave van een redactionele WordPress-pagina.
 * ======================================================================
 * De inhoud blijft in WordPress; de vormgeving zit hier. Dat is de enige
 * werkbare verdeling in een headless opzet: een pagebuilder in WP heeft geen
 * effect, want de frontend rendert de HTML zelf.
 *
 * Werking: de pagina wordt op `<h2>` in secties geknipt. Per route geef je een
 * `variants`-map mee die per kop bepaalt hoe die sectie eruitziet. Zo kan de
 * redactie de tekst vrij herschrijven zonder de vormgeving te raken, zolang de
 * koppen blijven staan.
 *
 * Onbekende koppen vallen terug op `prose`. Een pagina die helemaal geen `<h2>`
 * heeft, rendert als gewone tekst — nooit leeg.
 *
 * Varianten:
 *   prose      standaard; kop + lopende tekst
 *   cards      de `<h3>`-blokken worden kaarten naast elkaar (thema's, pijlers)
 *   highlight  getint vlak met accentrand — voor één uitspraak die eruit moet
 *   facts      een `<ul>` wordt een strakke feitenlijst i.p.v. bullets
 *   checklist  een `<ul>` met vinkjes — voorwaarden, criteria
 *   plain      geen kop tonen (kop staat er alleen voor de indeling)
 */

import { Fragment, type ReactNode } from 'react'
import { MdImage } from '@/components/ui/MdImage'

export type SectionVariant =
  | 'prose'
  | 'cards'
  | 'highlight'
  | 'facts'
  | 'checklist'
  | 'plain'

export interface EditorialSection {
  heading: string
  html: string
}

/**
 * Beeld dat ná een sectie geplaatst wordt. De sleutel is de sectiekop via
 * `sectionKey()`, zodat beeld en tekst aan elkaar gekoppeld zijn en niet aan
 * een volgnummer — schuift de redactie een sectie op, dan schuift het beeld mee.
 */
export interface EditorialImage {
  src: string
  /** Alt-tekst. Leeg laten als het beeld puur decoratief is. */
  alt: string
  /** Bijschrift onder het beeld. Optioneel. */
  caption?: string
  /** Fotograaf. Wordt achter het bijschrift gezet. */
  credit?: string
  /** Volle breedte i.p.v. de tekstkolom. Voor overzichtsbeelden. */
  wide?: boolean
}

/** Tekst zonder tags — voor het matchen van koppen op de variantenmap. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Sleutel voor de variantenmap: kleine letters, alleen woorden. */
export function sectionKey(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Knipt de pagina-HTML in secties op `<h2>`. Alles vóór de eerste `<h2>` komt
 * terug als intro (kop leeg) — daar staat doorgaans de lede.
 */
export function splitSections(html: string): EditorialSection[] {
  const parts = html.split(/<h2[^>]*>/i)
  const sections: EditorialSection[] = []

  parts.forEach((part, index) => {
    if (index === 0) {
      if (part.trim()) sections.push({ heading: '', html: part })
      return
    }
    const close = part.search(/<\/h2>/i)
    if (close === -1) return
    sections.push({
      heading: toPlainText(part.slice(0, close)),
      html: part.slice(close + 5),
    })
  })

  return sections
}

/** Haalt de `<h3>`-blokken uit een sectie, voor de kaartweergave. */
function splitCards(html: string): Array<{ title: string; body: string }> {
  const parts = html.split(/<h3[^>]*>/i)
  const cards: Array<{ title: string; body: string }> = []

  parts.forEach((part, index) => {
    if (index === 0) return
    const close = part.search(/<\/h3>/i)
    if (close === -1) return
    cards.push({
      title: toPlainText(part.slice(0, close)),
      body: part.slice(close + 5).trim(),
    })
  })

  return cards
}

/** Trekt de losse `<li>`-items uit de eerste lijst in een sectie. */
function extractListItems(html: string): string[] {
  const list = html.match(/<[uo]l[^>]*>([\s\S]*?)<\/[uo]l>/i)
  if (!list) return []
  return Array.from(list[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((m) =>
    m[1].trim()
  )
}

/** Alles behalve de eerste lijst — de inleidende tekst boven een lijst. */
function stripFirstList(html: string): string {
  return html.replace(/<[uo]l[^>]*>[\s\S]*?<\/[uo]l>/i, '').trim()
}

function Figure({ image }: { image: EditorialImage }) {
  return (
    <figure className={image.wide ? 'ed-figure ed-figure-wide' : 'ed-figure'}>
      <MdImage src={image.src} role="detail-hero" alt={image.alt} />
      {(image.caption || image.credit) && (
        <figcaption>
          {image.caption}
          {image.credit && (
            <span className="ed-figure-credit">
              {image.caption ? ' · ' : ''}
              Photo: {image.credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

interface SectionProps {
  section: EditorialSection
  variant: SectionVariant
}

function Section({ section, variant }: SectionProps) {
  const showHeading = variant !== 'plain' && section.heading.length > 0

  let body: ReactNode

  if (variant === 'cards') {
    const cards = splitCards(section.html)
    const intro = section.html.split(/<h3[^>]*>/i)[0].trim()
    body = (
      <>
        {intro && (
          <div className="ed-prose" dangerouslySetInnerHTML={{ __html: intro }} />
        )}
        <div className="ed-cards">
          {cards.map((card) => (
            <div className="ed-card" key={card.title}>
              <h3 className="ed-card-title">{card.title}</h3>
              <div
                className="ed-card-body"
                dangerouslySetInnerHTML={{ __html: card.body }}
              />
            </div>
          ))}
        </div>
      </>
    )
  } else if (variant === 'facts' || variant === 'checklist') {
    const items = extractListItems(section.html)
    const rest = stripFirstList(section.html)
    body = (
      <>
        {items.length > 0 && (
          <ul className={variant === 'facts' ? 'ed-facts' : 'ed-checklist'}>
            {items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        )}
        {rest && (
          <div className="ed-prose" dangerouslySetInnerHTML={{ __html: rest }} />
        )}
      </>
    )
  } else {
    body = (
      <div className="ed-prose" dangerouslySetInnerHTML={{ __html: section.html }} />
    )
  }

  return (
    <section className={`ed-section ed-section-${variant}`}>
      {showHeading && <h2 className="ed-section-title">{section.heading}</h2>}
      {body}
    </section>
  )
}

interface EditorialPageProps {
  /** Paginatitel — wordt de `<h1>`. */
  title: string
  /** Korte regel onder de titel. Meestal de lede uit WordPress. */
  eyebrow?: string
  /** Ruwe pagina-HTML uit WordPress. */
  html: string
  /** Kop → variant. Sleutels via `sectionKey()`, dus `our-ambition-for-2030`. */
  variants?: Record<string, SectionVariant>
  /** Kop → beeld dat ná die sectie komt. Zelfde sleutels als `variants`. */
  images?: Record<string, EditorialImage>
  /** Extra blok direct onder de hero (bijvoorbeeld beeld). */
  afterHero?: ReactNode
  /** Extra blok onderaan de pagina (bijvoorbeeld een CTA). */
  footer?: ReactNode
}

export function EditorialPage({
  title,
  eyebrow,
  html,
  variants = {},
  images = {},
  afterHero,
  footer,
}: EditorialPageProps) {
  const sections = splitSections(html)
  const intro = sections.find((s) => s.heading === '')
  const rest = sections.filter((s) => s.heading !== '')

  return (
    <main className="ed-page">
      <header className="ed-hero">
        <div className="ed-hero-inner">
          {eyebrow && <p className="ed-eyebrow">{eyebrow}</p>}
          <h1 className="ed-title">{title}</h1>
          {intro && (
            <div
              className="ed-hero-lede"
              dangerouslySetInnerHTML={{ __html: intro.html }}
            />
          )}
        </div>
      </header>

      {afterHero}

      <div className="ed-body">
        {rest.map((section) => {
          const key = sectionKey(section.heading)
          const image = images[key]
          return (
            /*
             * Fragment, geen <div>. Een omhulsel maakte de secties elkaars
             * neven-niet-meer, waardoor `.ed-section + .ed-section` niet meer
             * aansloeg en alle tussenruimte op de pagina wegviel (04-08-2026).
             * Sectie en bijbehorend beeld staan nu als directe kinderen van
             * `.ed-body`, zodat de afstandsregels blijven werken.
             */
            <Fragment key={section.heading}>
              <Section
                section={section}
                variant={variants[key] ?? 'prose'}
              />
              {image && <Figure image={image} />}
            </Fragment>
          )
        })}
      </div>

      {footer}
    </main>
  )
}
