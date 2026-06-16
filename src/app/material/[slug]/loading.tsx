import { Skeleton } from '@/components/ui'

export default function MaterialDetailLoading() {
	return (
		<article className="pub-wrap" aria-busy="true" aria-live="polite">
			<Skeleton width="120px" height="14px" />
			<div className="mat-detail-wrap">
				<div className="mat-gallery">
					<div className="mat-gallery-hero">
						<Skeleton variant="thumb" height="100%" />
					</div>
				</div>

				<div className="mat-info">
					<Skeleton variant="title" width="55%" />
					<Skeleton width="85%" />
					<Skeleton width="75%" />
					<Skeleton width="90%" />
				</div>
			</div>
		</article>
	)
}
