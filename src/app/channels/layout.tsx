/**
 * Channels layout — wraps `/channels` en `/channels/[slug]` in een gedeelde
 * `CompareProvider`.
 *
 * Stap 12. Parallel aan de brands-/articles-layout: de materials-strip op de
 * channel-hub (`/channels/[slug]`) rendert `<MaterialCard>`s met een
 * compare-toggle. Die delen dezelfde compare-state als /materials via deze
 * Provider, zodat de CompareBar consistent blijft tijdens client-side
 * navigatie.
 *
 * Geen `<header>`/`<footer>` hier — die zitten in de root-layout en blijven
 * gemount over alle segmenten. Geen metadata-export: de individuele pages
 * leveren hun eigen metadata.
 */

import type { ReactNode } from 'react'
import { CompareProvider } from '@/lib/hooks/useCompare'

export default function ChannelsLayout({ children }: { children: ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>
}
