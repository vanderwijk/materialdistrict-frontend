# Style-guide patch — batch 4 (sessie 5)

> NB: deze patch is in de eind-zip AL TOEGEPAST op `src/app/style-guide/page.tsx`.
> Dit bestand documenteert alleen wat er gewijzigd is. Je hoeft niets handmatig
> te doen — de bijgewerkte `page.tsx` zit in de zip.

Twee kleine wijzigingen aan `src/app/style-guide/page.tsx` om de nieuwe
`BrandsSection` te tonen: één import en één render-call.

## Patch 1: import toevoegen

Naast de bestaande `IconsSection`-import:

```tsx
import { IconsSection } from './sections/IconsSection'
import { BrandsSection } from './sections/BrandsSection'
```

## Patch 2: render-call toevoegen

Direct ná de `<IconsSection />`-render:

```tsx
          {/* Iconen — overzicht van centrale icon-registry */}
          <IconsSection />

          {/* Brands — sessie 5 (overzicht-component) */}
          <BrandsSection />
```

## Toelichting

- In de geüploade `page.tsx` stond alleen `IconsSection` (geen
  `MaterialsSection`), dus `BrandsSection` is ná `IconsSection` geplaatst —
  vóór de generieke UI Components-sectie.
- `BrandsSection` heeft GEEN Provider nodig: `<BrandTile>` is context-loos.
  De auth-afhankelijke detail-componenten zijn bewust niet in de style-guide
  opgenomen (zie toelichting bovenin `BrandsSection.tsx`).
- `'use client'` staat al op `page.tsx`.
