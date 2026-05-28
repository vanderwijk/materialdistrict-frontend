# Open issues — patch sessie 6 (Articles)

> Append-only patch voor `open-issues.md`. Voeg de nieuwe items toe onder de
> bestaande 🔴/🟡-secties, en plak de changelog-entry onderaan het
> Wijzigingen-blok (volgende versie: **v1.8**).

---

## 🔴 Blocker richting Johan — Articles-segmentatie & gating

### W17. `article.type` (story-type / D1) ontsluiten 🔴

**Eigenaar:** WP-developer (Johan) + opdrachtgever
**Raakt:** sessie 6 (`/articles` overzicht-filter + type-pills + related-by-type)
**Bron:** sessie 6 pre-flight; `database-uitbreidingen-instructie-johan.md` §D1

Het articles-overzicht is volledig gebouwd op een story-type-segmentatie in
vijf types: `news`, `people`, `collaborations`, `projects`, `partner` (1-op-1
uit de mockup `STORY_TYPE_META`, vastgelegd in `src/lib/config/story-types.ts`).

Status frontend (Optie A — voorbereid, identiek aan het Country-filter S5.1):
- `Article.type` / `ArticleListItem.type` bestaan (TypeScript).
- De mapper vult `type: toStoryType(m._story_type)` — valt nu terug op de
  default `'news'` en **mapt automatisch mee zodra Johan het veld levert,
  zonder frontend-wijziging.**
- De type-filter-sidebar (`ArticlesTypeFilter`), de type-pills en de
  type-intro-banner renderen; de `?story_type=`-param gaat klaar richting WP
  via `listArticles({ storyType })` → `story_type`.
- Zolang het veld niet gekoppeld is filtert WP nog niet op type en mapt alles
  op `'news'`; de UI markeert dat met een indicatieve-counts-hint. De vlag
  `STORY_TYPE_BACKEND_CONNECTED` in `articles/page.tsx` flipt dit zodra
  bevestigd.

**Wat de WP-kant moet leveren (beslissing nodig):**
- `article.type` als ENUM/string-veld **of** een `story_type`-taxonomy. Een
  taxonomy heeft de voorkeur (uitbreidbaar zonder code-deploy).
- De waarde moet door de REST-mapper meekomen op `meta._story_type` (of
  top-level — dan past de mapper-regel zich met één argument aan).
- De collectie-endpoint `/wp/v2/article` moet de query-param `story_type`
  vertalen naar filtering.
- Migratie-default voor bestaande articles: `news`.

**Open vraag:** zijn dit de definitieve 5 types, of komen er bij?

---

### W18. `article.insider_only` (gating / D2) ontsluiten 🔴

**Eigenaar:** WP-developer (Johan) + opdrachtgever
**Raakt:** sessie 6 (article-detail gating), sessie 7 (talks — zelfde patroon, C14)
**Bron:** sessie 6 pre-flight; `database-uitbreidingen-instructie-johan.md` §D2

De Insider-only gating op de article-detailpagina is volledig gebouwd
(`ArticleBodyGate`): voor een Insider-only article ziet een niet-member de
excerpt-preview + de `InsiderGate`-paywall; members en niet-gated content zien
de volledige body.

Status frontend (Optie A — voorbereid):
- `Article.insiderOnly` bestaat; de mapper vult voorlopig `false`.
- **Eén regel activeert de gating:** in `mappers.ts` wordt
  `insiderOnly: false` → `insiderOnly: Boolean(m._insider_only)`.

**Wat de WP-kant moet leveren:** het meta-veld `_insider_only` (boolean) op de
article-response. **Neem dit samen met W17 mee — zelfde mapper, zelfde plek.**

**Let op (talks):** `talk.insider_only` (C14) volgt exact hetzelfde patroon,
maar met default `true`. Als Johan D2 oppakt, kan C14 in één keer mee.

---

## 🟡 Belangrijk — sessie-6 vervolg

### S6.1 — Author-naam-resolve op articles 🟡

**Eigenaar:** sessie 2-vervolg / sessie 6-terugloop
**Bron:** sessie 6, Q3-beslissing (buiten scope gehouden)

`getArticle()` resolved de auteursnaam niet (`mapArticle(raw, hero, null)`); de
byline op de detailpagina is `Story by MaterialDistrict`, conform de mockup.
Voor een echte auteur-byline is een extra fetch via `/wp/v2/users/<id>` nodig
(author-ID staat al op `Article.authorId`).

**Wanneer:** niet blokkerend. Vereist een beslissing over caching en of
auteurs publiek getoond mogen worden (privacy). Tot dan blijft de
MaterialDistrict-byline staan.

### S6.2 — `DetailHeader` Insider-tag-variant bevestigen 🟡

**Eigenaar:** sessie 6 code-review (Jeroen)
**Bron:** sessie 6, verificatie-kanttekening

`@/components/layout/DetailHeader` zat niet in de project-uploads tijdens
sessie 6. De article-detailpagina geeft `tags` mee als
`[{ type: 'content', contentType: 'article' }, { type: 'insider' }]` (de
tweede alleen bij een Insider-only article). De `{ type: 'insider' }`-vorm is
**afgeleid**, niet geverifieerd tegen de echte component. Bij code-review
checken of `DetailHeader` deze tag-variant kent; zo niet, de tag-vorm
aanpassen aan wat de component verwacht. Dit is de enige plek in de
article-pages waar een aanname op een niet-geüpload bestand rust.

### S6.3 — Article-detail-sidebar: geparkeerde mockup-onderdelen 🟢

**Eigenaar:** later (deels sessie 9)
**Bron:** sessie 6 scope-afbakening

De article-detail-sidebar (`ArticleDetailSidebar`) bevat reading-progress,
latest-materials, newsletter en de Insider-upsell. Twee mockup-onderdelen zijn
bewust geparkeerd:
- **Compare-toggle op latest-materials:** compare is een material-feature; in
  een article-sidebar voegt het ruis toe. De items zijn nu read-only links.
- **"Reading tip: book"-kaart met Insider-korting:** hangt aan WooCommerce +
  de Insider-kortinglogica — hoort bij sessie 9 (Books). Toevoegen zodra die
  laag er is.

Reading-progress is in v1 statisch (vaste 35%, zoals de mockup). Een echte
scroll-gekoppelde progress kan later — niet blokkerend.

### S6.4 — Nominate-formulier endpoint 🟢

**Eigenaar:** later
**Bron:** sessie 6 scope

De Nominate-sectie op `/articles` is statisch (intro-tekst). De mockup toont een
formulier met een toast-stub; een echte submit vereist een endpoint (analoog
aan `get-in-touch`). Toevoegen wanneer de redactie-flow gedefinieerd is.

---

## Changelog-entry (plak onderaan Wijzigingen in `open-issues.md`)

- **v1.8 (28-05-2026)** — Sessie 6 (Articles) afgesloten: `/articles`
  overzicht + `/articles/[slug]` detail gebouwd. Twee blockers richting Johan
  toegevoegd: **W17** (`article.type` / story-type, D1) en **W18**
  (`article.insider_only`, D2) — beide Optie A (frontend voorbereid, één
  mapper-plek). W17 mapt zelfs automatisch mee zodra het veld er is. Vier
  vervolgitems: S6.1 (author-resolve), S6.2 (DetailHeader insider-tag
  bevestigen), S6.3 (sidebar-parkeringen: compare-toggle + book-tip), S6.4
  (Nominate-endpoint). Story-type-config vastgelegd in
  `src/lib/config/story-types.ts` (5 types, 1-op-1 uit de mockup).
