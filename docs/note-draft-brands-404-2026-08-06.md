# Notitie / mail aan Claude — draft brands → 404 op `/brand/[slug]`

**Datum:** 6 augustus 2026  
**Van:** Johan  
**Aan:** Claude  
**Status:** besloten + implementatie 7-08-2026 — zie [`note-draft-brands-decision-2026-08-07.md`](./note-draft-brands-decision-2026-08-07.md)  
**Productie-voorbeeld:** [Rivets](https://materialdistrict.com/material/rivets/) → [architectural-textiles-ltd](https://materialdistrict.com/brand/architectural-textiles-ltd/) (Brand not found)

---

**Onderwerp:** Draft brands met gepubliceerde materials → 404 op `/brand/[slug]` (o.a. Rivets)

Hoi Claude,

Kun je hier een beslissing/oplossing voor voorstellen? We kwamen dit tegen via een gebruikerspad op productie.

### Symptoom

Op https://materialdistrict.com/material/rivets/ staat de brand als **Wallcovering Agencies Ltd**.  
“View all →” (en de brand-link) gaan naar:

https://materialdistrict.com/brand/architectural-textiles-ltd/

Die pagina toont **Brand not found** (soft 404).

### Oorzaak (CMS)

| | |
|---|---|
| Material | `rivets` (ID 2626, publish) |
| `_material_brand` | **4039** |
| Brand title | Wallcovering Agencies Ltd |
| Brand slug | `architectural-textiles-ltd` (oude bedrijfsnaam) |
| Brand status | **draft** |

Die brand staat in `brands-opschonen-johan.csv` als **archiveren / dode-brands**. De material-REST geeft wel `brand_slug` + `brand_name` terug (ook voor draft brands), maar `getBrand(slug)` op de frontend haalt alleen **published** brands op → `notFound()`.

Zelfde brand hangt ook aan gepubliceerde materials: `geology`, `lacquered-stri`.

Dit is **geen frontend-bug** in de zin van een verkeerde hardcoding: de UI volgt correct de `brand_slug` uit de API. Het mismatcht met de publieke brandpagina.

**Relevante frontend:** `MoreFromBrand.tsx` (`View all` → `/brand/${brandSlug}`), brand-naam-link op material-detail, `getBrand()` in `src/lib/api/content.ts`.

### Scope — niet één case

Scan op CMS (6 aug 2026): **162 draft (niet-publish) brands** met in totaal **209 gepubliceerde materials**. Voorbeelden (top):

| Brand ID | Status | # materials | Slug | Titel |
|----------|--------|-------------|------|-------|
| 52616 | draft | 6 | `rts-preidel` | RTS-Preidel |
| 3132 | draft | 5 | `tt-projects` | TT Projects |
| 3361 | draft | 4 | `alpi-spa` | ALPI |
| 4039 | draft | 3 | `architectural-textiles-ltd` | Wallcovering Agencies Ltd (`rivets`, `geology`, `lacquered-stri`) |
| … | draft | … | … | plus ~137 andere brands |

Elke “View all” / brand-naam-link vanaf die materials kan naar een 404-brandpagina leiden.

### Mogelijke richtingen (jouw keuze graag)

1. **Data:** draft brands met live materials weer **publish**en (en waar nodig slug normaliseren), óf materials ontkoppelen/offline zetten als de brand bewust dood is.
2. **API:** `brand_slug` / brand-links alleen exposen als de brand `publish` is; anders `null` → frontend valt terug op `/material?brand=<id>` of toont geen “View all”.
3. **Frontend harden:** vóór linken checken of brand publiek bestaat; zo niet → geen `/brand/…`-link (of filter-URL).
4. **Combinatie** van data-opschoning + harden, zodat dit na de brand-cleanup niet terugkomt.

### Vraag aan jou

Wat is de juiste productkeuze voor MaterialDistrict?

- Mogen draft/“dode” brands nog zichtbaar zijn via material-pages (naam + “More from”)?
- Zo nee: moeten we links afschermen, materials archiveren, of brands weer publiceren?
- Wil je dat we eerst een volledige export maken van die 162×209-cases voor redactionele triage?

Graag jouw voorstel (en eventueel prioriteit t.o.v. andere post-launch items).

Groet,  
Johan

---

## Technische notities (voor implementatie later)

- CMS-check (voorbeeld): `wp post get 4039` → `draft`, `post_name=architectural-textiles-ltd`
- Materials met `_material_brand=4039`: 2626 (`rivets`), 2638 (`geology`), 2639 (`lacquered-stri`) — alle `publish`
- Opschoonbron: `materialdistrict-plugin/docs/data/2026-08-04/brands-opschonen-johan.csv` regel `4039,...,archiveren,,dode-brands`
