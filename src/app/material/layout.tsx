/**
 * Materials layout — wraps `/material` en `/material/[slug]` in een
 * shared `CompareProvider`, zodat de compare-state behouden blijft tijdens
 * client-side navigatie binnen de materials-sectie.
 *
 * Sessie 4 batch 3.
 *
 * Eén Provider voor zowel overzicht als detail:
 *  - User selecteert materials op /materials → state in Provider
 *  - User klikt door naar /materials/[slug] → Provider blijft mounted
 *    (omdat layout-niveau intact blijft bij segment-navigatie), state
 *    behouden, CompareBar onderaan blijft de selectie tonen
 *  - User klikt "Compare" → navigeert naar /compare (buiten deze layout) —
 *    daar wordt de compare-page apart geïmplementeerd in een volgende sessie
 *
 * Geen `<header>` of `<footer>` hier: die zitten in de root-layout en
 * blijven gemount over alle segmenten.
 *
 * Geen metadata-export hier — de individuele pages (overzicht + detail)
 * leveren hun eigen `generateMetadata`.
 */

import type { ReactNode } from 'react'
import { CompareProvider } from '@/lib/hooks/useCompare'

export default function MaterialsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <CompareProvider>{children}</CompareProvider>
}
