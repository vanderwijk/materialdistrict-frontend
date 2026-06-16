# SEO Migratieplan — MaterialDistrict Next

**Status:** Pre-launch checklist  
**Doel:** Google-ranking behouden en verbeteren bij overgang van WordPress naar Next.js (Vercel)  
**Spec-referentie:** [specification.website/spec/seo](https://specification.website/spec/seo/)

---

## Wat al goed is

De nieuwe Next.js site heeft al een solide basis:
- `generateMetadata` met title, description en canonical op elke detailpagina
- JSON-LD structured data: Product, Article, Event, VideoObject, Book, BreadcrumbList, Organization, WebSite
- Server-side rendering via Next.js App Router (crawlers zien volledige HTML in de eerste response)
- URL-structuur matcht nu de bestaande WP-site (`/material/`, `/article/`, `/brand/` etc.)
- Taxonomy-pagina's aanwezig: `/material-category/[slug]`, `/tag/[slug]`, `/channel/[slug]`

---

## 🔴 KRITIEK — vóór launch

### 1. Geen `robots.txt`

**Spec: [recommended](https://specification.website/spec/seo/robots-txt/)**

De nieuwe site heeft geen `robots.txt`. Crawlers vallen dan terug op de standaard (alles crawlen), inclusief `/dashboard/`, `/checkout/` en `/api/`.

**Actie — maak `src/app/robots.ts`:**

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
        '/sign-in',
        '/register',
      ],
    },
    sitemap: 'https://materialdistrict.com/sitemap.xml',
  }
}
```

**Let op:** `robots.txt Disallow` voorkomt crawlen, maar niet indexeren. Een pagina die extern gelinkt wordt kan nog steeds in de index terechtkomen zonder snippet. Voor private content (dashboard, checkout) is `Disallow` voldoende omdat die pagina's niet extern gelinkt zijn. Voor de staging-omgeving geldt een andere aanpak — zie punt 2.

### 2. Vercel preview deployments worden geïndexeerd

**Spec: [required](https://specification.website/spec/seo/meta-robots/) — kritiekste fout bij staging**

De spec is hier expliciet: "Vergeten noindex op een staging.example.com is een top-vijf SEO-fout." Zodra Google een preview-URL indexeert, concurreert die met productie.

`robots.txt Disallow` werkt hier **niet** — een verwijderd pad kan alsnog geïndexeerd worden via externe links. De juiste aanpak is `X-Robots-Tag: noindex` op HTTP-niveau, zodat de crawler de header altijd ziet.

**Actie — maak `src/middleware.ts`:**

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const host = request.headers.get('host') ?? ''

  // Vercel preview deployments (*.vercel.app) en staging-domeinen nooit indexeren.
  // X-Robots-Tag werkt ook voor non-HTML resources; de meta-robots tag alleen voor HTML.
  if (host.includes('vercel.app') || host.startsWith('staging.')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
```

### 3. Geen sitemap — en als je er één maakt, doe het dan goed

**Spec: [recommended](https://specification.website/spec/seo/xml-sitemaps/) + [sitemap index](https://specification.website/spec/seo/sitemap-index/)**

MaterialDistrict heeft duizenden materials, articles, brands, events en talks. De bestaande WP-site gebruikt al een sitemap-index gesplitst per content-type — Google Search Console rapporteert dan per categorie hoeveel URLs zijn gevonden vs. geïndexeerd. Dat is veel inzichtelijker dan één grote sitemap.

**Belangrijke spec-regels:**
- Lijst alleen canonieke URLs — geen redirect-URLs, geen 404-URLs
- Stel `<lastmod>` in op de **werkelijke datum** dat de content is gewijzigd, niet de builddatum. Google gebruikt dit voor crawl-scheduling; als elke URL altijd de huidige datum heeft, degradeert het signaal.
- `<changefreq>` en `<priority>` worden door Google genegeerd — weglaten
- Maximum 50.000 URLs per sitemap-bestand en 50 MB ongecomprimeerd

**Actie A — sitemap-index in `src/app/sitemap.ts`:**

```ts
import type { MetadataRoute } from 'next'

// Next.js ondersteunt generateSitemaps() voor meerdere sitemap-bestanden.
// Gebruik een sitemap-index die verwijst naar per-type sitemaps.
export default function sitemap(): MetadataRoute.Sitemap {
  // Dit bestand wordt de sitemap-index; de child-sitemaps komen hieronder.
  return []
}
```

**Actie B — gesplitste sitemaps per content-type:**

Maak aparte bestanden aan, elk met `generateSitemaps()` voor paginering bij grote catalogi:

- `src/app/sitemap-materials/route.ts` → alle `/material/[slug]` URLs met `lastmod` vanuit WP `modified`-datum
- `src/app/sitemap-articles/route.ts` → alle `/article/[slug]` URLs
- `src/app/sitemap-brands/route.ts` → alle `/brand/[slug]` URLs
- `src/app/sitemap-events/route.ts` → alle `/event/[slug]` URLs
- `src/app/sitemap-talks/route.ts` → alle `/talk/[slug]` URLs

**Alternatief** (sneller te implementeren): gebruik Next.js's ingebouwde `generateSitemaps` in één `sitemap.ts` die meerdere bestanden genereert. Next.js maakt dan automatisch `/sitemap/0.xml`, `/sitemap/1.xml` etc. en een index.

### 4. OG-image ontbreekt op materialpagina's

De `generateMetadata` voor materials geeft geen `images` mee in de OpenGraph-config, maar `getMaterial` wordt aangeroepen met `{ resolve: { gallery: false } }`. Voeg een los `heroUrl`-veld toe of haal het uit de material-response zonder volledige gallery-resolve:

```ts
openGraph: {
  title: material.title,
  description: description || undefined,
  type: 'article',
  url: `/material/${material.slug}`,
  images: material.heroUrl ? [{ url: material.heroUrl }] : [],
},
```

### 5. Soft 404 risico op lege taxonomy-pagina's

**Spec: [avoid](https://specification.website/spec/seo/soft-404/)**

Een pagina die "no materials found" toont maar `200 OK` teruggeeft is een soft 404. Google behandelt dit als een kwaliteitsprobleem en kan de hele site minder gaan crawlen als er veel van zijn.

De nieuw gebouwde `/material-category/[slug]` en `/tag/[slug]` pagina's tonen een `<EmptyState>` bij 0 resultaten — maar geven dan wel `200 OK` terug.

**Actie — geef `404` terug bij lege taxonomy-pagina's:**

In `src/app/material-category/[slug]/page.tsx` en `src/app/tag/[slug]/page.tsx`:

```ts
import { notFound } from 'next/navigation'

// Na het ophalen van items:
if (!term) notFound()

// Optioneel: ook notFound() bij 0 resultaten op pagina 1
if (page === 1 && items.length === 0) notFound()
```

Dit geldt ook voor eventuele andere overzichtspagina's die met lege resultaten kunnen eindigen.

### 6. `NEXT_PUBLIC_SITE_URL` moet correct zijn op Vercel

Alle canonical URLs en JSON-LD `@id`-waarden worden geconstrueerd vanuit `process.env.NEXT_PUBLIC_SITE_URL`. Als die variabele ontbreekt of verkeerd staat, wijzen alle canonicals naar een foute URL.

**Actie:** Check in Vercel dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SITE_URL=https://materialdistrict.com` (production, geen trailing slash)
- Preview-omgevingen mogen een andere waarde hebben, maar die worden toch al geblokkeerd via de X-Robots-Tag middleware (punt 2).

---

## 🟡 BELANGRIJK — eerste week na launch

### 7. Twitter card meta ontbreekt

De WP-site heeft `twitter:card: summary_large_image` en `twitter:site: @materialdistrct`. Voeg toe aan de root layout en detailpagina's:

```ts
// Root layout metadata
twitter: {
  card: 'summary_large_image',
  site: '@materialdistrct',
},

// Detailpagina's (material, article, event)
twitter: {
  card: 'summary_large_image',
  title: material.title,
  description,
  images: heroImageUrl ? [heroImageUrl] : [],
},
```

### 8. `<lastmod>` in sitemap moet echte datum zijn

In de huidige sitemap-code staat `lastModified: new Date()` — dit is de builddatum, niet de datum dat de content is veranderd. Google gebruikt `lastmod` om te bepalen wanneer een URL opnieuw gecrawled moet worden. Als elke URL altijd de huidige datum heeft, negeert Google het signaal.

**Actie:** Geef de `modified`-datum mee vanuit WordPress:

```ts
{ url: `${SITE_URL}/material/${slug}`, lastModified: new Date(modified) }
```

### 9. `article:modified_time` in Open Graph

Voor Google News en het crawl-schema is `modifiedTime` een nuttig signaal. Voeg het toe aan article-detailpagina's:

```ts
openGraph: {
  type: 'article',
  publishedTime: article.publishedAt,
  modifiedTime: article.modifiedAt,
}
```

---

## 🟢 VERBETERING — kan ook na launch

### 10. IndexNow voor snelle herindexering bij Bing/Yandex

**Spec: [optional](https://specification.website/spec/seo/indexnow/)**

Eén HTTP-request notificeert Bing, Yandex, Naver en Seznam tegelijk dat een URL is toegevoegd of bijgewerkt. Google doet **niet** mee aan IndexNow. Voor MaterialDistrict, dat regelmatig nieuwe materials toevoegt, is dit de snelste manier om die pagina's in Bing's index te krijgen (minuten i.p.v. dagen).

**Implementatie:**
1. Genereer een key (8–128 tekens, `[a-zA-Z0-9-]`)
2. Sla op als statisch bestand in `public/<key>.txt`
3. Ping `https://api.indexnow.org/indexnow` na elke content-publicatie vanuit WordPress (bijv. via een WP-hook in de plugin die na `save_post` een request stuurt)

### 11. Image sitemap extensie

**Spec: [optional](https://specification.website/spec/seo/image-sitemaps/)**

MaterialDistrict is een visueel platform — Google Image Search is een relevante verkeersbron. Een image sitemap-extensie helpt Google de afbeeldingen te ontdekken die via CDN worden geserveerd. Voeg aan de materials-sitemap toe:

```xml
<url>
  <loc>https://materialdistrict.com/material/mush-surfaces-bio-lithic-edition</loc>
  <image:image>
    <image:loc>https://materialdistrict.com/wp-content/uploads/2026/05/Mush-Art-Tiles_01.jpg</image:loc>
    <image:title>Mush Surfaces – Bio-Lithic Edition</image:title>
  </image:image>
</url>
```

### 12. Orphan-pagina's voorkomen

**Spec: [recommended](https://specification.website/spec/seo/internal-linking/)**

De spec stelt dat elke URL in de sitemap bereikbaar moet zijn via ten minste één andere pagina door gewone navigatie. De nieuwe taxonomy-pagina's (`/material-category/`, `/tag/`) zijn momenteel niet bereikbaar via de navigatie — ze bestaan alleen als directe URL en via externe links.

**Actie:** Voeg links toe op de materialpagina naar de categorie- en tag-pagina's. Op de materialpagina zijn `materialCategoryTerms` en `keywords` al beschikbaar; maak die links actief naar `/material-category/[slug]` en `/tag/[slug]`.

### 13. Breadcrumbs uitbreiden met category-niveau

Nu is de breadcrumb op materialpagina's: `Home > Materials > [Titel]`. Voeg de materiaalcategorie toe als tussenniveau:

```ts
buildBreadcrumbList([
  { label: 'Home', url: '/' },
  { label: 'Materials', url: '/material' },
  ...(materialCategoryTerms[0]
    ? [{ label: materialCategoryTerms[0].name, url: `/material-category/${materialCategoryTerms[0].slug}` }]
    : []),
  { label: material.title },
])
```

### 14. Interne links: gebruik canonieke URLs, niet redirects

**Spec: [recommended](https://specification.website/spec/seo/internal-linking/)**

Nu de URL-structuur is gematcht met WP, zijn er geen interne redirects meer nodig. Maar check na launch met Search Console's Links-rapport of er nog interne links naar de oude plural-paden lopen (bijv. vanuit gecachte sitemap-entries of externe systemen).

### 15. SearchAction in WebSite-schema wijst naar `/search?q=`

De `buildWebSite()` builder heeft al een `potentialAction` SearchAction. Controleer of `/search?q=` daadwerkelijk werkt en resultaten geeft — anders geeft de structured data een signaal dat Google niet kan valideren.

---

## Launch checklist

- [x] `trailingSlash: true` in `next.config.ts` — Next.js stuurt nu altijd door naar URL met slash
- [x] `canonicalPath()` functie in `src/lib/seo/urls.ts` — voegt automatisch trailing slash toe aan alle canonicals en JSON-LD URLs
- [x] `absolutePageUrl()` in structured-data builders — alle JSON-LD `@id` en `url` waarden hebben trailing slash
- [x] `src/app/robots.ts` aangemaakt — blokkeert crawlen van private paden; stuurt `Disallow: /` op preview/staging hosts
- [x] `X-Robots-Tag: noindex, nofollow` voor preview/staging — geïmplementeerd via `vercel.json` headers op platform-niveau (betrouwbaarder dan middleware bij Turbopack)
- [ ] `NEXT_PUBLIC_SITE_URL=https://materialdistrict.com` op Vercel (production, geen trailing slash)
- [ ] Sitemap aangemaakt, gesplitst per content-type, met echte `lastmod`-datums vanuit WP `modified`
- [ ] OG-image toegevoegd aan material `generateMetadata`
- [ ] Twitter card meta toegevoegd aan root layout en detailpagina's
- [ ] Soft 404 gefixt: `notFound()` bij 0 resultaten op taxonomy-pagina's (pagina 1)
- [ ] Na DNS-overzet: sitemap indienen in Google Search Console
- [ ] Na DNS-overzet: sitemap indienen in Bing Webmaster Tools
- [ ] `site:materialdistrict-frontend.vercel.app` in Google — moet 0 resultaten geven

**Opmerking preview-beveiliging:** Drie lagen werken samen:
1. `vercel.json` — `X-Robots-Tag: noindex, nofollow` op HTTP-niveau voor alle `*.vercel.app` en `staging.*` domeinen (platform-native, geen Turbopack-conflict)
2. `robots.ts` — stuurt `Disallow: /` voor dezelfde hosts als extra crawl-blokkade
3. `isNonProductionHost()` in `src/lib/seo/host.ts` — gedeelde logica voor beide

---

## Prioriteringsvolgorde

1. **X-Robots-Tag middleware** — voorkomt indexering van preview-omgeving
2. **robots.txt** — vertelt crawlers wat niet gecrawled mag worden
3. **Sitemap-index** — helpt Google alle content te ontdekken met juiste `lastmod`
4. **OG-image** — voor social sharing en CTR
5. **Soft 404 fix** — voorkomt kwaliteitsdegradatie bij lege pagina's
6. **Twitter cards** — klein effect, eenvoudig te doen
7. **IndexNow** — voor snelle Bing/Yandex-indexering van nieuwe materials
8. **Image sitemap** — Google Image Search als extra verkeerskanaal
9. **Orphan-links** — taxonomy-pagina's bereikbaar maken via materialpagina's
10. **Breadcrumb verdieping** — incrementele verbetering voor rich snippets
