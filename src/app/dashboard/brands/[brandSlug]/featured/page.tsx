import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getFeaturedPlacements } from '@/lib/dashboard/data'
import { canManufacturerAccess } from '@/lib/config/membership'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { FeaturedPanel } from '@/components/dashboard/panels/FeaturedPanel'

export default async function BrandFeaturedPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)

  const header = (
    <DashboardPageHeader title="Featured" crumbs={[{ label: brand.name }, { label: 'Featured' }]} />
  )

  if (!canManufacturerAccess(brand.tier, 'Featured placement')) {
    return (
      <>
        {header}
        <BrandTierGate
          variant="page"
          required="partner"
          title="Featured placement"
          description="Promote your materials in prime spots across the platform. Available on the Partner tier."
          upgradeHref={`/dashboard/brands/${brandSlug}/membership`}
        />
      </>
    )
  }

  const placements = await getFeaturedPlacements(brandSlug)
  return (
    <>
      {header}
      <FeaturedPanel placements={placements} />
    </>
  )
}
