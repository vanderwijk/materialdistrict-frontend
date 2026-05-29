# Open issues — update naar sessie 6b (Articles v2-update)

> Update op `open-issues-patch-sessie6-articles.md` (28-05-2026). De
> articles-zip van 28-05 is NIET gedeployed (besluit 29-05). Drie items
> krijgen een v2-aligned vorm; één item sluit. Plak deze update als
> opvolger van de oude patch in `open-issues.md`.

---

## Wat verandert t.o.v. de 28-05-patch

| Item | 28-05 status | Nu (29-05) |
|---|---|---|
| W17 — story-type / D1 | 🔴 wacht op Johan veld + 5e type-beslispunt | 🔴 verheldering: **5 types incl. `partner`, géén `process`**. Taxonomy-route definitief (Johan akkoord). Open: exposure-shape (Optie 1 vs 2). |
| W18 — insider_only / D2 | 🔴 wacht op Johan | 🔴 onveranderd. |
| S6.1 — author-resolve | 🟡 open | 🟡 onveranderd. |
| S6.2 — DetailHeader insider-tag-aanname | 🟡 open | 🟡 onveranderd; eerstvolgende keer dat we de code raken (sessie 6b) testen. |
| S6.3 — sidebar-parkeringen | 🟢 open | 🟢 onveranderd. |
| S6.4 — Nominate-endpoint | 🟢 open | 🟢 onveranderd. |
| — | (nieuw) | **W19 toegevoegd** — channels[] op articles (D3). |
| — | (nieuw) | **W20 toegevoegd** — SearchWP-related-endpoint (D5). |
| — | (nieuw) | **S6.5 toegevoegd** — Newsletter-input sidebar mist endpoint. |
| — | (nieuw) | **S6.6 toegevoegd** — deploy-volgorde / v2-aligned zip. |

---

## 🔴 Blockers richting Johan — verhelderd / nieuw

### W17. `article.type` — story-type taxonomy 🔴 — verhelderd

**Eigenaar:** WP-developer (Johan)
**Raakt:** sessie 6b (mapper-aanpassing + filter)
**Bron:** sessie 6 pre-flight; `database-uitbreidingen-instructie-johan.md`
§D1 v2; opdrachtgever-verheldering 29-05.

**Definitief vastgesteld:**
- **Mechanisme:** WP-taxonomy `story_type` (Johan akkoord 29-05).
- **5 terms:** `news`, `people`, `collaborations`, `projects`, `partner`.
  Lowercase slugs, exact. **Géén `process`-term** (vervalt — opdrachtgever
  29-05).
- **Migratie-default:** `news`.

**Resterende vraag aan Johan (één regel):**
- **Exposure-shape:** `_embedded['wp:term']` (Optie 1) of een eigen
  `taxonomies.story_type`-alias met `{id, slug, label}`-objects zoals C6
  (Optie 2)? Bepaalt exact welke regel in de mapper komt.

**Frontend-impact:** mapper-aanpassing van één regel. De huidige
articles-zip (28-05) leest uit `_story_type` meta — dat wordt vervangen
zodra Johan de shape kiest. Eerdere "automatisch mapt mee"-belofte
vervalt: de meta-route is verlaten ten gunste van taxonomy.

### W18. `article.insider_only` (gating / D2) 🔴 — onveranderd

Status onveranderd. Het meta-veld `_insider_only` (boolean, default
`false`) moet door de mapper meekomen. **Eén regel** aan frontend-kant
zodra het er is: `insiderOnly: false` → `insiderOnly: Boolean(m._insider_only)`.
Neem samen met W17 mee — zelfde stuk werk.

### W19. `article.channels[]` exposure 🔴 — NIEUW

**Eigenaar:** WP-developer (Johan)
**Raakt:** sessie 6b (mapper + cards)
**Bron:** sessie 6 v2-analyse 29-05; `database-uitbreidingen-instructie-
johan.md` §D3.

In de 28-05-zip helemaal niet meegenomen. De channel-tags op
article-cards (witte pills onderaan thumb) — exact zoals bij materials —
zijn een mockup-vereiste die ontbrak. Channels-taxonomy bestaat al; alleen
de exposure op de article-REST-response moet erbij.

**Voorgestelde shape (akkoord nodig):** zelfde patroon als C6 voor
materials — `taxonomies.channels` met `{id, slug, label}`-objects.

**Frontend-impact:** `channels: TaxonomyTerm[]` toevoegen aan `Article` +
`ArticleListItem`, mapper-resolve uit `taxonomies.channels`, ContentCard
voeden via `channelTags`. Geen UI-werk — de cards ondersteunen de pills al.

### W20. SearchWP-related-endpoint (D5) 🔴 — NIEUW

**Eigenaar:** WP-developer (Johan)
**Raakt:** sessie 6b (`ArticleRelated`-component, content-API)
**Bron:** v2 van `database-uitbreidingen-instructie-johan.md` §D5
(strategie-wijziging 29-05).

In de 28-05-zip vervangen door een client-side filter op zelfde
story-type (tijdelijke oplossing). De canonieke aanpak is een aparte
endpoint via de SearchWP-plugin met gemixte content-types.

**Wat Johan moet leveren:**
- SearchWP-plugin geïnstalleerd en geconfigureerd voor article +
  material + talk.
- Endpoint `GET /wp-json/md/v2/articles/{slug}/related?limit=N`.
- Response-shape bevestigd (voorstel: `{items: [{type, id, slug, title,
  thumbnail, ...type-specific}]}` — zie wordpress-instructions-articles
  v1.1 §5).
- 1-uur transient cache.

**Status-vraag aan Johan:** plugin geïnstalleerd? Endpoint in planning,
of moet related-sectie in v1 leeg blijven?

**Frontend-impact:** nieuwe `RelatedItem`-type, `getRelatedContent(slug,
limit)`-functie, `ArticleRelated` herbouwen voor mixed-types, page-
splitsing prev/next van related. Met lege-array-fallback als v1
zonder endpoint live moet.

---

## 🟡/🟢 Vervolgitems — onveranderd of nieuw

### S6.1 — Author-naam-resolve 🟡 — onveranderd

Author-resolve via `/wp/v2/users/<id>`. Privacy-knoop nodig vóór bouw.
Tot dan blijft byline "Story by MaterialDistrict".

### S6.2 — `DetailHeader` insider-tag-aanname 🟡 — onveranderd

`DetailHeader`-component zat niet in de uploads tijdens sessie 6. De
aangenomen `{type: 'insider'}`-tagvariant test ik bij de eerstvolgende
sessie waarin we de detail-page raken (sessie 6b).

### S6.3 — Sidebar-parkeringen 🟢 — onveranderd

- Compare-toggle op latest-materials → niet relevant voor articles.
- Book-tip met Insider-korting → wacht op sessie 9 (WooCommerce).
- Reading-progress statisch (mockup-niveau) → kan later scroll-gekoppeld.

### S6.4 — Nominate-formulier endpoint 🟢 — onveranderd

Statisch in v1. Echte submit-endpoint = redactie-flow-vraag.

### S6.5 — Newsletter-signup endpoint 🟢 — NIEUW

In de 28-05-zip zit een statische newsletter-input in de article-detail-
sidebar zonder backend-koppeling. Vraag aan Johan: bestaat er al een
Mailchimp/Mailpoet-koppeling, of bouwen we een eigen endpoint? Hangt
inhoudelijk samen met S6.4 (allebei redactie-flow-endpoints).

### S6.6 — Deploy-volgorde / v2-aligned zip 🟢 — NIEUW (procedureel)

De articles-zip van 28-05 is NIET gedeployed (Jeroen-besluit 29-05).
Reden: meta-route uit v1.0 is verlaten ten gunste van taxonomy (D1),
D3/D5 ontbraken. Eén v2-aligned zip volgt na sessie 6b (zodra Johan op
de drie shape-vragen heeft geantwoord).

**Aanbeveling:** geen tussentijdse deploy van de 28-05-zip. Eén keer
deployen wanneer alles aligned is.

---

## Changelog-entry (plak onderaan Wijzigingen in `open-issues.md`)

- **v1.9 (29-05-2026)** — Articles v2-update (sessie 6b voorbereiding).
  Story-type-set definitief: 5 types incl. `partner`, géén `process`
  (opdrachtgever 29-05). W17 verhelderd naar taxonomy-route (Johan
  akkoord); resterend: exposure-shape. W19 (channels[] D3) en W20
  (SearchWP-related D5) toegevoegd — beide ontbraken in de 28-05-zip.
  S6.5 (newsletter-endpoint) + S6.6 (deploy-volgorde) toegevoegd.
  Articles-zip 28-05 niet gedeployed; v2-aligned zip volgt na Johan-
  antwoord op de drie shape-vragen.
