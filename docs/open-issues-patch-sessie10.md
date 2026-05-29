# Open issues — patch sessie 10 (Homepage) — revisie 2

> Append-only patch voor `open-issues.md`. Build-order stap 10 (Homepage).
> Datum: 29-05-2026. Revisie 2 verwerkt de Johan-instructie (route-group +
> CSS-comment) en twee homepage-uitbreidingen.

## Opgelost in deze revisie

- **CSS-build-bug (`*/` in comment)** — de sessie-10-comment bevatte via
  `.grid-*/.btn*` de tekens `*/`, wat de build brak. Comment herschreven
  zonder `*/`. (Johan-instructie issue 1.)
- **Soft-404-regressie door root-`loading.tsx`** — homepage + loading +
  components verplaatst naar route-group `src/app/(home)/`, zodat de
  loading-boundary alleen voor de homepage geldt. URL blijft `/`.
  (Johan-instructie issue 2.)
- **`contentType="material"`-verificatie** — gesloten: de productie-build
  op `main` slaagt met de homepage, dus `"material"` zit in de
  `ContentType`-union.

## Open — wacht op andere lagen / data-bron

### S10.1 — Books-blok + Insider-prijzen op de homepage 🟡
**Eigenaar:** Johan (Books-data) + Claude (frontend-koppeling)
Books-plek + Books-sidebarwidget + concrete Insider-prijs (€x/maand, x%
korting) wachten op `src/types/book.ts`, `listBooks` (`woocommerce.ts`) en
`src/lib/config/membership.ts`. Nu nette placeholder; Insider-CTA verkoopt
op waarde zonder hardcoded prijs. Niet blokkerend.

### S10.2 — Volledige categorie-carousel op de homepage 🟢
**Eigenaar:** Claude (+ databron-beslissing)
v1 levert een minimale categoriestrip (één "All materials"-link). Geen
kant-en-klare "alle material-categorieën"-bron in de API-laag. Carousel kan
later als client-eiland toegevoegd worden.

### S10.3 — Echte "Featured partners"-bron 🟢
**Eigenaar:** Jeroen + Claude
Partners-grid toont nu zes placeholders. Echte bron (brands met partner-tier
of gecureerde lijst) vereist een endpoint/veld dat nog niet bestaat.

## Wijzigingen — append onderaan de lijst

- **v1.x (29-05-2026, rev 2)** — Sessie 10 homepage: route-group `(home)`
  + CSS-comment-fix verwerkt (Johan-instructie). Twee uitbreidingen gebouwd:
  featured-article-hero (verschijnt als de promo-hero weg is) en het
  manufacturer-promoblok in de sidebar. `contentType="material"`-item
  gesloten. S10.1–S10.3 blijven open.
