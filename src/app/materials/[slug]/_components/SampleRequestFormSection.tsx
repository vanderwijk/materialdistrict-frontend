'use client'

/**
 * SampleRequestFormSection
 * ----------------------------------------------------------------------
 * Dunne client-wrapper rond SampleRequestForm die zelf `useAuth()`
 * aanroept. De detail-page is een server-component en kan dat niet zelf
 * — vandaar deze wrapper. SampleRequestForm blijft als-is bruikbaar voor
 * andere callers die wél een explicit `isLoggedIn`-prop kunnen leveren.
 */

import { SampleRequestForm } from '@/components/materials'
import { useAuth } from '@/components/providers/AuthContext'

export interface SampleRequestFormSectionProps {
  materialId: number
  materialTitle: string
  materialSlug: string
  disabled: boolean
}

export function SampleRequestFormSection({
  materialId,
  materialTitle,
  materialSlug,
  disabled,
}: SampleRequestFormSectionProps) {
  const { isLoggedIn } = useAuth()
  const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`

  return (
    <SampleRequestForm
      materialId={materialId}
      materialTitle={materialTitle}
      isLoggedIn={isLoggedIn}
      disabled={disabled}
      signInHref={signInHref}
    />
  )
}
