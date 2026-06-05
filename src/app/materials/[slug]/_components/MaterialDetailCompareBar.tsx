'use client'

/**
 * CompareBar voor material-detail — deelt compare-state met het overzicht
 * via CompareProvider in materials/layout.tsx.
 *
 * materialsById bevat minimaal het huidige material zodat thumb + titel
 * kloppen. Overige ids in de lijst vallen terug op CompareBar-fallbacks.
 */

import { useMemo } from 'react'
import { CompareBar } from '@/components/ui'
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
  const materialsById = useMemo(() => {
    const map = new Map<number, MaterialListItem>()
    map.set(material.id, material as MaterialListItem)
    return map
  }, [material])

  return <CompareBar materialsById={materialsById} />
}
