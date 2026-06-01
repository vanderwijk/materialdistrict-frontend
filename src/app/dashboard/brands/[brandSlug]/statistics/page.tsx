import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getBrandStatistics } from '@/lib/dashboard/data'
import { canManufacturerAccess } from '@/lib/config/membership'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { StatisticsPanel } from '@/components/dashboard/panels/StatisticsPanel'

export default async function BrandStatisticsPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)

  const header = (
    <DashboardPageHeader title="Statistics" crumbs={[{ label: brand.name }, { label: 'Statistics' }]} />
  )

  if (!canManufacturerAccess(brand.tier, 'Access to Statistics')) {
    return (
      <>
        {header}
        <BrandTierGate
          variant="page"
          required="basis"
          title="Statistics"
          description="See how your materials perform — views, sample requests and downloads. Available from the Basis tier."
          upgradeHref={`/dashboard/brands/${brandSlug}/membership`}
        />
      </>
    )
  }

  const stats = await getBrandStatistics(brandSlug)
  return (
    <>
      {header}
      <StatisticsPanel stats={stats} />
    </>
  )
}
