import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { DashboardPageHeader } from '@/components/dashboard'
import { DeleteBrandPanel } from '@/components/dashboard/panels/DeleteBrandPanel'

export default async function DeleteBrandPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)

  return (
    <>
      <DashboardPageHeader
        title="Delete brand"
        crumbs={[{ label: brand.name }, { label: 'Delete brand' }]}
      />
      <DeleteBrandPanel brandId={brand.id} brandName={brand.name} />
    </>
  )
}
