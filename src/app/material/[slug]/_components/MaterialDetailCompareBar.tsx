'use client'

/**
 * CompareBar voor material-detail — deelt compare-state met het overzicht
 * via CompareProvider in materials/layout.tsx.
 *
 * Registreert het huidige material zodat titel/thumb in de bar kloppen,
 * ook wanneer het al eerder vanuit het overzicht was toegevoegd.
 */

import { useEffect } from 'react'
import { CompareBar } from '@/components/ui'
import { useCompare, type CompareMaterialSnapshot } from '@/lib/hooks/useCompare'
import type { MaterialListItem } from '@/types/material'

export interface MaterialDetailCompareBarProps {
  material: Pick<
    MaterialListItem,
    'id' | 'title' | 'brandName' | 'hero' | 'slug' | 'link'
  >
}

export function MaterialDetailCompareBar({
  material,
}: MaterialDetailCompareBarProps) {
  const { registerCompareMaterial } = useCompare()

  useEffect(() => {
    const snapshot: CompareMaterialSnapshot = {
      id: material.id,
      title: material.title,
      brandName: material.brandName,
      hero: material.hero,
      slug: material.slug,
      link: material.link,
    }
    registerCompareMaterial(snapshot)
  }, [material, registerCompareMaterial])

  return <CompareBar />
}
