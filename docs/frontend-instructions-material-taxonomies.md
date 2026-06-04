# Frontend-instructies — material type & categories (materiaalformulier)

> **Voor:** frontend-agent (Claude / dashboard Next.js)
> **Van:** Johan (WordPress)
> **Datum:** 03-06-2026
> **Status:** te implementeren in `materialdistrict-frontend`

---

## 0. Samenvatting

Het materiaalformulier heeft **twee gescheiden velden**, elk gekoppeld aan een **eigen WP-taxonomie**:

| Formulierveld | WP-taxonomie | Betekenis |
|---|---|---|
| **Material type** (1 dropdown) | `material_category` | Materiaalsoort (Ceramics, Glass, Metals, Wood, …) |
| **Categories** (3 cascade-dropdowns) | `product_category` | Toepassing/context (Building Elements → Ceilings → …) |

**Belangrijk:** dit zijn **niet** dezelfde taxonomie. Geen hardcoded lijsten meer — beide dropdowns moeten uit WP REST-endpoints komen.

---

## 1. Fout in eerdere implementatie (corrigeren)

De eerste dashboard-implementatie gebruikte **`_material_dashboard_type` post meta** voor material type (hardcoded lijst Wood/Composite/Textile/… in de frontend, opslag als vrije tekst in meta).

**Dat klopt niet met WordPress:**

- Alle **bestaande materialen** in WordPress gebruiken al de taxonomie **`material_category`** voor materiaalsoort (legacy WP admin-metabox + REST `material_category[]` op het material-post).
- `_material_dashboard_type` is een **dashboard-only meta-veld** dat **niet** de bron van waarheid is en **niet** overeenkomt met de productiedata.
- De categories-endpoint gebruikte aanvankelijk ten onrechte ook `material_category` — dat moet **`product_category`** zijn (218 terms, 3 niveaus).

**Frontend moet dus:**

1. Material type **niet** hardcoden en **niet** als vrije tekst/`type`-string opslaan.
2. Material type lezen en schrijven via **`material_category` term-id**.
3. Categories blijven via **`product_category` term-id's** (cascade L1/L2/L3).
4. Geen afhankelijkheid van `_material_dashboard_type` — dat veld verdwijnt uit het contract.

---

## 2. WP-endpoints (live na plugin-deploy)

Auth: `Authorization: Bearer <JWT>` (zelfde als andere dashboard-endpoints).

### 2.1 Material types

```
GET /md/v2/dashboard/material-types
```

Response:

```json
[
  { "id": 5, "name": "Ceramics" },
  { "id": 8, "name": "Glass" },
  { "id": 9, "name": "Metals" }
]
```

- Bron: **`material_category`** taxonomy (vlak, ~10 terms op productie).
- Single-select: één term per materiaal.

### 2.2 Product categories (cascade)

```
GET /md/v2/dashboard/material-categories
```

Response (leaf terms only):

```json
[
  {
    "id": 2044,
    "l1": "Floor- & Wall Coverings",
    "l2": "Wall Coverings",
    "l3": "Acoustic Wall Panels"
  }
]
```

- Bron: **`product_category`** taxonomy (~218 terms, hiërarchisch).
- Multi-select: meerdere leaf-paden mogelijk.

---

## 3. Material form contract

### 3.1 GET `…/brands/{brandId}/materials/{id}`

Relevante velden:

```json
{
  "type": "8",
  "categories": [
    { "id": "2044", "l1": "Floor- & Wall Coverings", "l2": "Wall Coverings", "l3": "Acoustic Wall Panels" }
  ]
}
```

- **`type`** = stringified **`material_category` term_id** (niet de naam, niet meta).
- **`categories[]`** = toegewezen **`product_category`** leaf terms met pad.

Leeg `type` (`""`) = geen material type toegewezen.

### 3.2 POST/PATCH save body

```json
{
  "name": "…",
  "description": "…",
  "type_id": 8,
  "categories": [{ "id": 2044 }],
  "featured_image_id": 123,
  "gallery_attachment_ids": [],
  "download_attachment_ids": [],
  "videos": [],
  "keywords": [],
  "channels": []
}
```

- **`type_id`** (integer) → WP zet `material_category` term op het material-post.
- **`categories: [{ id }]`** → WP zet `product_category` terms.
- Stuur **geen** `_material_dashboard_type` / vrije `type`-string meer.

---

## 4. Frontend-implementatie (checklist)

### 4.1 Types (`src/types/dashboard.ts`)

```ts
export interface MaterialTypeOption {
  id: string
  name: string
}

export interface MaterialFormData {
  // …
  /** material_category term id (stringified) */
  type: string
}
```

### 4.2 Data layer (`src/lib/dashboard/data.ts`)

- `getMaterialTypes()` → `GET /md/v2/dashboard/material-types`
- Bestaand: `getMaterialCategories()` → `GET /md/v2/dashboard/material-categories`
- Bij 404/leeg endpoint: lege lijst + placeholder in UI (form blijft bruikbaar voor overige velden).

### 4.3 Mappers (`src/lib/dashboard/mappers.ts`)

- `mapMaterialTypeOptions(raw)` → `MaterialTypeOption[]`
- `toWpMaterialForm(form)` → stuur `type_id: Number(form.type)` i.p.v. `type: "Wood"`

### 4.4 UI (`MaterialForm.tsx` + pages)

- Verwijder hardcoded `MATERIAL_TYPES` array.
- Prop `typeOptions: MaterialTypeOption[]` vanuit server page (`Promise.all` met form + categories + types).
- Material type `<Select>`: `value={typeSelectValue}`, options `{ value: t.id, label: t.name }` (zie 4.5).
- Categories cascade: ongewijzigd contract, gevoed door `categoryOptions` uit `product_category`.

Pages aanpassen:

- `src/app/dashboard/brands/[brandSlug]/materials/new/page.tsx`
- `src/app/dashboard/brands/[brandSlug]/materials/[materialId]/edit/page.tsx`

### 4.5 MaterialForm — extra fixes (verplicht meenemen)

Naast de taxonomy-wiring staan er drie gerelateerde fixes in `MaterialForm.tsx` die je **ook** moet doorvoeren:

**1. Material type Select — legacy-waarden**

`form.type` kan een oude vrije tekst bevatten (bijv. `"Wood"` uit `_material_dashboard_type`) die niet in `typeOptions` staat. Bind de Select alleen aan een geldig catalogue-id:

```tsx
const typeSelectValue = typeOptions.some((t) => t.id === form.type) ? form.type : ''
// …
<Select value={typeSelectValue} … />
```

**2. Category state — functionele updates**

`addCategory`, `removeCategory` en `updateCategory` moeten `setForm(f => …)` gebruiken, niet `set('categories', form.categories.map(…))` met stale closure.

**3. Channel chips — `aria-pressed` (Edge Tools / a11y linter)**

Geen JSX-expressie op `aria-pressed` (`{selected ? 'true' : 'false'}` faalt de linter). Render twee takken met **statische** string-attributen:

```tsx
{ALL_CHANNELS.map((channel) => {
  const selected = form.channels.includes(channel)
  const chipProps = { type: 'button' as const, className: `chip ${selected ? 'is-on' : ''}`, onClick: () => toggleChannel(channel), children: channel }
  return selected ? (
    <button key={channel} {...chipProps} aria-pressed="true" />
  ) : (
    <button key={channel} {...chipProps} aria-pressed="false" />
  )
})}
```

Zelfde patroon toepassen op channel-chips in `BrandProfileForm.tsx` als die linter daar ook klaagt.

---

## 5. Referentie-implementatie (test-build)

Johan heeft een **tijdelijke test-build** gedeployed met bovenstaande wijzigingen zodat je tegen live WP kunt testen zodra de plugin-endpoints op productie staan.

Die build is **niet** de definitieve PR van jou — implementeer dit zelf in jullie workflow en review de diff tegen deze instructie.

---

## 6. Testplan

1. **Plugin live?** Controleer:
   - `GET /wp-json/md/v2/dashboard/material-types` → ~10 items
   - `GET /wp-json/md/v2/dashboard/material-categories` → ~180+ leaf items (niet 10)
2. **Bestaand materiaal openen** dat in WP admin al een Material Category heeft → dropdown toont juiste term (via term-id, niet meta).
3. **Material type wijzigen + opslaan** → WP admin toont nieuwe `material_category`; geen `_material_dashboard_type` meta.
4. **Category cascade** → L1/L2/L3 uit `product_category`; save zet `product_category` terms.
5. **Geen overlap** → material type toont Ceramics/Glass/Metals; categories toont Building/Furniture/Floor-&-Wall etc.

Test-URL dashboard: `https://materialdistrict-frontend.vercel.app/dashboard`

---

## 7. WP-side (ter info — Johan)

Plugin-wijzigingen (niet jouw scope, wel nodig voor live test):

- `GET /md/v2/dashboard/material-types` (nieuw)
- `GET /md/v2/dashboard/material-categories` → `product_category` (was foutief `material_category`)
- Form GET: `type` = `material_category` term-id
- Form save: `type_id` → `wp_set_post_terms(…, 'material_category')`
- Legacy `_material_dashboard_type` meta wordt bij save verwijderd; alleen nog fallback bij read voor materialen die per ongeluk alleen meta hadden

Zie ook: `docs/wordpress-instructions-material-categories.md` (WP-verzoek categories-endpoint).
