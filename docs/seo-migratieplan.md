# SEO Migratieplan — MaterialDistrict Next

**Status:** Pre-launch checklist  
**Doel:** Google-ranking behouden en verbeteren bij overgang van WordPress naar Next.js (Vercel)

---

## Samenvatting van bevindingen

De nieuwe Next.js site heeft al een solide SEO-basis: `generateMetadata` op elke detailpagina, JSON-LD structured data (Product, Article, Event, VideoObject, Book, Organization, WebSite), en breadcrumbs. Maar er zijn een aantal kritische gaten die voor de lanceerdatum gedicht moeten worden.

---

## 🔴 KRITIEK — vóór launch oplossen

### 1. URL-structuur matcht niet met bestaande site

Dit is het grootste SEO-risico. Google heeft de huidige URLs al jaren geïndexeerd. Als die veranderen zonder redirects, verlies je alle opgebouwde linkwaarde en ranking.

| Content-type | Huidige URL (WP) | Nieuwe URL (Next) | Verschil |
|---|---|---|---|
| Material | `/material/[slug]` | `/materials/[slug]` | `material` → `materials` |
| Article | `/article/[slug]` | `/articles/[slug]` | `article` → `articles` |
| Event | `/event/[slug]` | `/events/[slug]` | `event` → `events` |
| Brand | `/brand/[slug]` | `/brands/[slug]` | `brand` → `brands` |
| Talk | `/talk/[slug]` | `/talks/[slug]` | `talk` → `talks` |
| Channel | `/channel/[slug]` | `/channels/[slug]` | `channel` → `channels` |
| Material category | `/material-category/[slug]` | `/materials?material_category=[slug]` | taxonomy → filter param |
| Tag | `/tag/[slug]` | `/materials?q=[slug]` | taxonomy → search param |

**Actie: voeg 301-redirects toe in `next.config.ts`:**

```ts
async redirects() {
  return [
    // Enkelvoud → meervoud (alle content-types)
    { source: '/material/:slug', destination: '/materials/:slug', permanent: true },
    { source: '/article/:slug', destination: '/articles/:slug', permanent: true },
    { source: '/event/:slug', destination: '/events/:slug', permanent: true },
    { source: '/brand/:slug', destination: '/brands/:slug', permanent: true },
    { source: '/talk/:slug', destination: '/talks/:slug', permanent: true },
    { source: '/channel/:slug', destination: '/channels/:slug', permanent: true },

    // Taxonomy-pagina's → filter-URLs
    { source: '/material-category/:slug', destination: '/materials?material_category=:slug', permanent: true },
    { source: '/tag/:slug', destination: '/materials?q=:slug', permanent: true },

    // Overige bekende WP-paden
    { source: '/login', destination: '/sign-in', permanent: true },
    { source: '/register', destination: '/register', permanent: false }, // zelfde path — check
    { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
  ]
},
```

**Let op:** `permanent: true` stuurt een 301 (permanent). Wacht tot je zeker bent dat de nieuwe URLs stabiel zijn voordat je dit inzet. Tijdens de testfase kun je tijdelijk `permanent: false` (302) gebruiken.

---

### 2. Canonical URLs wijzen naar de verkeerde slug

In `generateMetadata` op de materialpagina staat nu:

```ts
alternates: { canonical: `/materials/${material.slug}` }
```

Dit is een **relatief pad**. Next.js zet er de `metadataBase` voor, maar die staat in de root layout als:

```ts
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://materialdistrict.com'),
```

Zodra de site live gaat op `materialdistrict.com`, kloppen de canonicals. Maar check vóór launch dat `NEXT_PUBLIC_SITE_URL` op Vercel correct is ingesteld op `https://materialdistrict.com` (zonder trailing slash).

**Actiepunt:** Controleer Vercel environment variables → `NEXT_PUBLIC_SITE_URL=https://materialdistrict.com`.

---

### 3. Geen `robots.txt` en geen dynamische sitemap

De huidige WP-site heeft een uitgebreide sitemap (gegenereerd door Yoast SEO). De nieuwe Next.js site heeft **geen** `robots.txt` en **geen** sitemap-bestand.

**Actie A — `robots.txt` via App Router:**

Maak bestand `src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/checkout/',
        '/cart/',
        '/api/',
        '/mock/',
      ],
    },
    sitemap: 'https://materialdistrict.com/sitemap.xml',
  }
}
```

**Actie B — dynamische `sitemap.xml` via App Router:**

Maak bestand `src/app/sitemap.ts`. Haal de slugs op uit de WordPress API en genereer een sitemap per content-type. Voorbeeld:

```ts
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://materialdistrict.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Haal slugs op uit WP API (implementatie afhankelijk van je listMaterials etc.)
  const materials = await fetchAllSlugs('materials')
  const articles = await fetchAllSlugs('articles')
  const events = await fetchAllSlugs('events')
  const brands = await fetchAllSlugs('brands')
  const talks = await fetchAllSlugs('talks')

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), priority: 1.0 },
    { url: `${SITE_URL}/materials`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/brands`, lastModified: new Date(), priority: 0.7 },
    { url: `${SITE_URL}/talks`, lastModified: new Date(), priority: 0.7 },
  ]

  const materialPages: MetadataRoute.Sitemap = materials.map((slug) => ({
    url: `${SITE_URL}/materials/${slug}`,
    lastModified: new Date(),
    priority: 0.8,
  }))

  // ... herhaal voor andere content-types

  return [...staticPages, ...materialPages, ...articles, ...events, ...brands, ...talks]
}
```

Voor grote catalogi (jullie hebben duizenden materials) kun je ook meerdere sitemap-bestanden maken via Next.js's `generateSitemaps()` functie.

---

### 4. Articles-slug-mismatch: artikelen worden niet gevonden

Bij de test bleek dat `/articles/materialen-voor-de-zorgsector` een 404 geeft terwijl `/article/materialen-voor-de-zorgsector` op WP wél bestaat. Dit suggereert dat de slug-mapping in de API-laag nog niet werkt voor articles (de pagina toont "Article not found"). Controleer of de API call in `getArticle(slug)` de slug correct opvraagt en of de WP REST API het juiste endpoint gebruikt.

---

## 🟡 BELANGRIJK — eerste week na launch

### 5. `<title>`-tag bevat niet de volledige WP SEO-titel

De WP-site heeft via Yoast een custom SEO-titel zoals:
> **"Mush Surfaces - Bio-Lithic Edition - MaterialDistrict"**

De nieuwe site genereert de titel als `material.title`, wat resulteert in:
> **"Mush Surfaces – Bio-Lithic Edition | MaterialDistrict"**

Dit is heel dicht bij het origineel — het verschil is alleen het scheidingsteken (`–` vs `-` en `|` vs `-`). Google zal dit snel herkennen. Geen blocker, maar check of Yoast soms afwijkende SEO-titels heeft ingesteld voor specifieke items. Overweeg een `seoTitle`-veld op te halen vanuit de WP API als Yoast dat blootstelt via de REST API (`/wp-json/wp/v2/posts?_fields=yoast_head_json`).

### 6. Open Graph image ontbreekt op material-pagina's

Op de WP-site staat `og:image` correct ingesteld (vanuit Yoast). Op de nieuwe site staat in `generateMetadata` voor materials **geen** `images`-veld in de `openGraph` config:

```ts
openGraph: {
  title: material.title,
  description: description || undefined,
  type: 'article',
  url: `/materials/${material.slug}`,
  // ← GEEN images hier!
},
```

**Actie:** Voeg het hero-image toe:

```ts
openGraph: {
  title: material.title,
  description: description || undefined,
  type: 'article',
  url: `/materials/${material.slug}`,
  images: material.gallery?.hero?.sourceUrl
    ? [{ url: material.gallery.hero.sourceUrl }]
    : [],
},
```

Maar `generateMetadata` gebruikt `getMaterial` met `{ resolve: { gallery: false } }` — de gallery is dan niet beschikbaar. Ofwel:
- Switch naar `getMaterial` mét gallery-resolve (kost iets meer), of
- Sla de hero URL op als apart veld in het material-object dat ook bij `gallery: false` beschikbaar is.

### 7. Twitter card meta ontbreekt

De WP-site heeft `twitter:card: summary_large_image` en `twitter:site: @materialdistrct`. De nieuwe site genereert geen Twitter metadata. Voeg toe aan de root layout's metadata en aan detailpagina's:

```ts
// Root layout
twitter: {
  card: 'summary_large_image',
  site: '@materialdistrct',
},

// Detailpagina's
twitter: {
  card: 'summary_large_image',
  title: material.title,
  description,
  images: [heroImageUrl],
},
```

### 8. `article:modified_time` ontbreekt

De WP-site stuurt `article:modified_time` als OG-meta. Dit vertelt Google wanneer content het laatst is bijgewerkt — relevant voor het bepalen van crawlfrequentie. Voeg `modifiedTime` toe aan `openGraph` in article-detailpagina's:

```ts
openGraph: {
  type: 'article',
  publishedTime: article.publishedAt,
  modifiedTime: article.modifiedAt,
}
```

---

## 🟢 VERBETERING — kan ook na launch

### 9. Structured data: Product-schema mist `url` naar de juiste canonical

De huidige `buildProduct()` builder genereert als `url` en `@id`:

```ts
url: `${SITE_URL}/materials/${material.slug}`
```

Dit is goed — maar na de redirect-implementatie zul je willen dat de canonical URL in JSON-LD overeenkomt met de `<link rel="canonical">`. Check dat `SITE_URL` altijd `https://materialdistrict.com` is, ook op de Vercel preview-omgeving (want anders indexeert Google de preview-URL).

**Aanbeveling:** Voeg `noindex` toe aan alle Vercel preview deployments. Dit kan via een middleware of via Vercel's "Branch Protection" instellingen. Minimale implementatie in `src/middleware.ts`:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  // Vercel preview URLs bevatten 'vercel.app' — deze nooit indexeren
  if (request.headers.get('host')?.includes('vercel.app')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}
```

### 10. Breadcrumbs uitbreiden met category-niveau

Nu is de breadcrumb op material-detailpagina's: `Home > Materials > [Titel]`. De WP-site heeft een dieper pad: `Materials > [Category] > [Titel]`. Overweeg het category-niveau toe te voegen als dat beschikbaar is:

```ts
buildBreadcrumbList([
  { label: 'Home', url: '/' },
  { label: 'Materials', url: '/materials' },
  ...(materialCategoryTerms[0]
    ? [{ label: materialCategoryTerms[0].name, url: `/materials?material_category=${materialCategoryTerms[0].slug}` }]
    : []),
  { label: material.title },
])
```

### 11. `hreflang` voor meertalige content

Als jullie in de toekomst meertalige content aanbieden (bijv. NL/EN), voeg dan `hreflang`-alternates toe. Nu nog niet nodig, maar goed om in het achterhoofd te houden.

### 12. Kanaalspagina's (`/channels/[slug]`) hebben CollectionPage JSON-LD

Dit is al geïmplementeerd via `buildCollectionPage()`. Controleer of de channel-overzichtspagina's ook breadcrumbs hebben.

### 13. WebSite-schema's SearchAction wijst naar `/search?q=`

De `buildWebSite()` builder heeft al een `potentialAction` SearchAction. Check of het zoekpad `/search?q=` ook daadwerkelijk werkt in de nieuwe frontend.

### 14. Image alt-teksten in gallery

De gallery van material-detailpagina's toont nu afbeeldingen met als alt-tekst de materiaaltitel (niet de afbeeldingsspecifieke alt). Als WordPress per afbeelding een alt heeft ingesteld, gebruik die. Dit helpt bij Google Image Search — die ook een bron van verkeer is voor een materials-platform.

---

## Technische checklist vóór DNS-overzet

- [ ] `NEXT_PUBLIC_SITE_URL=https://materialdistrict.com` ingesteld op Vercel (production)
- [ ] Redirects voor alle WP permalink-patronen toegevoegd aan `next.config.ts`
- [ ] `src/app/robots.ts` aangemaakt met correcte disallow-paden
- [ ] `src/app/sitemap.ts` aangemaakt en sitemap getest op `/sitemap.xml`
- [ ] OG-image toegevoegd aan material metadata
- [ ] Twitter card meta toegevoegd
- [ ] `noindex` header op Vercel preview deployments
- [ ] Vercel preview URLs niet in Google Search Console toegevoegd
- [ ] Na launch: sitemap opnieuw indienen in Google Search Console
- [ ] Na launch: "Change of address" tool in Google Search Console gebruiken (van WP naar Next — zelfde domein, dus dit is minder kritisch, maar de herindexering aanzetten via "Request indexing" is zinvol)
- [ ] `article.modifiedAt` meegeven in OG-metadata

---

## Prioriteringsvolgorde

1. **Redirects** (next.config.ts) — voorkomt verlies van alle bestaande Google-rankings
2. **robots.txt** — vertelt Google wat niet geïndexeerd mag worden
3. **Sitemap** — helpt Google de nieuwe structuur te ontdekken
4. **OG-images** — voor social sharing en CTR
5. **Twitter cards** — relatief klein effect, maar eenvoudig toe te voegen
6. **Preview noindex** — beschermt productie-rankings
7. **Breadcrumb verdieping** — incrementele verbetering
