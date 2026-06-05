# Replication guide — S13.2 My profile + Insider insights

**For Claude** — replicate these changes in your upstream Next.js repository.  
Johan's repo (`vanderwijk/materialdistrict-frontend`) is the deploy source; you do not have push access there.

**Baseline in Johan's repo:** commit `837c03c` (before S13.2)  
**Final state after this guide:** commits `5b073a3`, `86cabae`, plus slug/WP-alignment commit (see below)

**WP plugin (separate repo):** Johan deployed `profile-options.php` + extended `rest-dashboard.php`. Your frontend should target the API shapes documented below.

---

## File manifest (15 files)

| Action | Path |
|--------|------|
| **NEW** | `src/lib/config/countries.ts` |
| **NEW** | `src/lib/config/profile-options.ts` |
| **NEW** | `scripts/gen-countries.mjs` (generator from theme `inc/countries.php`; optional in your repo) |
| **NEW** | `docs/MANIFEST-s13.2.md` |
| **NEW** | `docs/email-johan-s13.2-profile-insights.txt` |
| **NEW** | `docs/session-log-patch-s13.2-personal-account.md` |
| **MOD** | `src/types/dashboard.ts` |
| **MOD** | `src/lib/dashboard/mappers.ts` |
| **MOD** | `src/lib/dashboard/data.ts` |
| **MOD** | `src/lib/dashboard/mock.ts` |
| **MOD** | `src/app/dashboard/profile/page.tsx` |
| **MOD** | `src/app/dashboard/insider-insights/page.tsx` |
| **MOD** | `src/components/dashboard/panels/ProfileForm.tsx` |
| **MOD** | `src/components/dashboard/panels/InsightsPanel.tsx` |
| **MOD** | `src/styles/globals.css` |

No changes to `src/app/api/dashboard/profile/route.ts` — it already proxies POST with `toWpUserProfile()`.

---

## 1. Types — `src/types/dashboard.ts`

### `UserProfile` — extended fields

```ts
export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  profession: string      // slug from profile-options
  industry: string        // slug (WP usermeta: sector)
  address: string
  postcode: string
  city: string
  country: string
  invoiceToCompany: boolean
  company: string
  vatNumber: string
  avatarUrl: string | null
}
```

### New types

```ts
export interface ProfileFieldOption { value: string; label: string }

export interface ProfileFieldOptions {
  professions: ProfileFieldOption[]
  industries: ProfileFieldOption[]
}
```

### `InsightReport` — new fields

```ts
export interface InsightReport {
  // existing: id, title, summary, date, category, href
  pages: number
  format: string
  gradient: string
  insiderOnly: boolean
  pdfUrl: string | null
}
```

---

## 2. Mappers — `src/lib/dashboard/mappers.ts`

### `RawUserProfile` + `mapUserProfile`

Add snake_case fields: `phone`, `industry`, `address`, `postcode`, `city`, `invoice_to_company`, `vat_number`. Map to camelCase on read.

### New: `mapProfileFieldOptions(raw)`

Maps `{ professions: [{value, label}], industries: [...] }` from WP.

### `toWpUserProfile(p)`

POST body must include all new fields:

```ts
{
  first_name, last_name, email, phone, profession, industry,
  address, postcode, city, country,
  invoice_to_company, company, vat_number,
}
```

### `RawInsight` + `mapInsight`

Add: `pages`, `format`, `gradient`, `insider_only` → `insiderOnly`, `pdf_url` → `pdfUrl`. Defaults: `pages: 0`, `format: 'PDF'`, `gradient: 'linear-gradient(135deg,#d7e8b6,#eef6ff)'`, `insiderOnly: false`, `pdfUrl: null`.

---

## 3. Data layer — `src/lib/dashboard/data.ts`

### New: `getProfileFieldOptions()`

```ts
export async function getProfileFieldOptions(): Promise<ProfileFieldOptions> {
  try {
    const raw = await wpDashboardFetch(...'/md/v2/dashboard/profile-options'...)
    return mergeProfileFieldOptions(mapProfileFieldOptions(raw))
  } catch (err) {
    if (err instanceof DashboardApiError) {
      return mergeProfileFieldOptions({ professions: [], industries: [] })
    }
    throw err
  }
}
```

Import `mergeProfileFieldOptions` from `@/lib/config/profile-options`.

---

## 4. Config — NEW files

### `src/lib/config/countries.ts`

- Mirror of `materialdistrict-theme/inc/countries.php` (240 countries).
- Exports: `COUNTRY_BY_CODE`, `COUNTRY_OPTIONS`, `resolveCountryCode(stored)`, `countryLabel(stored)`.
- Select uses **ISO code** as `value` (e.g. `NL`); WP GET may return label — `resolveCountryCode()` normalises on form init.

### `src/lib/config/profile-options.ts`

- `DEFAULT_PROFILE_FIELD_OPTIONS` — slug values aligned with WP `profile-options.php`:

| Slug | Label (profession) |
|------|-------------------|
| `architect` | Architect |
| `designer` | Designer |
| `furniture-designer` | Furniture designer |
| `product-developer` | Product developer |
| `manufacturer` | Manufacturer |
| `contractor` | Contractor |
| `client` | Client |
| `professor` | Professor |
| `teacher` | Teacher |
| `student` | Student |
| `other` | Other |

| Slug | Label (industry) |
|------|-----------------|
| `architecture` | Architecture (incl Urban Planning…) |
| `interior` | Interior (incl Furniture…) |
| `fashion` | Fashion (incl Apparel…) |
| `mobility` | Mobility (incl Automotive…) |
| `graphic` | Graphic (incl Packaging…) |
| `products` | Products (incl. Consumerproducts…) |
| `other` | Other |

- `mergeProfileFieldOptions(fromWp)` — WP list wins when non-empty; else defaults.
- `withCurrentSelectValue(options, current)` — appends unknown legacy meta as extra option so nothing disappears from the dropdown.

---

## 5. Pages

### `src/app/dashboard/profile/page.tsx`

```tsx
const [profile, options] = await Promise.all([
  getProfile(),
  getProfileFieldOptions(),
])
<ProfileForm initial={profile} options={options} />
```

### `src/app/dashboard/insider-insights/page.tsx`

Rename prop: `locked={!isInsider(user)}` → `isInsider={isInsider(user)}`

---

## 6. `ProfileForm.tsx` — major rewrite

**Props:** `{ initial: UserProfile; options: ProfileFieldOptions }`

**Sections:**
1. Personal details — first/last name, email, phone, profession (Select), industry (Select)
2. Billing & address — street, postcode, city, country (full `COUNTRY_OPTIONS`), invoice-to-company checkbox, conditional company + VAT

**Removed:** avatar upload row (was stub).

**Added:**
- `showFilledState` on inputs
- `resolveCountryCode(initial.country)` on state init
- `professionOptions` / `industryOptions` via `withCurrentSelectValue()`
- Progress bar counts phone, profession, industry, address fields; company/VAT only when `invoiceToCompany`

**Save:** unchanged — `POST /api/dashboard/profile` with full `UserProfile` JSON.

---

## 7. `InsightsPanel.tsx` — redesign

**Prop:** `isInsider: boolean` (was `locked`)

**Behaviour:**
- Non-Insiders: upsell banner (InsiderBadge + pricing + CTA to `/dashboard/membership`)
- Report list always visible (sell value, don't hide)
- Per row: thumbnail (`--cover` gradient), title link, meta (`Apr 2026 · 28 pages · PDF`)
- Download: `canDownload = isInsider || !report.insiderOnly` → Download PDF button or Insider badge
- Empty state: "No reports yet."

**Removed:** `InsiderGate` wrapper, old card layout.

---

## 8. CSS — `src/styles/globals.css`

Replace `.insight-card` block with:

- `.insights-banner`, `.insights-banner-main`, `.insights-banner-title`, `.insights-banner-sub`
- `.insight-row`, `.insight-thumb`, `.insight-row-body`, `.insight-row-title`, `.insight-row-meta`, `.insight-row-action`

Add: `.profile-invoice-fields { margin-top: 14px }`

---

## 9. Mock data — `src/lib/dashboard/mock.ts`

Update `MOCK_PROFILE` and `MOCK_INSIGHTS` to match new types (see Johan's file for exact fixture text).

---

## 10. Johan's changes ON TOP of your S13.2 zip

Your zip used legacy labels (`Architect`, `Interior`) in frontend defaults. Johan changed:

1. **`profile-options.ts`** — slug values (`architect`, `interior`) to match WP plugin
2. **`ProfileForm.tsx`** — `withCurrentSelectValue()` for unknown legacy meta
3. **`countries.ts`** — full country list (your zip had 10-country hardcoded list in ProfileForm)

When replicating: use **slug defaults** + **countries.ts** + **withCurrentSelectValue** — not the original zip's legacy label defaults.

---

## 11. WordPress API contract (live after plugin deploy)

### `GET /md/v2/dashboard/profile-options`

```json
{
  "professions": [{ "value": "architect", "label": "Architect" }],
  "industries": [{ "value": "interior", "label": "Interior (incl …)" }]
}
```

### `GET/POST /md/v2/dashboard/profile`

```json
{
  "first_name": "…",
  "last_name": "…",
  "email": "…",
  "phone": "…",
  "profession": "architect",
  "industry": "interior",
  "address": "…",
  "postcode": "…",
  "city": "…",
  "country": "Netherlands",
  "invoice_to_company": false,
  "company": "…",
  "vat_number": "…",
  "avatar_url": null
}
```

**WP usermeta mapping:**

| API field | Meta key |
|-----------|----------|
| `phone` | `telephone` |
| `profession` | `profession` (stores slug; legacy labels mapped on read) |
| `industry` | `sector` |
| `address` | `address_street` + `address` |
| `postcode` | `postcode` + `zipcode` |
| `invoice_to_company` | `billing_is_company` (`'true'`/`'false'`) |
| `company` | `billing_company_name` / `company` |
| `vat_number` | `billing_vat_number` |

### `GET /md/v2/dashboard/insider-insights` — still pending WP extension

Frontend is ready for `pages`, `format`, `gradient`, `insider_only`, `pdf_url`. Johan has not yet extended the WP payload (still returns basic fields only).

---

## 12. Suggested commit split (your repo)

1. `feat(dashboard): S13.2 profile + insights panels` — types, mappers, data, components, CSS, mock, docs from zip
2. `fix(dashboard): profile dropdowns and full country list` — countries.ts, profile-options.ts, ProfileForm country/profession/industry
3. `fix(dashboard): align profile option slugs with WP registry` — slug defaults + withCurrentSelectValue

Or squash into one commit if you prefer.

---

## 13. Verify

```bash
npm run typecheck
npm run build
```

Manual: `/dashboard/profile` (dropdowns, country list, save), `/dashboard/insider-insights` (banner + row layout).
