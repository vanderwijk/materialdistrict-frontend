'use client'

/**
 * BrandDetailActions — §F2.9 P7a
 * ----------------------------------------------------------------------
 * Brand-specifieke wrapper rond <DetailActions>. Tot nu toe had de brand-
 * detailpagina geen action-row. Brands kennen alléén Save (bookmark, type
 * 'brands') en Share — géén "Add to board" en géén Compare (dat zijn
 * material-/Insider-features). Daarom includeBoard={false} en geen
 * InsiderGate/BoardPicker.
 *
 * Save sluit aan op de echte bookmark-state (useBookmarks), net als bij
 * materials/articles/talks/events.
 */

import { useRouter } from 'next/navigation'
import { DetailActions } from '@/components/ui/DetailActions'
import { useAuth } from '@/components/providers/AuthContext'
import { useBookmarks } from '@/lib/hooks/useBookmarks'

export interface BrandDetailActionsProps {
  brandId: number
  brandSlug: string
  brandName: string
}

export function BrandDetailActions({
  brandId,
  brandSlug,
  brandName,
}: BrandDetailActionsProps) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { isSaved, toggleBookmark } = useBookmarks()

  function handleRequireSignIn() {
    const next = `/brands/${brandSlug}`
    router.push(`/sign-in?next=${encodeURIComponent(next)}`)
  }

  function handleToggleSave() {
    toggleBookmark('brands', brandId)
  }

  return (
    <DetailActions
      type="brand"
      itemId={brandId}
      shareTitle={brandName}
      includeBoard={false}
      isLoggedIn={isLoggedIn}
      isSaved={isSaved('brands', brandId)}
      onRequireSignIn={handleRequireSignIn}
      onToggleSave={handleToggleSave}
    />
  )
}
