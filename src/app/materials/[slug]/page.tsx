import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DetailHeader } from '@/components/layout/DetailHeader'
import { MaterialGallery } from '@/components/materials'
import { getMaterial } from '@/lib/api'
import { JsonLd, buildBreadcrumbList, buildProduct } from '@/lib/seo'
import { humanizeFacet, toMaterialTags } from '@/lib/utils/material-properties'
import { MaterialDetailActions } from './_components/MaterialDetailActions'
import { MaterialDetailSidebar } from './_components/MaterialDetailSidebar'

interface MaterialDetailPageProps {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({
	params,
}: MaterialDetailPageProps): Promise<Metadata> {
	const { slug } = await params
	const material = await getMaterial(slug, { resolve: { gallery: false } })

	if (!material) {
		return {
			title: 'Material not found',
			robots: { index: false, follow: false },
		}
	}

	const description = material.shortDescription ?? stripHtml(material.excerptHtml)

	return {
		title: material.title,
		description: description || undefined,
		alternates: { canonical: `/materials/${material.slug}` },
		openGraph: {
			title: material.title,
			description: description || undefined,
			type: 'article',
			url: `/materials/${material.slug}`,
		},
	}
}

export default async function MaterialDetailPage({
	params,
}: MaterialDetailPageProps) {
	const { slug } = await params
	const material = await getMaterial(slug)

	if (!material) {
		notFound()
	}

	const tags = toMaterialTags(material.properties)
	const publishedLabel = formatDate(material.date)
	const productJsonLd = buildProduct({
		slug: material.slug,
		title: material.title,
		description: material.shortDescription ?? stripHtml(material.excerptHtml),
		heroImage:
			material.gallery.hero?.sizes.large?.url ?? material.gallery.hero?.sourceUrl,
		properties: tags.map((tag) => ({
			name: humanizeFacet(tag.facet),
			value: tag.label,
		})),
	})

	return (
		<>
			<article className="pub-wrap">
				<DetailHeader
					back={{ label: 'Materials', href: '/materials' }}
					tags={[{ type: 'content', contentType: 'material' }]}
					title={material.title}
					meta={
						<>
							{material.materialCode && (
								<>
									Code <strong>{material.materialCode}</strong> ·{' '}
								</>
							)}
							Published <strong>{publishedLabel}</strong>
						</>
					}
					actions={
						<MaterialDetailActions
							materialId={material.id}
							materialSlug={material.slug}
							materialTitle={material.title}
						/>
					}
				/>

				{material.shortDescription && (
					<p className="mat-info-excerpt">{material.shortDescription}</p>
				)}

				<div className="mat-detail-wrap">
					<MaterialGallery gallery={material.gallery} title={material.title} />
					<MaterialDetailSidebar
						materialId={material.id}
						materialSlug={material.slug}
						materialTitle={material.title}
						materialCode={material.materialCode}
						publishedLabel={publishedLabel}
						transportWeight={material.transportWeight}
						videoUrl={material.videoUrl}
						datasheetUrl={material.datasheetUrl}
						epdUrl={material.epdUrl}
						productUrl={material.productUrl}
						disableSampleRequest={material.disableSampleRequest}
					/>
				</div>

				{material.contentHtml ? (
					<section
						className="mat-body"
						dangerouslySetInnerHTML={{ __html: material.contentHtml }}
					/>
				) : material.excerptHtml ? (
					<section
						className="mat-body"
						dangerouslySetInnerHTML={{ __html: material.excerptHtml }}
					/>
				) : null}

				{tags.length > 0 && (
					<section className="mat-properties">
						<div className="mat-property-group">
							<p className="mat-property-group-label">Properties</p>
							<ul className="mat-property-group-tags">
								{tags.map((tag) => (
									<li key={`${tag.facet}:${tag.label}`} className="mat-property-tag">
										<span className="mat-property-tag-key">
											{humanizeFacet(tag.facet)}
										</span>
										<span>{tag.label}</span>
									</li>
								))}
							</ul>
						</div>
					</section>
				)}
			</article>

			<JsonLd
				data={[
					buildBreadcrumbList([
						{ label: 'Home', url: '/' },
						{ label: 'Materials', url: '/materials' },
						{ label: material.title },
					]),
					productJsonLd,
				]}
			/>
		</>
	)
}

function stripHtml(value: string): string {
	return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(value: string): string {
	return new Date(value).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}
