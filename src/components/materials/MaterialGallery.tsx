'use client'

/**
 * MaterialGallery — hero + filmstrip voor de material-detailpagina.
 *
 * Sessie 4 batch 2.
 *
 * Gebruikt de bestaande `.mat-gallery-*`-klassen uit
 * `src/styles/globals-additions.css` (al klaar uit sessie 2).
 *
 * Layout:
 *  - Hero: 4/3 aspect-ratio bovenste afbeelding
 *  - Filmstrip: maximaal 5 thumbs onderaan (4 op smalle viewports via CSS),
 *    elk een 1/1 vierkantje. Bij meer dan 5 attachments krijgt de laatste
 *    thumb een "+N"-overlay.
 *  - Klik op een thumb maakt die de actieve hero
 *
 * Data:
 *  - Bron: `Gallery` uit `@/types/media` — bevat `hero` + `thumbs` zoals
 *    gebouwd door `splitGallery()` in `mappers.ts`.
 *  - Eerste render: `gallery.hero` is de actieve afbeelding
 *  - Klik op thumb-index N → activeIndex = N (waarbij index 0 = hero in
 *    de gecombineerde lijst, 1..N = thumbs)
 *
 * Image-fallback (W4 image-conventies):
 *  - Alt-tekst van een attachment is bij OBRO-data vaak leeg.
 *  - Drie-lagen fallback: `attachment.alt` → `title` (prop) → "Material image".
 *
 * Geen afbeeldingen?
 *  - Bij `gallery.hero === null && gallery.thumbs.length === 0` wordt een
 *    placeholder-blok getoond, niet niets. Zorgt dat de detailpagina-layout
 *    niet inklapt.
 */

import { useMemo, useState } from 'react'
import type { Gallery, MediaImage } from '@/types/media'

// --------------------------------------------------------------------
// Props
// --------------------------------------------------------------------

export interface MaterialGalleryProps {
  /** Gallery uit `splitGallery(attachments, featured_media)`. */
  gallery: Gallery
  /** Material-titel — gebruikt als alt-fallback wanneer attachment.alt leeg is. */
  title: string
  /**
   * Max aantal thumbs zichtbaar in de filmstrip. Default: 5. Boven dit
   * aantal krijgt de laatste thumb een "+N"-overlay om aan te geven dat
   * er meer afbeeldingen zijn. (Klik op +N navigeert naar de volgende
   * batch — voor v1 simpelweg naar die specifieke afbeelding zonder
   * uitbreidings-modal.)
   */
  maxThumbsVisible?: number
  /** Extra className op de wrapper. */
  className?: string
}

// --------------------------------------------------------------------
// Component
// --------------------------------------------------------------------

export function MaterialGallery({
  gallery,
  title,
  maxThumbsVisible = 5,
  className,
}: MaterialGalleryProps) {
  // Combineer hero + thumbs tot één geordende lijst voor index-gebaseerde
  // navigatie. Hero is altijd index 0.
  const allImages = useMemo(() => {
    const list: MediaImage[] = []
    if (gallery.hero) list.push(gallery.hero)
    list.push(...gallery.thumbs)
    return list
  }, [gallery])

  const [activeIndex, setActiveIndex] = useState(0)

  // Empty state: geen hero, geen thumbs
  if (allImages.length === 0) {
    return (
      <div
        className={['mat-gallery', className].filter(Boolean).join(' ')}
        aria-label="No images available"
      >
        <div
          className="mat-gallery-hero"
          role="img"
          aria-label={`${title} — no images available`}
        />
      </div>
    )
  }

  const activeImage = allImages[activeIndex] ?? allImages[0]
  const heroSrc =
    activeImage.sizes?.large?.url ??
    activeImage.sizes?.medium_large?.url ??
    activeImage.sourceUrl
  const heroAlt = altFor(activeImage, title)

  // Filmstrip — toon eerste N thumbs; "+N"-overlay op laatste positie
  // wanneer er meer zijn. We laten de actieve hero zelf NIET in de
  // filmstrip zien wanneer hij index 0 is, conform de mockup waar
  // de hero los staat. Wel filmstrip-positie reserveren wanneer
  // hero=index 0 staat zodat klikken op een thumb consistente
  // navigatie geeft.
  const filmstrip = useMemo(() => {
    const items = allImages.map((image, i) => ({ image, originalIndex: i }))
    if (items.length <= maxThumbsVisible) {
      return { visible: items, overflowCount: 0 }
    }
    return {
      visible: items.slice(0, maxThumbsVisible),
      overflowCount: items.length - maxThumbsVisible,
    }
  }, [allImages, maxThumbsVisible])

  return (
    <div className={['mat-gallery', className].filter(Boolean).join(' ')}>
      {/* Hero */}
      <div className="mat-gallery-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroSrc} alt={heroAlt} />
      </div>

      {/* Filmstrip — alleen als er meer dan één afbeelding is */}
      {allImages.length > 1 && (
        <div className="mat-gallery-thumbs" role="list">
          {filmstrip.visible.map(({ image, originalIndex }, displayIndex) => {
            const isActive = originalIndex === activeIndex
            const isLastVisible =
              displayIndex === filmstrip.visible.length - 1
            const showOverflow =
              filmstrip.overflowCount > 0 && isLastVisible
            const thumbSrc =
              image.sizes?.thumbnail?.url ??
              image.sizes?.medium?.url ??
              image.sourceUrl

            return (
              <button
                key={image.id}
                type="button"
                className={[
                  'mat-gallery-thumb',
                  isActive && 'active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveIndex(originalIndex)}
                aria-label={`Image ${originalIndex + 1} of ${allImages.length}`}
                aria-current={isActive ? 'true' : undefined}
                role="listitem"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbSrc} alt={altFor(image, title)} />
                {showOverflow && (
                  <span className="mat-gallery-thumb-more" aria-hidden="true">
                    +{filmstrip.overflowCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

/**
 * Image-alt fallback-keten (W4 image-conventies):
 *   1. attachment.alt (uit WP, vaak leeg op OBRO-data)
 *   2. material-titel (prop)
 *   3. generieke "Material image"
 *
 * Geen lege alt op niet-decoratieve afbeeldingen.
 */
function altFor(image: MediaImage, title: string): string {
  const fromAttachment = image.alt?.trim()
  if (fromAttachment) return fromAttachment
  const fromTitle = title?.trim()
  if (fromTitle) return fromTitle
  return 'Material image'
}
