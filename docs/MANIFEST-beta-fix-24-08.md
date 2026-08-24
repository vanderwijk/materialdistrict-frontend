# MANIFEST — betafeedback-ronde, 24-08-2026

Bestand: `md-beta-fix-24-08-v1.zip`

Eerste ronde na twee weken beta. Elf punten uit de frontend, plus de cache-klacht
die de redactie dagelijks raakt.

**Normdocumenten over dit onderwerp:** geen. Dit is UI- en infrastructuurwerk;
`docs/materiaal-classificatie-regelboek.md` raakt er niet aan.

Gecontroleerd vóór levering: `tsc --noEmit` schoon, `next build` slaagt,
`php -l` schoon. De 404- en revalidatie-fixes zijn getest op een draaiende
productiebuild (`next start`) — zie "Getest" onderaan.

---

## 1. Verplaatst — oude bestanden eerst weg

Zeven overzichtspagina's zijn in een route-groep `(list)` gezet. De URL
verandert niet. **Verwijder de oude bestanden, anders bestaat de route twee keer
en weigert Next te bouwen:**

```
src/app/article/page.tsx        src/app/article/loading.tsx
src/app/book/page.tsx           src/app/book/loading.tsx
src/app/brand/page.tsx          src/app/brand/loading.tsx
src/app/channel/page.tsx        src/app/channel/loading.tsx
src/app/event/page.tsx          src/app/event/loading.tsx
src/app/material/page.tsx       src/app/material/loading.tsx
src/app/talk/page.tsx           src/app/talk/loading.tsx
```

Ook weg, zonder vervanging:

```
src/app/channel/[slug]/loading.tsx
```

De `layout.tsx`- en `_components/`-mappen in die segmenten blijven staan waar ze
staan.

## 2. Nieuw

```
src/app/api/revalidate/route.ts     ontvangstpunt voor het WordPress-seintje
src/lib/api/cache-tags.ts           tag-afleiding, gedeeld door fetch en endpoint
src/components/ads/GridAdRow.tsx    leaderboard-rij in de overzichtsrasters
plugin/rest-revalidate.php          → in de bestaande MaterialDistrict-plugin
```

## 3. Gewijzigd

Complete bestanden, in moedermap-structuur. Geen patches.

## 4. Instellen (eenmalig)

**Vercel** — omgevingsvariabele:

```
REVALIDATE_SECRET=<lang willekeurig geheim>
```

**wp-config.php** — hetzelfde geheim:

```php
define( 'MD_REVALIDATE_URL',    'https://materialdistrict.com/api/revalidate/' );
define( 'MD_REVALIDATE_SECRET', '<zelfde waarde>' );
```

Zonder beide constanten doet de PHP niets — veilig om te deployen vóórdat de
frontend live staat.

**Plugin** — `rest-revalidate.php` in de bestaande plugin, en includen vanuit het
hoofdbestand:

```php
require_once MD_PLUGIN_DIR . 'includes/rest-revalidate.php';
```

Geen eigen `Plugin Name`-header, geen mu-plugin. Plaatsing binnen de plugin is
aan jou.

## 5. Getest

| Wat | Uitkomst |
|---|---|
| `tsc --noEmit` | schoon |
| `next build` | slaagt |
| Detailroutes in de build | alle zeven `●` (voorgebakken + ISR), niet dynamisch |
| Onbestaande slug op 7 routes | HTTP **404** (was 200) |
| Overzichten + echte detailpagina's | HTTP 200 |
| `POST /api/revalidate/` zonder geheim | 401 |
| `POST /api/revalidate/` met fout geheim | 401 |
| `POST /api/revalidate/` met geheim | 200 + tags/paden in de response |
| `php -l` | schoon |

## 6. Twee dingen om te weten

**Beeld-URL's krijgen er eenmalig een versienummer bij** (`?v=20260330100026`,
uit de laatste wijzigingsdatum van het bestand). Dat is wat een vervángen
thumbnail meteen zichtbaar maakt. Gevolg: na deploy worden alle afbeeldingen één
keer opnieuw geoptimaliseerd. Eenmalig, daarna weer volledig gecachet.

**De channel-detailpagina heeft geen skeleton meer.** Die `loading.tsx` was de
oorzaak van de soft-404 op `/channel/<slug>`. De pagina komt van het CDN, dus
in de praktijk verschijnt 'ie direct.
