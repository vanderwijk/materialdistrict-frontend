import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getFeaturedSlots, getBrandMaterials } from '@/lib/dashboard/data'
import { DashboardApiError } from '@/lib/api/dashboard'
import { canManufacturerAccess } from '@/lib/config/membership'
import { DashboardPageHeader } from '@/components/dashboard'
import { BrandTierGate } from '@/components/ui/BrandTierGate'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconAlert } from '@/components/ui/icons'
import { FeaturedPanel } from '@/components/dashboard/panels/FeaturedPanel'
import type { FeaturedSlotsData } from '@/types/dashboard'

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

  const emptyFeatured: FeaturedSlotsData = {
    total: 4,
    used: 0,
    resetDate: null,
    slots: [],
  }

  let featured = emptyFeatured
  let materials: Awaited<ReturnType<typeof getBrandMaterials>> = []
  let loadError: string | null = null

  try {
    ;[featured, materials] = await Promise.all([
      getFeaturedSlots(brandSlug),
      getBrandMaterials(brandSlug),
    ])
  } catch (err) {
    console.error('[featured] load failed', err)
    if (err instanceof DashboardApiError) {
      loadError = `${err.message} (${err.code}, HTTP ${err.status})`
    } else if (err instanceof Error) {
      loadError = err.message
    } else {
      loadError = 'Could not load featured data from WordPress.'
    }
  }

  if (loadError) {
    return (
      <>
        {header}
        <div className="dash-panel">
          <EmptyState
            icon={<IconAlert size={28} />}
            title="Could not load featured weeks"
            description={loadError}
          />
        </div>
      </>
    )
  }

  const bookable = materials
    .filter((m) => m.status === 'online')
    .map((m) => ({ id: m.id, name: m.name }))

  return (
    <>
      {header}
      <FeaturedPanel brandId={brand.id} featured={featured} materials={bookable} />
    </>
  )
}
