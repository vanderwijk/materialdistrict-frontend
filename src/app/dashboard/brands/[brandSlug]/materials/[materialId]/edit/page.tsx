import { notFound } from 'next/navigation'
import { requireManagedBrand } from '@/lib/dashboard/brand-access'
import { getMaterialForm, getMaterialCategories, getMaterialTypes } from '@/lib/dashboard/data'
import { DashboardPageHeader } from '@/components/dashboard'
import { MaterialForm } from '@/components/dashboard/panels/MaterialForm'

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ brandSlug: string; materialId: string }>
}) {
  const { brandSlug, materialId } = await params
  const { brand } = await requireManagedBrand(brandSlug)

  const id = Number(materialId)
  if (!Number.isFinite(id)) notFound()

  const [form, categoryOptions, typeOptions] = await Promise.all([
    getMaterialForm(brandSlug, id),
    getMaterialCategories(),
    getMaterialTypes(),
  ])

  return (
    <>
      <DashboardPageHeader
        title="Edit material"
        crumbs={[
          { label: brand.name },
          { label: 'Materials', href: `/dashboard/brands/${brandSlug}/materials` },
          { label: form.name || 'Edit material' },
        ]}
      />
      <MaterialForm slug={brandSlug} brandId={brand.id} initial={form} tier={brand.tier} categoryOptions={categoryOptions} typeOptions={typeOptions} />
    </>
  )
}
