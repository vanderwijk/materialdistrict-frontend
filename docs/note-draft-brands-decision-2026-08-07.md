# Draft brands → geen 404-links (beslissing Claude, 7 augustus 2026)

**Status:** implementatie (API + frontend + admin-notice + soft-404-fix)  
**Triage-export:** [`docs/data/draft-brands-triage-07-08-2026.xlsx`](./data/draft-brands-triage-07-08-2026.xlsx)  
**Eerdere vraag:** [`note-draft-brands-404-2026-08-06.md`](./note-draft-brands-404-2026-08-06.md)

---

## Productkeuze (Claude)

Een brandpagina is een **redactioneel** product, los van material-publicatie.  
“Gepubliceerd material zonder publieke brandpagina” is een **legitieme permanente toestand** (dode bedrijven / archief).

| Niet doen | Wel doen |
|-----------|----------|
| 209 materials offline / massaal brands publishen | Naam blijft zichtbaar op material |
| Fallback `/material?brand=<id>` (bestaat niet) | Geen link + geen “View all” zonder publish-brand |
| | API: `brand_slug: null` + `brand_public: false` als brand ≠ publish |
| | Frontend linkt alleen als `brand_slug` gezet is |
| | Admin-waarschuwing bij publish (niet blokkeren) |

**Triage (Excel):**

- **Archiveren** — 139 brands / 174 materials: dode sites → blijven draft (geen actie na harden)
- **Controleren** — 23 brands / 35 materials (incl. betaalde): redactie besluitkolom

---

## HTTP-status (antwoord op Claude)

Voorheen: **soft 404** — UI “Brand not found”, maar **HTTP 200** (zelfde voor unknown material/article).  
Oorzaak: `app/{type}/[slug]/loading.tsx` streamt een Suspense-shell als 200 vóór `notFound()` de status kan zetten (zelfde les als `[pageSlug]`).

Fix: detail-`loading.tsx` verwijderd voor brand/material/article/talk/event/book; `generateMetadata` op brand roept nu ook `notFound()` aan.

---

## Technisch

### Plugin (`rest-post-meta.php`)

- `brand_id` + `brand_name` altijd (ook draft brands)
- `brand_slug` alleen bij `post_status === publish`
- nieuw: `brand_public` (bool)
- `md_get_brand_summary()` idem (`slug` null + `public`)

### Plugin (admin)

- `includes/md-material-draft-brand-notice.php` — warning op material-edit / na save wanneer brand niet publish is

### Frontend

- Material meta-regel linkte al alleen bij `brandSlug`
- `MoreFromBrand`: “View all” alleen bij `brandSlug` (geen `/material?brand=`-fallback)
- Soft-404: detail `loading.tsx` weg

---

## Redactie

Tabblad **Controleren** in de Excel: 23 brands met website die nog reageert (o.a. RTS-Preidel, ALPI, mFLOR, ReFelt).  
Tabblad **Archiveren**: geen verdere CMS-actie nodig na deze harden.
