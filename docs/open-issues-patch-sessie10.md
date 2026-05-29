# Open issues — patch sessie 10 (Homepage)

> Append-only patch voor `open-issues.md`. Build-order stap 10 (Homepage).
> Datum: 29-05-2026.

## Open — wacht op andere lagen / data-bron

### S10.1 — Books-blok + Insider-prijzen op de homepage 🟡
**Eigenaar:** Johan (Books-data) + Claude (frontend-koppeling)
**Raakt:** homepage Events+Books-rij, Books-sidebarwidget, Insider-CTA-copy

De homepage rendert de Books-plekken nu als nette placeholder
("Featured books are coming soon"). De Insider-CTA verkoopt op waarde en
linkt naar `/membership`, maar toont **bewust geen prijs of korting** —
prijzen/kortingen horen in `src/lib/config/membership.ts` (kwaliteitseis 5),
niet hardcoded.

**Wat er moet (frontend, zodra beschikbaar):**
- `src/types/book.ts`, de `listBooks`-signatuur (`woocommerce.ts`) en
  `src/lib/config/membership.ts` aanleveren/bevestigen.
- Featured-book-kaart (filter `featured`, terugval nieuwste) + Books-
  sidebarwidget aanhaken.
- Member-prijs (10% korting) via een membership-helper tonen op de
  book-kaart; "€x/month" + "x% off books" in de Insider-CTA uit de config.

**Wanneer:** zodra de Books-sessie (stap 9) data oplevert die de homepage
kan consumeren. Niet blokkerend voor de rest van de homepage.

### S10.2 — Volledige categorie-carousel op de homepage 🟢
**Eigenaar:** Claude (+ databron-beslissing)
**Raakt:** de categoriestrip onder de hero

De mockup heeft een geanimeerde categorie-carousel (material-types met
prev/next-paging). v1 levert een **minimale strip** met één "All materials"-
link, omdat er geen kant-en-klare "alle material-categorieën"-bron in de
API-laag is (alleen per-material `material_category`-termen). Zodra er een
lichte categorie-/term-endpoint of -config is, kan de carousel als client-
eiland toegevoegd worden zonder de rest te raken.

### S10.3 — Echte "Featured partners"-bron 🟢
**Eigenaar:** Jeroen + Claude
**Raakt:** de partners-sectie onderaan de homepage

De partners-grid toont nu zes placeholders. Een echte bron (bv. brands met
partner-tier, of een door redactie gecureerde lijst) vereist een endpoint/
veld dat nog niet bestaat. Beslissen welke bron, dan aanhaken.

## Bevestigd / te verifiëren deze sessie

- **`contentType="material"`** wordt op de homepage gebruikt voor de
  material-kaarten (via `ContentCard`). In de bestaande pagina's komt alleen
  `"article"`/`"talk"` voor. Bij de eerste `npm run build` verifiëren dat
  `"material"` in de `ContentType`-union zit; zo niet, één-regel-fix.

## Wijzigingen — append onderaan de lijst

- **v1.x (29-05-2026)** — Sessie 10: homepage gebouwd. Drie follow-ups
  toegevoegd: S10.1 (Books-blok + Insider-prijzen, wacht op Books-domeinlaag
  + membership-config), S10.2 (volledige categorie-carousel), S10.3 (echte
  partners-bron). Geen items afgesloten.
