/**
 * Homepage-layout — wrapt de homepage in een `CompareProvider` + rendert de
 * `CompareBar`, zodat de Compare-knoppen op de material-tegels (Latest /
 * Featured materials) werken zoals op de overzichtspagina's.
 *
 * Parallel aan `material/layout.tsx` en `brand/layout.tsx`: zonder provider is
 * `useCompare()` een no-op. De `CompareBar` verschijnt sticky onderaan zodra er
 * een material is toegevoegd en leidt naar `/compare`.
 *
 * Geen `<header>`/`<footer>` hier — die zitten in de root-layout en blijven
 * gemount over alle segmenten. Geen metadata-export: de page levert die zelf.
 */

import type { ReactNode } from 'react'
import { CompareProvider } from '@/lib/hooks/useCompare'
import { CompareBar } from '@/components/ui'

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <CompareProvider>
      {children}
      <CompareBar />
    </CompareProvider>
  )
}
