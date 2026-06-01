import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getMaterialForm } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { MaterialForm } from '@/components/dashboard/panels/MaterialForm'

export default async function NewMaterialPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const form = await getMaterialForm(brandSlug, null)

  return (
    <>
      <DashboardPageHeader
        title="Add material"
        crumbs={[
          { label: brand.name },
          { label: 'Materials', href: `/dashboard/brands/${brandSlug}/materials` },
          { label: 'Add material' },
        ]}
      />
      <MaterialForm slug={brandSlug} initial={form} tier={brand.tier} />
    </>
  )
}
