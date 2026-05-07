# MaterialDistrict — Project Brief

## Wat bouwen we

Een volledig nieuwe gebruikslaag bovenop de bestaande WordPress/WooCommerce-omgeving. Geen vervanging van het CMS — de Next.js-frontend werkt erbovenop via de REST API.

De mock-up (HTML-prototype) is de visuele en functionele referentie. Pixel-perfect, 1-op-1 bouwen volgens het ontwerp.

## Technische stack

| Laag | Technologie |
|---|---|
| Frontend framework | Next.js (React), App Router, TypeScript |
| Content & data | WordPress REST API |
| Webshop | WooCommerce REST API |
| Filters | FacetWP REST endpoint (al geconfigureerd) |
| CMS | WordPress + WooCommerce (blijft intact) |
| Authenticatie | WordPress applicatiewachtwoorden of JWT |
| Deployment | TBD (Vercel of eigen server) |

## Projectscope

### Laag 1 — Publieke website (Fase 1)
- Pixel-perfect implementatie van de mock-up
- Overzichts- en detailpagina's voor: Materials, Brands, Articles, Talks, Events, Books
- Homepage als laatste (brengt alle onderdelen samen)
- Algemene templates: login, register, about, privacy, header, footer, 404, 500

### Laag 2 — Backend / dashboards (Fase 2)
- Persoonlijk dashboard (Insider-gebruikers)
- Brand dashboard (fabrikanten)
- Contentbeheer voor brands
- Membershipbeheer
- Rechten en toegang gekoppeld aan membership-tiers
- Velden aansluiten op de frontend
- Zelfbeheer voor gebruikers en brands

## Bouwvolgorde Fase 1

1. Materials overzicht + detail
2. Brands overzicht + detail
3. Articles overzicht + detail
4. Talks overzicht + detail
5. Events overzicht + detail
6. Books overzicht + detail
7. Homepage
8. Algemene templates

## Bestaande URL-structuur

Alle bestaande URLs blijven intact. Geïndexeerde pagina's blijven bereikbaar op exact dezelfde URLs. Next.js routing volgt de WordPress-structuur precies.

## Site-wide principes

- **Mobile-first** — ontwerp en code starten vanuit het kleinste scherm
- **Server Components als standaard** — client-side JS alleen waar interactiviteit vereist is
- **SSG/ISR waar mogelijk** — SSR alleen voor dynamische/gepersonaliseerde content
- **Performance** — Core Web Vitals als meetlat, next/image, next/font, geen externe font-requests
- **Toegankelijkheid** — Semantische HTML, WCAG 2.1 AA kleurcontrast, toetsenbordnavigatie
- **SEO** — generateMetadata per pagina, Open Graph, Schema.org, sitemap, robots.txt
- **Veiligheid** — CSP headers, honeypots op formulieren, API-keys in .env.local
