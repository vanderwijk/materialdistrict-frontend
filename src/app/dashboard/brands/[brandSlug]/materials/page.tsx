import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getBrandMaterials } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { MaterialsPanel } from '@/components/dashboard/panels/MaterialsPanel'

export default async function BrandMaterialsPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const materials = await getBrandMaterials(brandSlug)

  return (
    <>
      <DashboardPageHeader
        title="Materials"
        crumbs={[{ label: brand.name }, { label: 'Materials' }]}
      />
      <MaterialsPanel
        slug={brandSlug}
        brandId={brand.id}
        materials={materials}
        quota={brand.publicationQuota}
        used={brand.publicationsUsed}
      />
    </>
  )
}
