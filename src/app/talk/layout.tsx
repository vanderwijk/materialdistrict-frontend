/**
 * Talks layout — wraps `/talk` en `/talk/[slug]` in een gedeelde
 * `CompareProvider`.
 *
 * Sessie 7. Parallel aan de articles-/brands-layout: de "Latest materials"-
 * en related-blokken in de talk-detail-sidebar (Batch 3) tonen materials met
 * een compare-toggle. Die delen dezelfde compare-state als /materials via
 * deze Provider, zodat de CompareBar consistent blijft tijdens client-side
 * navigatie.
 *
 * Geen `<header>`/`<footer>` hier — die zitten in de root-layout en blijven
 * gemount over alle segmenten. Geen metadata-export: de individuele pages
 * leveren hun eigen metadata.
 */

import type { ReactNode } from 'react'
import { CompareProvider } from '@/lib/hooks/useCompare'

export default function TalksLayout({ children }: { children: ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>
}
