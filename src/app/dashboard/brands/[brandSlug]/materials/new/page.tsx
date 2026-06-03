import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getMaterialForm, getMaterialCategories } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { MaterialForm } from '@/components/dashboard/panels/MaterialForm'

export default async function NewMaterialPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>
}) {
  const { brandSlug } = await params
  const { brand } = await requireManagedBrand(brandSlug)
  const [form, categoryOptions] = await Promise.all([
    getMaterialForm(brandSlug, null),
    getMaterialCategories(),
  ])

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
      <MaterialForm slug={brandSlug} brandId={brand.id} initial={form} tier={brand.tier} categoryOptions={categoryOptions} />
    </>
  )
}
