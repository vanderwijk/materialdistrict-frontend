/**
 * Materials components barrel
 * ----------------------------------------------------------------------
 * Componenten die specifiek voor de material-pagina's bestaan en niet
 * elders herbruikt worden. Generieke componenten (MaterialCard,
 * CompareBar) staan in `src/components/ui/` omdat ze door andere pages
 * óók aangeroepen kunnen worden (bv. homepage carousels, brand-detail).
 *
 * Imports vanuit pages:
 *
 *   import { MaterialGallery } from '@/components/materials'
 */

export { MaterialGallery } from './MaterialGallery'
export type { MaterialGalleryProps } from './MaterialGallery'
