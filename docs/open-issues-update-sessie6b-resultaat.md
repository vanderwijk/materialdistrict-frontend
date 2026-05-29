# Open issues — resultaat sessie 6b (Articles v2-update)

> Sluit-patch voor `open-issues.md`, na afronding van sessie 6b. Vervangt de
> 🔴-status van W17/W18/W19/W20 (zie `open-issues-update-sessie6b.md` voor de
> pre-sessie-stand). Plak de changelog-entry onderaan het Wijzigingen-blok
> (volgende versie: **v2.0**).
>
> Aanleiding sessie 6b: Johan's antwoord van 29-05 op de drie shape-vragen,
> plus zijn bevestiging dat D2/C14 al gebouwd zijn. De articles-zip van 28-05
> was niet naar live gedeployed (alleen testserver); deze sessie levert de
> v2-aligned bundel die wél naar live gaat.

---

## Wat sluit / verandert

| Item | Pre-sessie (29-05) | Nu (sessie 6b afgerond) |
|---|---|---|
| W17 — story-type / D1 | 🔴 exposure-shape open | 🟢 **gesloten** — `meta.story_type` + `meta._story_type`, mapper leest + filtert live. |
| W18 — insider_only / D2 | 🔴 wacht op Johan | 🟢 **gesloten** — `meta.insider_only`/`_insider_only`, mapper leest live. |
| W19 — channels[] / D3 | 🔴 shape-akkoord open | 🟢 **gesloten** — `meta.channels`, op de cards via `channelTags`. |
| W20 — SearchWP-related / D5 | 🔴 status open | 🟢 **gesloten** — endpoint live, mixed types, faalbestendig. |
| S6.2 — DetailHeader insider-tag | 🟡 open | 🟡 **onveranderd — nu relevanter** (zie hieronder). |
| S6.1 / S6.3 / S6.4 / S6.5 | 🟡/🟢 open | onveranderd. |
| — | (nieuw) | **S6.7** — related-talks-route (zie hieronder). |

---

## 🟢 Gesloten deze sessie

### W17. `article.type` (story-type / D1) — gesloten

Johan heeft `story_type` als WP-taxonomy op `article` gebouwd (gekozen om
query-performance boven postmeta). Geëxposeerd op **`meta.story_type`** als
`{id, slug, label}[]`, plus **`meta._story_type`** (en `meta.type`) als platte
canonieke slug voor backward-compat. Filtering via `?story_type=slug,slug`
(tax_query). De vijf terms zijn aangemaakt met exacte slugs (`news`, `people`,
`collaborations`, `projects`, `partner` — géén `process`), bevestigd door Johan.

Frontend (sessie 6b): de mapper leest `m._story_type ?? m.story_type?.[0]?.slug`
(`toStoryType` degradeert naar `news` bij onbekend); `STORY_TYPE_BACKEND_CONNECTED`
in `articles/page.tsx` staat op `true`. Geen "Optie A / indicatieve counts"-hint
meer.

### W18. `article.insider_only` (gating / D2) — gesloten

Johan heeft D2 én C14 (talks) al volledig gebouwd: admin-checkbox, REST-exposure
op **`meta.insider_only`** (boolean) met alias **`meta._insider_only`**. Article
default `false`, talk default `true`.

Frontend (sessie 6b): beide article-mappers lezen nu
`Boolean(m._insider_only ?? m.insider_only)` in plaats van het hardgecodeerde
`false`. De `ArticleBodyGate`-paywall en de InsiderMark op de cards worden dus
nu daadwerkelijk door echte data aangestuurd.

### W19. `article.channels[]` (D3) — gesloten

Channels worden geëxposeerd op **`meta.channels`** (`{id, slug, label}[]`),
zelfde patroon als `story_type` — al akkoord en live (Johan). NB: dit is
`meta.channels`, niet de eerder voorgestelde `taxonomies.channels`.

Frontend (sessie 6b): nieuw gedeeld type `TaxonomyTerm`, `channels: TaxonomyTerm[]`
op `Article` + `ArticleListItem`, mapper-resolve via een gedeelde `mapChannels`,
en `channelTags={…channels.map(c => c.label)}` op de `ContentCard`'s (de prop
bestond al). Geen losse UI-bouw nodig.

### W20. SearchWP-related-endpoint (D5) — gesloten

Endpoint `GET /wp-json/md/v2/articles/{slug}/related?limit=N` is live (.local +
.com), powered by SearchWP Related met taxonomie-overlap-fallback. Response =
een **platte array** van `{type, id, slug, title, thumbnail, link}` met gemixte
types (article/material/talk). 1-uur transient cache. Default limit 6, max 20.
NB: platte array, niet de eerder voorgestelde `{items: […]}`.

Frontend (sessie 6b): nieuw `RelatedItem`-type + `RelatedContentType`,
`getArticleRelated`-fetcher (limit geclampt op [1,20]), `mapRelatedItem`
(narrowt onbekende types weg), `getRelatedContent(slug, limit=6)` (faalbestendig
→ `[]`), `ArticleRelated` herschreven voor mixed types met pill-per-content-type,
en `getNeighboursAndRelated` gesplitst in `getNeighbours` + de losse related-call.

---

## 🟡 Vervolg — onveranderd of nieuw

### S6.2 — `DetailHeader` insider-tag-variant 🟡 — nu relevanter

Onveranderd qua status, maar belangrijker geworden: nú `insiderOnly` live data
krijgt, fírét de `{ type: 'insider' }`-tagvariant in `page.tsx` ook echt voor
Insider-only articles. `DetailHeader` zat niet in de delta-zip, dus de
contract-match is offline niet geverifieerd. **Checken bij integratie tegen de
echte component;** bij een type-fout is het één regel aan de `tags`-vorm.

### S6.7 — Related-talks-route 🟢 — NIEUW

Het related-endpoint kan `talk`-items teruggeven, maar de `/talks`-detail-route
bestaat nog niet (sessie 7). `ArticleRelated` valt voor talks daarom terug op de
door WP geleverde permalink (`item.link`). Zodra sessie 7 de route bouwt: in
`hrefFor()` de talk-case omzetten naar `/talks/${slug}`.

### S6.1 / S6.3 / S6.4 / S6.5 — onveranderd

Author-resolve (S6.1), sidebar-parkeringen (S6.3), Nominate-endpoint (S6.4) en
Newsletter-endpoint (S6.5) blijven open zoals beschreven in de pre-sessie-update.
Geen scope-drift deze sessie.

---

## Changelog-entry (plak onderaan Wijzigingen in `open-issues.md`)

- **v2.0 (29-05-2026)** — Sessie 6b (Articles v2-update) afgerond.
  **W17 (D1), W18 (D2), W19 (D3), W20 (D5) gesloten** — alle vier geleverd door
  Johan en frontend-zijde aangesloten + per laag geïsoleerd getypecheckt (exit
  0). Definitieve shapes: `meta.story_type`/`_story_type`, `meta.insider_only`/
  `_insider_only`, `meta.channels` (alle `{id,slug,label}`), related als platte
  array `{type,id,slug,title,thumbnail,link}`. S6.2 (DetailHeader insider-tag)
  blijft open en is relevanter nu de tag echt fírét. S6.7 (related-talks-route)
  toegevoegd. Geen live-deploy van de 28-05-zip; deze v2-aligned bundel gaat naar
  live.
