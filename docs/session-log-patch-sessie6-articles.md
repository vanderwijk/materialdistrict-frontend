# Session-log — patch sessie 6 (Articles)

> Append-only patch voor `session-log.md`. Voeg deze sectie toe bovenaan
> onder "Laatste update".

---

## Laatste update
Datum: 28-05-2026
Sessie: Sessie 6 — Articles / Stories (overzicht + detail) ✅

---

## Sessie 6 — Articles / Stories (overzicht + detail) (28-05-2026)

**Status:** ✅ klaar — alle in-scope onderdelen geïmplementeerd; 2 blockers
(W17 D1, W18 D2) + 4 vervolgitems open richting Johan/code-review (zie
`open-issues-patch-sessie6-articles.md`).

**Scope:** stap 6 uit de build-order — `/articles` overzicht +
`/articles/[slug]` detail, met de Insider-only gating-laag volledig
voorbereid (Optie A). Werkwijze: pre-flight-check → 4 batches met akkoord per
batch op productniveau.

### Context deze sessie

- De volledige article-datalaag lag al klaar van sessie 2 (types, mappers,
  content-/wordpress-functies) en is in de pre-flight consistent bevonden —
  geen drift, geen 0-byte-bestanden in de article-keten.
- Twee velden behandeld als **Optie A** (identiek aan het Country-filter in
  sessie 5): story-type (D1) en Insider-only (D2). Frontend volledig gebouwd;
  backend-koppeling is één mapper-plek.
- Mockup-analyse: `renderArticlesOverview()` delegeert naar
  `renderStoriesOverview()`; zowel overzicht als `renderArticleDetail()`
  draaien in de mockup op één dataset (`ALL_STORIES`) met een `type`-veld
  (news/people/collaborations/projects/partner).

### Beslissingen vooraf (pre-flight)

- **Q1 — story-type-laag → Optie A** (volledige type-laag voorbereiden,
  mapper-default, filter-UI gebouwd, filtert pas na Johan). Afgewogen tegen
  alleen-gating (verbouwing later) en afleiden-uit-categoryIds (mismatch-risico).
- **Q2 — body-rendering → contentHtml als één prose-blok** via de bestaande
  `MaterialBody`. Geen pull-quote/materials-mentioned-injectie (broze
  HTML-splitsing vermeden).
- **Q3 — author-resolve → buiten scope** (build-order scope-drift). Byline
  "Story by MaterialDistrict" zoals de mockup; resolve als open issue (S6.1).

### Batches

**Batch 1 — datalaag.** `src/lib/config/story-types.ts` (nieuw: `StoryType`,
`STORY_TYPE_META` 1-op-1 uit mockup, helpers). `type: StoryType` toegevoegd
aan `Article` + `ArticleListItem`; mappers vullen `type: toStoryType(m._story_type)`
(mapt automatisch mee zodra Johan koppelt) + `insiderOnly: false` (één-regel-D2).
`storyType`-param in `ListArticlesParams` → `story_type` naar WP.
`getArticleStoryTypeOptions()` + `StoryTypeOption` in content.ts + barrel.

**Batch 2 — overzicht `/articles`.** `page.tsx` (server: q/story_type/page),
`ArticlesTypeFilter` (single-select type-sidebar met counts + type-kleuren —
bewust geen generieke FilterSidebar), `ArticlesSearchInput`,
`ArticlesPagination`, `layout.tsx` (CompareProvider), `loading.tsx`.
Type-intro-banner, People/Partner-CTA's, featured + `ov-grid-3`, EmptyState,
Nominate-sectie. Article-CSS-sectie in globals.css.

**Batch 3 — detail `/articles/[slug]`.** `page.tsx` (generateMetadata,
notFound, parallelle fetches voor buren/related/sidebar-materials,
`buildArticle` + breadcrumb JSON-LD). `ArticleBodyGate` (D2-gating: preview +
InsiderGate-paywall), `ArticleDetailActions` (Save/Share/board, geen compare),
`ArticleDetailSidebar` (reading-progress, latest-materials, newsletter,
insider-upsell), `ArticlePrevNext`, `ArticleRelated` (by type), `loading.tsx`.
Detail-CSS-sectie in globals.css (incl. `progress-track`/`progress-fill`).

**Batch 4 — docs + eind-zip.** `ArticlesSection` voor de style-guide
(story-type-palet + sample article-card) + page-patch (toegepast op
`page.tsx`), deze logs, gecombineerde eind-zip.

### Verificatie-aanpak (geen volledige codebase-typecheck mogelijk offline)

- Datalaag (types + config + mappers + content + wordpress + facetwp +
  woocommerce + index + utils): geïsoleerde `tsc --strict`
  (`noUnusedLocals`/`noUnusedParameters`) → exit 0.
- Articles overzicht- én detail-laag (page + layout + loading + alle
  `_components`): geïsoleerde TSX-typecheck tegen echte React 19 / Next 15 +
  signature-getrouwe stubs voor niet-geüploade dependencies (Breadcrumb,
  ui-barrel, icons, useCompare, DetailHeader, DetailActions, InsiderGate,
  AuthContext, MaterialBody) → exit 0.
- `ArticlesSection` (style-guide): aparte typecheck → exit 0.
- CSS: brace-balans gecontroleerd (1411/1411 na beide article-CSS-secties;
  baseline was 1313).

**Verificatie-kanttekening (belangrijk voor code-review):** `DetailHeader` zat
niet in de uploads; de typecheck draaide tegen een stub met een afgeleide
`tags`-vorm. De `{ type: 'insider' }`-tagvariant op de article-detailheader is
een aanname — checken bij review (zie S6.2).

### API-velden / structuren ontdekt of bevestigd

- `Article`/`ArticleListItem` hadden `insiderOnly` al (sessie 2); `type`
  toegevoegd in deze sessie.
- `WPArticleRawResponse.meta` is `Record<string, unknown>` — accepteert het
  voorbereide `_story_type`/`_insider_only` zonder type-wijziging.
- `buildArticle` (structured-data) accepteert al `category` → `articleSection`;
  gevuld met het story-type-label.
- Herbruikt zonder wijziging: `ContentCard` (docstring noemt expliciet het
  Insider-only-article-voorbeeld), `MaterialBody`, `InsiderGate`
  (`variant="paywall" feature="article"`), `DetailActions`, `Breadcrumb`,
  `Pagination`, `EmptyState`, `Skeleton`, `buildArticle`/`buildBreadcrumbList`.

### Openstaande issues na deze sessie

- **W17 (🔴)** — `article.type` / story-type ontsluiten (D1). Optie A; mapt
  automatisch mee.
- **W18 (🔴)** — `article.insider_only` ontsluiten (D2). Optie A; één
  mapper-regel. Neem samen met W17 + C14 (talks) mee.
- **S6.1 (🟡)** — author-naam-resolve (`/wp/v2/users/<id>`).
- **S6.2 (🟡)** — `DetailHeader` insider-tag-variant bevestigen bij review.
- **S6.3 (🟢)** — sidebar-parkeringen (compare-toggle latest-materials,
  book-tip met Insider-korting → sessie 9).
- **S6.4 (🟢)** — Nominate-formulier endpoint.

### Wat de volgende sessie (7 — Talks) nodig heeft

- Talks zijn default Insider-only (C14, default `true`) — exact het D2-patroon
  van deze sessie. Als Johan W18 oppakt, kan C14 in één keer mee.
- De gating-laag (`ArticleBodyGate`-aanpak met `InsiderGate`) is herbruikbaar
  als blauwdruk voor talk-gating.
