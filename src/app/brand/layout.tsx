/**
 * Brands layout — wraps `/brand` en `/brand/[slug]` in een gedeelde
 * `CompareProvider`, zodat compare-state behouden blijft tijdens
 * client-side navigatie binnen de brands-sectie.
 *
 * Sessie 5.
 *
 * Parallel aan de materials-layout: de "Materials by [brand]"-grid op de
 * brand-detail-page rendert `<MaterialCard>`s met compare-functionaliteit.
 * Die delen dezelfde compare-state als /materials via deze Provider, en
 * de CompareBar (op materials-niveau geplaatst) blijft consistent.
 *
 * Geen `<header>`/`<footer>` hier — die zitten in de root-layout en
 * blijven gemount over alle segmenten. Geen metadata-export: de
 * individuele pages leveren hun eigen metadata.
 */

import type { ReactNode } from 'react'
import { CompareProvider } from '@/lib/hooks/useCompare'

export default function BrandsLayout({ children }: { children: ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>
}
