Onderwerp: image-pipeline vastgelegd — Vercel blijft, directe `<img>` is geen plan

Hoi Claude,

Korte update over de image-strategie, zodat je die niet opnieuw openbreekt (geen terugkeer naar directe WP-JPEG/PNG, geen route-splits, geen “fix de 429 door unoptimized overal”).

Johan heeft dit 20-08-2026 op **main + staging** gezet. HEAD rond `9b53a94` (na `02a9c22` pipeline + `f1eb1a7` book-cover).

---

## Wat er nu live staat

Eén pad voor alle content-beelden:

**WP-renditie (passend formaat) → `<MdImage>` → `next/image` → Vercel Image Optimization (WebP).**

| Plek | Rol |
|------|-----|
| `src/lib/images/image-policy.ts` | Enige config: `wpSizes`, `sizes`, `quality` per role |
| `src/lib/images/resolve-image-url.ts` | Kiest de WP-renditie-URL |
| `src/components/ui/MdImage.tsx` | Enige render-pad |
| `next.config.ts` → `images` | WebP only, `qualities: [75]`, `minimumCacheTTL: 2592000` (30 dagen), geen `deviceSizes` 2048 |

Differentiatie alleen via **role** (bronformaat, `sizes`, `priority`) — niet per route, niet per post-type.

`unoptimized` alleen asset-gebaseerd: SVG, GIF, YouTube-thumbs. Niet voor JPEG/PNG/WebP van onze media-CDN.

LCP: max. één `priority` per pagina (featured story, detail-hero, eerste listing-kaart met beeld).

Book covers (WooCommerce, alleen URL-string): `ROLE_FALLBACK_SIZE` i.p.v. 1×1 — anders is de cover onzichtbaar.

---

## Waarom niet “directe images”

We hebben dat kort geprobeerd (`e6eb589`: `<img>` met WP-rendities, geen `/_next/image`). Dat loste 429’s op, maar `/article/` ging naar ~3,4 MB JPEG/PNG. PageSpeed en LCP zakten weg.

Vercel levert WebP op de juiste breedte. Dat is de reden dat we **niet** op directe origin-bestanden blijven. De uniforme pipeline is bewuste keuze, geen tussenstand.

---

## Over 429’s — niet “oplossen” door de optimizer uit te zetten

Na een verse deploy (koude image-cache) of bij veel nieuwe bron-URL’s tegelijk kan `/_next/image` **429** geven. Dat is een **concurrent rate limit** op de optimizer, geen maandquota.

- Maandlimiet overschreden = **402** (optimization pauzeert voor nieuwe bronnen; gecachte beelden blijven werken).
- 429 = te veel *gelijktijdige* cold transforms (listing met ~12 kaarten + srcset-varianten).

Dat is **acceptabel**. Herlaad / tweede bezoek: 30-dagen CDN-cache, dan 200/HIT. Niet alle beelden vallen tegelijk uit; de pagina blijft bruikbaar. `next/image` probeert later opnieuw.

Niet doen:

- `unoptimized` op listings “om 429 te vermijden”
- Terug naar kale `<img>` naar `media.materialdistrict.com`
- Route-gebaseerde split (articles wel Vercel, materials niet)

Wel oké: smallere `sizes` / minder `deviceSizes` als listing-srcsets écht te breed zijn. Dat is tuning, geen strategie-wijziging.

---

## Als Vercel Image Optimization te duur wordt

Dan **niet** zelf in Amazon CloudFront optimaliseren — dat is lastig (geen nette on-the-fly WebP/AVIF-pipeline zoals Vercel/Cloudflare Images).

Volgorde als de kosten pijn doen:

1. **WordPress image-optimalisatie-plugin** (WebP/AVIF + kleinere rendities op de origin). Vercel transformeert dan al lichte bronnen, of we serveren WP-WebP direct.
2. **Cloudflare Images** (of vergelijkbare dedicated image CDN) als we de transform-laag van Vercel af willen.

Tot die tijd: Vercel houden, af en toe een 429 laten zitten.

---

Groet,  
Johan
