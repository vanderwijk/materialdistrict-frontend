# Style-guide patch — batch 4 (sessie 4)

Twee kleine wijzigingen aan `src/app/style-guide/page.tsx` om de nieuwe
`MaterialsSection` te tonen. Geen herschrijving van de 1190-regels-file —
alleen één import en één render-call.

## Patch 1: import toevoegen

**Locatie:** regel 59, naast de bestaande `IconsSection`-import.

**Vóór:**

```tsx
import { IconsSection } from './sections/IconsSection'
```

**Ná:**

```tsx
import { IconsSection } from './sections/IconsSection'
import { MaterialsSection } from './sections/MaterialsSection'
```

## Patch 2: render-call toevoegen

**Locatie:** direct ná de `<IconsSection />`-render (regel 270).

**Vóór:**

```tsx
          {/* Iconen — overzicht van centrale icon-registry */}
          <IconsSection />

          {/* ============================================================
              UI Components
              ============================================================ */}
```

**Ná:**

```tsx
          {/* Iconen — overzicht van centrale icon-registry */}
          <IconsSection />

          {/* Materials — batch 2 componenten (sessie 4) */}
          <MaterialsSection />

          {/* ============================================================
              UI Components
              ============================================================ */}
```

## Toelichting

- `MaterialsSection` zit bewust **vóór** de UI Components-sectie omdat het
  een afgeronde feature-set is, niet één van de generieke UI-bouwstenen.
- De sectie heeft een eigen `CompareProvider` zodat de style-guide los werkt
  van de productie-data-laag — geen risico op state-vermenging.
- De `'use client'`-directive zit al op `page.tsx` (vanwege de bestaande
  `useState`-aanroepen), dus geen extra wijziging nodig.
- De `<CompareBar>` in deze sectie rendert vast onderaan de viewport
  (`position: fixed`). In de style-guide overlapt hij niets relevants;
  in productie zit hij in de materials-layout.
