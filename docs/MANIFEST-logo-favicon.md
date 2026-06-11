# MANIFEST — Header-logo + favicon

Bron: MaterialDistrict_logo_Horizontaal.svg. Twee samenhangende onderdelen,
één deploy.

## 1. Header-logo
- `src/components/layout/Logo.tsx` — VOLLEDIG vervangen. Nieuw horizontaal
  logo als inline SVG (viewBox 0 0 281.8 73.7):
    - `<g class="wordmark">` = woordmerk "MATERIAL / DISTRICT." (donkere tekst).
      Verborgen op smalle viewports, wit in dark mode.
    - groene mark (st0/st3/st2), blijft in elk thema staan.
  Wordt al via `<Logo />` gerenderd in Header.tsx — die blijft ongemoeid.
  Component accepteert nu optioneel SVG-props (superset, breekt niets).

- `src/styles/globals-additions-logo.css` — één additief CSS-blok.
  **Onderaan src/styles/globals.css plakken.** Zet de dark-mode-fill van het
  woordmerk op groepsniveau (`.logo .wordmark`) i.p.v. alleen op `path`; het
  nieuwe woordmerk bestaat uit gemengde shape-types (path/rect/polygon), anders
  blijven M/T/E/L/T/I's zwart-op-donker in dark mode.

## 2. Favicon (ontbrak op alle pagina's)
App Router file-conventie met het groene beeldmerk als bron:
- `src/app/icon.svg`       — schaalbaar, moderne browsers
- `src/app/favicon.ico`    — 16/32/48 px fallback (transparant)
- `src/app/apple-icon.png` — 180x180, witte achtergrond (iOS)
Next injecteert de juiste <link>-tags automatisch op elke route.

- `src/app/layout.tsx` — handmatig `icons: { icon: '/favicon.ico' }`-blok uit
  metadata verwijderd (file-conventie neemt het over; voorkomt dubbele
  .ico-link). Verder ongewijzigd.

## Niet aanraken
- Header.tsx / HeaderShell.tsx — ongemoeid.
- globals.css — alleen het bovengenoemde blok aanhangen; verder niets.
- Oude public/favicon.ico (indien aanwezig) mag blijven; app/-versie wint.

## Geverifieerd
- esbuild (tsx) + geïsoleerde tsc --strict (react-types): schoon.
- Visuele render logo licht / dark / mobiel: correct.
- Favicon 16/32/48 + apple-icon: leesbaar.
