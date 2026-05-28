# Style-guide patch — batch 4 (sessie 6)

> NB: deze patch is in de eind-zip AL TOEGEPAST op `src/app/style-guide/page.tsx`.
> Dit bestand documenteert alleen wat er gewijzigd is. Je hoeft niets handmatig
> te doen — de bijgewerkte `page.tsx` zit in de zip.

Twee kleine wijzigingen aan `src/app/style-guide/page.tsx` om de nieuwe
`ArticlesSection` te tonen: één import en één render-call.

## Patch 1: import toevoegen

Naast de bestaande section-imports:

```tsx
import { IconsSection } from './sections/IconsSection'
import { BrandsSection } from './sections/BrandsSection'
import { ArticlesSection } from './sections/ArticlesSection'
```

## Patch 2: render-call toevoegen

Direct ná de `<BrandsSection />`-render:

```tsx
          {/* Brands — sessie 5 (overzicht-component) */}
          <BrandsSection />

          {/* Articles / Stories — sessie 6 (story-type-palet + article-card) */}
          <ArticlesSection />
```

## Toelichting

- `ArticlesSection` toont het routing-vrije, distinctieve deel: het
  story-type-palet (`STORY_TYPE_META` — kleur/pale/icoon/desc per type) en een
  voorbeeld article-`<ContentCard>`.
- Bewust NIET in de style-guide: `ArticlesTypeFilter`/`ArticlesSearchInput`/
  `ArticlesPagination` (URL-state via `usePathname`/`useRouter`) en de
  detail-componenten (`ArticleBodyGate`/`ArticleDetailSidebar`/
  `ArticleDetailActions`, auth-afhankelijk). Te zien op echte `/articles`- en
  `/articles/[slug]`-pagina's. Zelfde lijn als `BrandsSection`.
- `'use client'` staat al op `page.tsx` en op `ArticlesSection`.
