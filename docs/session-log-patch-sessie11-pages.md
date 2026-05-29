# Session-log — patch sessie 11 (Standaard contentpagina's, deel 1)

> Voeg dit toe aan `session-log.md`. Datum: 29-05-2026.

## Sessie 11 — Standaard contentpagina's, deel 1 ✅ (build-order stap 11)

Generieke "content page"-template voor de statische, redactionele
site-pagina's, gevoed door het WP-core `page`-posttype. WordPress vereist
geen wijziging — core `/wp/v2/pages` is REST-enabled inclusief Yoast
(`yoast_head_json`). Bron: `instructie-andere-agent-standaard-paginas.md`.

Oplevering gebouwd op de verse main van 29-05; alle gedeelde bestanden
(`wordpress.ts`, `mappers.ts`, `content.ts`, `api/index.ts`, `seo/index.ts`)
zijn in-place gepatcht. Export-/content-diff tegen main: **alleen toevoegingen,
niets verwijderd of gewijzigd** (`comm -13` leeg op alle vijf).

### Nieuwe bestanden
- `src/types/page.ts` — `Page` + `PageSeo` (genormaliseerde Yoast-velden).
- `src/lib/config/static-pages.ts` — `PAGE_SLUG_MAP` (allowlist route-segment →
  WP-slug), `STATIC_PAGE_SLUGS`, `wpSlugForRoute()`. Tevens de beveiligingsgrens.
- `src/lib/seo/page-metadata.ts` — `buildPageMetadata(page, canonicalPath)`:
  Yoast → Next `Metadata`, canonical = frontend-route, robots doorgezet.
- `src/app/[pageSlug]/page.tsx` — generieke server-template: allowlist-gate →
  `notFound()`, `generateStaticParams()` over de allowlist, `generateMetadata()`,
  body via de gedeelde `MaterialBody`-prose-renderer.
- `src/app/[pageSlug]/loading.tsx` — skeleton via het gedeelde `<Skeleton>`.

### Gewijzigde (gedeelde) bestanden — in-place, alleen toevoegingen
- `src/lib/api/wordpress.ts` — `WPPageRaw` + `getPageBySlug()` (zelfde by-slug-
  patroon als `getArticleBySlug`, met `_fields` + `EDITORIAL_REVALIDATE`).
- `src/lib/api/mappers.ts` — `mapPage()`, hergebruikt de bestaande
  `wpRenderedHtml()`-guard (crash-fix) voor `title`/`content`.
- `src/lib/api/content.ts` — page-facing `getPage(slug)` (fetch + map, geen hero).
- `src/lib/api/index.ts` — re-export `getPage`, `getPageBySlug`, `mapPage`.
- `src/lib/seo/index.ts` — re-export `buildPageMetadata`.

### Live routes na deze sessie
`/about`, `/faq`, `/jobs`, `/become-a-partner` (WP-slug `advertise`),
`/privacy-statement`. Onbekende/niet-toegestane segmenten → 404.

### Beslissingen
1. **Eén dynamische route `[pageSlug]` + expliciete allowlist** i.p.v. losse
   route-mappen. De allowlist is de beveiligingsgrens: account-/systeempagina's
   (sign-in, invoices, …) kunnen nooit via deze template publiek worden.
2. **Canonical = frontend-route, niet de Yoast-canonical** (die wijst naar het
   oude WP-domein). Yoast-canonical wordt wél bewaard op `PageSeo.yoastCanonical`
   voor debugging.
3. **`/contact` valt buiten deze template** → eigen route met Gravity
   Forms-maatwerk (eigen form → GF REST). Geblokkeerd op info van Johan (S11.1).
4. **`/sitemap` vervalt als contentpagina** → gedekt door `sitemap.ts` (machine).
   Voorkomt een verouderde dubbele waarheid.
5. **Geen hero, geen "laatst bijgewerkt" in v1.** `featured_media` is op deze
   pagina's vrijwel altijd 0; `modified` is wel gemapt maar niet getoond.
6. **Body via gedeelde `MaterialBody`** (DRY) i.p.v. een eigen prose-container —
   consistente typografie + dark mode, geen tweede prose-systeem, geen nieuwe CSS.

### API-velden / structuren (WP-core `page`)
- `GET /wp/v2/pages?slug=<slug>&per_page=1&_fields=…` → array van 0/1.
- Relevant: `title.rendered`, `content.rendered`, `modified`, `featured_media`
  (meestal 0), en `yoast_head_json` (title, description, og_*, canonical, robots).
- WP-slug ≠ route waar nodig: `advertise` (WP) → `become-a-partner` (route).
