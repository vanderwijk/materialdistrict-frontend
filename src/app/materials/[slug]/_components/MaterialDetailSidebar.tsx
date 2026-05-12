'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SampleRequestForm } from '@/components/materials'
import { InsiderGate } from '@/components/ui'
import { useAuth } from '@/components/providers/AuthContext'

interface MaterialDetailSidebarProps {
	materialId: number
	materialSlug: string
	materialTitle: string
	materialCode: string | null
	publishedLabel: string
	transportWeight: string | null
	videoUrl: string | null
	datasheetUrl: string | null
	epdUrl: string | null
	productUrl: string | null
	disableSampleRequest: boolean
}

export function MaterialDetailSidebar({
	materialId,
	materialSlug,
	materialTitle,
	materialCode,
	publishedLabel,
	transportWeight,
	videoUrl,
	datasheetUrl,
	epdUrl,
	productUrl,
	disableSampleRequest,
}: MaterialDetailSidebarProps) {
	const router = useRouter()
	const { isLoggedIn, isMember } = useAuth()
	const [downloadGateOpen, setDownloadGateOpen] = useState(false)

	const signInHref = `/sign-in?next=${encodeURIComponent(`/materials/${materialSlug}`)}`

	const handleProtectedDownload = () => {
		if (!isLoggedIn) {
			router.push(signInHref)
			return
		}

		if (!isMember) {
			setDownloadGateOpen(true)
		}
	}

	return (
		<>
			<aside className="mat-sidebar">
				<div className="mat-brand-block">
					<span className="mat-brand-block-eyebrow">Material details</span>
					<h2 className="mat-brand-block-name">
						{materialCode || 'Material reference'}
					</h2>
					<p className="t-body-sm">Published {publishedLabel}</p>
					{transportWeight && (
						<p className="t-body-sm">Transport weight: {transportWeight}</p>
					)}
					{videoUrl && (
						<a
							className="mat-brand-block-link"
							href={videoUrl}
							target="_blank"
							rel="noreferrer"
						>
							Watch material video
						</a>
					)}
				</div>

				<SampleRequestForm
					materialId={materialId}
					materialTitle={materialTitle}
					isLoggedIn={isLoggedIn}
					disabled={disableSampleRequest}
					signInHref={signInHref}
				/>

				{(datasheetUrl || epdUrl || productUrl) && (
					<section className="mat-downloads">
						<h2 className="mat-downloads-title">Resources</h2>

						{datasheetUrl && (
							<ProtectedDownloadLink
								href={datasheetUrl}
								label="Datasheet"
								meta={isMember ? 'PDF' : isLoggedIn ? 'Insider only' : 'Sign in'}
								allowed={isMember}
								onBlocked={handleProtectedDownload}
							/>
						)}

						{epdUrl && (
							<ProtectedDownloadLink
								href={epdUrl}
								label="EPD"
								meta={isMember ? 'Download' : isLoggedIn ? 'Insider only' : 'Sign in'}
								allowed={isMember}
								onBlocked={handleProtectedDownload}
							/>
						)}

						{productUrl && (
							<a
								className="mat-download-link"
								href={productUrl}
								target="_blank"
								rel="noreferrer"
							>
								<span className="mat-download-link-label">Product page</span>
								<span className="mat-download-link-meta">External</span>
							</a>
						)}
					</section>
				)}
			</aside>

			<InsiderGate
				variant="modal"
				open={downloadGateOpen}
				onClose={() => setDownloadGateOpen(false)}
				feature="download"
			/>
		</>
	)
}

function ProtectedDownloadLink({
	href,
	label,
	meta,
	allowed,
	onBlocked,
}: {
	href: string
	label: string
	meta: string
	allowed: boolean
	onBlocked: () => void
}) {
	if (allowed) {
		return (
			<a className="mat-download-link" href={href} target="_blank" rel="noreferrer">
				<span className="mat-download-link-label">{label}</span>
				<span className="mat-download-link-meta">{meta}</span>
			</a>
		)
	}

	return (
		<button
			type="button"
			className="mat-download-link is-gated"
			onClick={onBlocked}
		>
			<span className="mat-download-link-label">{label}</span>
			<span className="mat-download-link-meta">{meta}</span>
		</button>
	)
}
