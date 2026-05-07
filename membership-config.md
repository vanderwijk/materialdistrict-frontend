# MaterialDistrict — Membership Configuration

> Dit is de enige plek waar membership-instellingen worden gedefinieerd.
> De productie-implementatie hiervan is `src/lib/config/membership.ts`.
> Nooit membership-logica verspreid over losse components of API-calls.

---

## Overzicht: twee onafhankelijke membership-systemen

MaterialDistrict heeft twee losstaande membership-systemen die naast elkaar bestaan:

| Systeem | Voor wie | Naam in code |
|---|---|---|
| **Insider** | Bezoekers / specifiers / architecten | `readerTier` |
| **Manufacturer** | Fabrikanten / brands | `manufacturerTier` |

Een gebruiker kan tegelijkertijd Insider én een brand-account hebben.

---

## Systeem 1: Insider (Reader) Membership

### Tiers

| Tier | Sleutel | Prijs | Billing |
|---|---|---|---|
| Gratis account | `free` | € 0,- | — |
| Insider maand | `insider` | € 10,- / maand | Maandelijks, opzegbaar |
| Insider jaar | `insider` | € 100,- / jaar | Jaarlijks |

### Prijsinstellingen
```ts
INSIDER_PRICING = {
  monthly: {
    amount: 10,          // EUR
    currency: 'EUR',
    interval: 'month',
    cancelAnytime: true,
  },
  annual: {
    amount: 100,         // EUR
    currency: 'EUR',
    interval: 'year',
    cancelAnytime: false,
  },
}
```

### BTW
```ts
VAT = {
  rate: 0.21,           // 21% standaard Nederland
  included: false,      // prijzen zijn excl. BTW
  // Bij checkout: BTW-nummer validatie via VIES
  // NL-nummers: standaard 21%
  // EU B2B met geldig VAT-nummer: 0% (verlegging)
  // Buiten EU: 0%
}
```

### Features per tier

| Feature | free | insider |
|---|---|---|
| Materialen bekijken | ✓ | ✓ |
| Brands bekijken | ✓ | ✓ |
| Articles bekijken (niet-gated) | ✓ | ✓ |
| Bookmarks | ✓ | ✓ |
| Materialen vergelijken (beperkt) | 3 max | Onbeperkt |
| **Full material comparison** | — | ✓ |
| **Download PDFs & EPDs** | — | ✓ |
| **Sample requests** | — | ✓ |
| **Export compare as PDF** | — | ✓ |
| **Saved searches & alerts** | — | ✓ |
| **Insider insights** (rapporten, fair PDFs) | — | ✓ |
| **Boards** (projectmappen) | — | ✓ |
| **Insider articles** (gated content) | — | ✓ |
| **10% korting op boeken** | — | ✓ |
| **1 gratis event-entree per jaar** | — | ✓ |

### Boekkorting (Insider)
```ts
BOOK_DISCOUNT = {
  insiderDiscount: 0.10,   // 10% korting voor Insiders
}
```

### Insider badge kleur
```ts
INSIDER_BADGE_COLOR = '#1E8FA1'   // teal/cyan
INSIDER_BADGE_LABEL = 'Insider'
```

### Gating-logica
- Insider-only content toont een preview + upgrade-gate voor free gebruikers
- "Don't show again" optie voor Insider upsell modal (opgeslagen in localStorage)
- Bij vergelijken: free gebruikers zien de modal bij klikken op compare-icoon

---

## Systeem 2: Manufacturer Membership

### Tiers

| Tier | Sleutel | Prijs | Materialen | Periode |
|---|---|---|---|---|
| Free | `free` | € 0,- | 0 (losse materialen € 150,-/mat/jr) | — |
| Basis | `basis` | € 750,- / jr | 5 | Jaarlijks |
| Plus | `plus` | € 1.250,- / jr | 15 | Jaarlijks |
| Partner | `partner` | € 3.750,- / jr | Onbeperkt | Jaarlijks |

### Prijsinstellingen
```ts
MANUFACTURER_PRICING = {
  free: {
    annual: 0,
    materialPrice: 150,    // per materiaal per jaar (losse publicatie)
  },
  basis: {
    annual: 750,
    materialsIncluded: 5,
  },
  plus: {
    annual: 1250,
    materialsIncluded: 15,
  },
  partner: {
    annual: 3750,
    materialsIncluded: Infinity,
  },
}
```

### BTW (manufacturer)
- Alle prijzen excl. BTW
- Jaarlijkse commitment
- BTW-nummer verplicht bij checkout
- Zelfde VIES-validatie als Insider checkout

### Beurskorting
```ts
FAIR_DISCOUNT = {
  free:    0,      // 0%
  basis:   0.05,   // 5%
  plus:    0.10,   // 10%
  partner: 0.15,   // 15%
}
```

### Features per tier

| Feature | free | basis | plus | partner |
|---|---|---|---|---|
| Listed in Brand Directory | ✓ | ✓ | ✓ | ✓ |
| Individual Brand Page | ✓ | ✓ | ✓ | ✓ |
| Listed in Materials Directory | + €150/mat/jr | ✓ | ✓ | ✓ |
| Individual Material Pages | per materiaal | 5 | 15 | Onbeperkt |
| Receive Sample & Info Requests | — | ✓ | ✓ | ✓ |
| Access to Statistics | — | Basis | Full | Full |
| Geo-based Lead Routing | — | — | ✓ | ✓ |
| Add Brochures & Videos | — | — | ✓ | ✓ |
| PDF & EPD downloads (upload) | — | — | ✓ | ✓ |
| Video uploads | — | — | ✓ | ✓ |
| Video link | — | — | ✓ | ✓ |
| Keywords | — | — | ✓ | ✓ |
| Lead routing | — | — | ✓ | ✓ |
| Exclusive Networking Events | — | — | — | ✓ |
| Featured placement (self-service) | — | — | — | 4× / jr |
| Beurskorting MaterialDistrict | 0% | 5% | 10% | 15% |
| Support | Email | Email | Email + telefoon | Email + telefoon |

### Materiaal-limiet per tier
```ts
function getMaterialLimit(tier: ManufacturerTier): number {
  switch (tier) {
    case 'partner': return Infinity
    case 'plus':    return 15
    case 'basis':   return 5
    case 'free':    return 0   // of €150/mat/jr losse publicatie
  }
}
```

### Feature-toegang per tier
```ts
// Features die NIET beschikbaar zijn per tier (blacklist-aanpak)
MANUFACTURER_FEATURE_GATES = {
  basis: [
    'PDF & EPD downloads',
    'Video uploads',
    'Video link',
    'Lead routing',
    'Add Brochures & Videos',
    'Geo-based Lead Routing',
    'Exclusive Networking Events',
    'Featured placement',
    'Networking events',
    'Keywords',
  ],
  plus: [
    'Featured placement',
    'Networking events',
    'Exclusive Networking Events',
  ],
  partner: [],   // geen beperkingen
  free: [
    // alles behalve brand page en directory
    'Receive Sample & Info Requests',
    'Access to Statistics',
    'Geo-based Lead Routing',
    'Add Brochures & Videos',
    'PDF & EPD downloads',
    'Video uploads',
    'Video link',
    'Lead routing',
    'Keywords',
    'Exclusive Networking Events',
    'Featured placement',
    'Networking events',
  ],
}
```

### Tier-kleuren (voor UI)
```ts
MANUFACTURER_TIER_COLORS = {
  free:    '#6090B8',
  basis:   '#0058A0',
  plus:    '#183E90',
  partner: '#0E2E78',
}
```

### Legacy-modus
Brands die vóór het nieuwe systeem materialen hadden, krijgen een legacy-banner:
- Melding: "Your materials expire in X months"
- Deadline: automatisch archivering op 30 April 2027
- Actie: kies een membership om materialen te behouden

---

## Dashboard-navigatie per account-type

### Persoonlijk account (Insider / free)
- Overview
- Bookmarks
- Boards *(alleen Insider)*
- Saved searches *(alleen Insider)*
- Insider insights *(alleen Insider)*
- Orders (boeken)
- Profile settings
- Membership

### Brand account
- Overview / Statistics
- Materials (beheren, toevoegen)
- Brand profile
- Sample requests *(vanaf Basis)*
- Lead routing *(alleen Plus / Partner)*
- Featured placements *(alleen Partner)*
- Invoices
- Membership (upgrade/downgrade)
- Team members *(optioneel Fase 2)*

---

## Checkout flow

### Insider checkout
1. Gegevens (naam, e-mail)
2. BTW / bedrijfsgegevens (optioneel)
3. Betaling (WooCommerce)
4. Bevestiging

### Manufacturer checkout (upgrade)
1. Gegevens (bedrijfsnaam, contactpersoon)
2. BTW-nummer (VIES-validatie)
   - NL → 21% BTW
   - EU B2B geldig VAT → 0% (verlegging)
   - Non-EU → 0%
3. Betaling (WooCommerce, jaarlijks)
4. Bevestiging + activatie

---

## Implementatie in productie

```ts
// src/lib/config/membership.ts

export const INSIDER_PRICING = { ... }
export const MANUFACTURER_PRICING = { ... }
export const VAT = { ... }
export const BOOK_DISCOUNT = { ... }
export const FAIR_DISCOUNT = { ... }
export const MANUFACTURER_FEATURE_GATES = { ... }
export const MANUFACTURER_TIER_COLORS = { ... }

// Helper: check of een feature beschikbaar is
export function canAccess(tier: ManufacturerTier, feature: string): boolean {
  return !MANUFACTURER_FEATURE_GATES[tier].includes(feature)
}

// Helper: bereken boekprijs voor Insiders
export function getBookPrice(basePrice: number, isInsider: boolean): number {
  return isInsider ? basePrice * (1 - BOOK_DISCOUNT.insiderDiscount) : basePrice
}
```
