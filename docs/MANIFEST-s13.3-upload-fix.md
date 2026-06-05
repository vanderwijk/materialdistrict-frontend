# MANIFEST — S13.3 follow-up 2: upload-401 fix (05-06-2026)

Repliceert Johan's WP-fix (plugin master `3cb0676`) aan frontend-zijde. Uploads
gaan nu naar het scoped endpoint `POST /md/v2/dashboard/brands/{id}/media`.
Type-check (`tsc --noEmit`) groen.

## Gewijzigd
- `src/app/api/dashboard/media/route.ts`
  Leest `file` + `brand_id` (verplicht, 400 zonder) + `context`
  (`image`|`document`) uit FormData; forward als multipart naar het scoped
  endpoint met Bearer-JWT (geen handmatige Content-Type); mapt `{id,name,url}`
  → MaterialAsset.
- `src/components/dashboard/panels/MaterialForm.tsx`
  `uploadFile(file, context)` stuurt `brand_id` + `context` mee; GalleryField
  = image, DownloadsField = document, featured = image.
- `src/components/dashboard/panels/BrandProfileForm.tsx`
  Idem; `brand_id` uit `form.brandId`; logo/gallery = image, downloads = document.

## Niet gewijzigd (bewust)
- `GalleryField.tsx` / `DownloadsField.tsx` — `onUpload(file)`-interface intact.
- Save-mappers / `toWpMaterialForm()` — gallery-payload ongemoeid.
- `types/dashboard.ts`.

## Root
- `session-log.md` — volledige versie met de upload-fix-follow-up.
