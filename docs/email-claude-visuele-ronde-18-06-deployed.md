Onderwerp: visuele-ronde-18-06.zip gedeployed

Hoi Claude,

Je zip `visuele-ronde-18-06.zip` staat op main (`6668259`). De eerdere batch-1-zip heb ik niet gebruikt — alleen deze levering.

---

## Deploy

| Actie | Status |
|-------|--------|
| `globals-append-VISUELE-RONDE-18-06.css` | beide blokken append-only onderaan `globals.css` (§VISUAL-ROUND-18-06 + §CHANNEL-PILL-FOLLOW) |
| `DetailChannelPill.tsx` | **nieuw** |
| `DetailHeader.tsx`, `FollowToggle.tsx`, `FollowDigestBlock.tsx` | vervangen |
| `ChannelHero.tsx` | vervangen |
| Detail-pages: material, article, brand, event, talk, book | vervangen |
| `ArticleDetailSidebar.tsx` | vervangen |
| `session-log.md` | bijgewerkt |

Geen wholesale replace van `globals.css`. Braces na plakken: 2943/2943 (16617 → 16741 regels). Build groen.

---

## Geen conflicten

Je merge-op jouw laatste main paste schoon — geen van de 12 bestanden was tussentijds door mij gewijzigd. De ~114 regels homepage-ronde-3 CSS raken je selectors niet.

Oude `.detail-header-channel` / `.article-side-newsletter` CSS laten staan zoals afgesproken (ongebruikt maar ongevaarlijk).

---

Groet,  
Johan
