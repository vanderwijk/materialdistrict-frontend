'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DetailActions, InsiderGate } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'
import { useCompare } from '@/lib/hooks/useCompare'

interface MaterialDetailActionsProps {
	materialId: number
	materialSlug: string
	materialTitle: string
}

export function MaterialDetailActions({
	materialId,
	materialSlug,
	materialTitle,
}: MaterialDetailActionsProps) {
	const router = useRouter()
	const { isLoggedIn, isMember } = useAuth()
	const { isInCompare, toggleCompare } = useCompare()
	const [gateFeature, setGateFeature] = useState<'boards' | 'compare' | null>(null)

	const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`

	return (
		<>
			<DetailActions
				type="material"
				itemId={materialId}
				shareTitle={materialTitle}
				includeCompare
				isLoggedIn={isLoggedIn}
				isMember={isMember}
				isInCompareList={isInCompare(materialId)}
				onRequireSignIn={() => router.push(signInHref)}
				onRequireInsider={(feature) => setGateFeature(feature)}
				onToggleCompare={() => {
					toggleCompare(materialId)
				}}
			/>

			<InsiderGate
				variant="modal"
				open={gateFeature !== null}
				onClose={() => setGateFeature(null)}
				feature={gateFeature === 'boards' ? 'boards' : 'compare'}
			/>
		</>
	)
}
