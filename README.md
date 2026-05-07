# MaterialDistrict — Frontend

Next.js (App Router, TypeScript) frontend bovenop de bestaande WordPress / WooCommerce-omgeving van MaterialDistrict.

> Volledige projectcontext: zie `project-brief.md`, `architecture-rules.md`, `membership-config.md`, `design-tokens.md` en de definitieve mockup `MaterialDistrict_MockUp_DEF.html`.

---

## Vereisten

- Node.js ≥ 20
- npm of yarn
- Toegang tot de WordPress REST API + WooCommerce REST keys

---

## Installatie

```bash
# 1. Dependencies
npm install

# 2. Environment
cp .env.local.example .env.local
# Vul de echte waarden in. .env.local NOOIT committen.

# 3. Dev server
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

| Script | Functie |
|---|---|
| `npm run dev` | Dev server met hot reload |
| `npm run build` | Productie-build |
| `npm run start` | Start productie-build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript zonder build |

---

## Mappenstructuur

```
src/
├── app/                  # Next.js App Router
│   ├── (public)/         # Publieke routes
│   ├── (auth)/           # Login, register
│   ├── (dashboard)/      # Dashboard (Fase 2)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── ui/               # Generieke UI (Button, Card, Tag, …)
│   ├── layout/           # Header, Footer, Breadcrumb
│   ├── materials/        # Sectie-specifiek
│   ├── brands/
│   ├── articles/
│   ├── talks/
│   ├── events/
│   ├── books/
│   └── membership/
├── lib/
│   ├── api/              # WordPress / WooCommerce / FacetWP clients
│   ├── config/           # Centrale configuratie (membership, …)
│   └── utils/
├── styles/
│   └── globals.css       # ENIGE stylesheet
└── types/                # TypeScript interfaces
```

---

## Conventies (niet onderhandelbaar)

1. **Eén stylesheet** — alle styling in `src/styles/globals.css`. Geen Tailwind, geen CSS-modules, geen styled-components.
2. **Tokens als CSS-variabelen** — kleuren, spacing, typografie, radius. Nooit hardcoded waarden in components.
3. **Klassen, geen inline-stijlen** — uitzondering: dynamische waarden via `style={{ '--item-color': value } as React.CSSProperties}`.
4. **Server Components default** — `"use client"` alleen waar nodig (interactiviteit, hooks).
5. **Mobile-first** — alle CSS begint vanuit het kleinste scherm.
6. **Generic types in folders, sectie-specifieke types ernaast** — `src/types/material.ts`, `src/types/brand.ts`, …
7. **Membership-logica uitsluitend via `src/lib/config/membership.ts`** — nooit duplicatie of inline tier-checks.

Volledige regels: `architecture-rules.md`.

---

## Mockup als referentie

`MaterialDistrict_MockUp_DEF.html` is de visuele en functionele referentie. Pixel-perfect, 1-op-1 implementeren.
Bij conflict tussen `design-tokens.md` en de mockup: **mockup wint**.

---

## Bouwvolgorde

Zie `build-order.md`. Per stap één Claude-sessie. Na elke sessie `session-log.md` bijwerken.

---

## Status

Stap 1 — Projectfundament: ✅ klaar
Stap 2 — API & datamodel: volgende sessie
