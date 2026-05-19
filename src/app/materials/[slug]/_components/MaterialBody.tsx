'use client'

/**
 * MaterialBody
 * ----------------------------------------------------------------------
 * Client-wrapper rond de body-prose van de material-detail-page. Hangt
 * de BodyHighlighter eraan zodat een actieve `?q=` in de URL highlights
 * krijgt in de body-tekst.
 *
 * Geen server-rendering nodig: de HTML wordt via dangerouslySetInnerHTML
 * ingelezen, de highlighter draait post-hydratie als pure client-side
 * DOM-mutatie.
 */

import { useRef } from 'react'
import { BodyHighlighter } from '@/components/ui/BodyHighlighter'

export interface MaterialBodyProps {
  /** HTML-content (uit `material.contentHtml` of `material.excerptHtml`). */
  html: string
}

export function MaterialBody({ html }: MaterialBodyProps) {
  const ref = useRef<HTMLElement | null>(null)
  return (
    <>
      <section
        ref={ref}
        className="mat-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <BodyHighlighter targetRef={ref} />
    </>
  )
}
