# Handover — bewaar de RecentlyViewedTracker op de detailpagina's

**Waarom dit er staat:** in §F2.10 is een terugkerende bug gefixt. De
recently-viewed-rails op de stories-/brands-/events-/talks-overzichten waren
leeg omdat er niets naar localStorage werd geschreven. Reden: de detail-
finetuning-rondes (§F2.8/§F2.9) hebben de detailpagina's opnieuw geleverd
vanuit een basis zónder de in §F2.7 toegevoegde `RecentlyViewedTracker`, en
hebben die daarmee verwijderd.

**Regel:** elke detailpagina hieronder bevat — direct na
`<article className="pub-wrap">` — een `<RecentlyViewedTracker … />`
(client-island, rendert niets, schrijft het bekeken item weg). Laat die
staan bij toekomstige wijzigingen aan de detailpagina's:

- `src/app/articles/[slug]/page.tsx`  → type="articles"
- `src/app/brands/[slug]/page.tsx`    → type="brands"
- `src/app/events/[slug]/page.tsx`    → type="events"
- `src/app/talks/[slug]/page.tsx`     → type="talks"

Import: `import { RecentlyViewedTracker } from '@/lib/hooks/useRecentlyViewed'`.

Als een detailpagina opnieuw geleverd wordt, neem dit blok mee — anders breekt
recently-viewed op het bijbehorende overzicht (stil, geen foutmelding).
