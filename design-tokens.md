# MaterialDistrict — Design Tokens

> Alle waarden hieronder komen direct uit de definitieve mockup (`MaterialDistrict_MockUp_DEF.html`, intern variant 20 / "Variant 2").
> Dit is de directe input voor `src/styles/globals.css` in de productie-implementatie.
> Alle waarden zijn 1-op-1 overgenomen uit de actieve CSS van de mockup — niet "vergelijkbaar", maar exact.

---

## Kleurpalet

### Core brand
```css
--navy:         #183E90;   /* Primaire kleur — koppen, CTA's, navbar */
--navy-mid:     #0058A0;   /* Hover state voor navy, secundaire navy */
--navy-light:   #4070B0;   /* Links, secundaire acties, focus rings */
--green:        #2E8C32;   /* Diepere green */
--green-mid:    #3A9C38;   /* Primary green — logo-mark, success accenten */
--green-light:  #B8E8B8;   /* Lichte green, decoratief */
--green-pale:   #EAF5EA;   /* Groene achtergronden, success states */
--red:          #D84B4B;   /* Error, danger */
--amber:        #E07B2B;   /* Waarschuwingen, badges */
```

### Neutrale kleuren (light mode)
```css
--bg:           #FBFAF7;   /* Pagina-achtergrond — paper canvas; tegels/panels op --surface (wit) */
--surface:      #FFFFFF;   /* Cards, panels */
--surface2:     #F5F7F8;   /* Subtiele achtergronden binnen surfaces, hover-states */
--border:       #E2E8EF;   /* Lijnen, dividers */
--text:         #0D1F2D;   /* Primaire tekst */
--text-muted:   #5A6A7A;   /* Secundaire tekst */
--text-hint:    #9AABB8;   /* Placeholder, labels, eyebrows */
--ink:          #16202B;   /* Interface-chrome accent (near-black) — F2.1: nav-actief, header-Dashboard, paginatie-actief */
--on-ink:       #FFFFFF;   /* Tekst/icoon op --ink */
```

### Dark mode (via `[data-theme="dark"]`)
```css
--bg:           #0D1117;
--surface:      #161D2B;
--surface2:     #1E2A3A;
--border:       #2D3F55;
--text:         #F0F6FC;
--text-muted:   #8B9EB8;
--text-hint:    #4D6278;
--ink:          #F0F6FC;   /* Inverteert in dark: lichte pill, donkere tekst */
--on-ink:       #0D1117;

/* Donkere varianten van content-type pales (tonal swap) */
--green-pale:        #0D2318;
--green-light:       #163A16;
--ct-material-pale:  #182200;
--ct-article-pale:   #081630;
--ct-event-pale:     #001A0E;
--ct-book-pale:      #1E1900;
--ct-brand-pale:     #081630;
--ct-member-pale:    #001A22;

/* Dark shadows */
--shadow:       0 1px 4px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4);
--shadow-lg:    0 6px 28px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.5);
```

### Content-type kleuren
Elke content-sectie heeft een eigen kleuridentiteit. Gebruikt voor tags (`.ct-tag`), navigatie-onderstreping en accenten.

```css
/* Materials — olijf/lime */
--ct-material:       #88A800;
--ct-material-pale:  #F0F5D8;
--ct-material-dark:  #4A5800;

/* Articles — blauw (zelfde palet als brands) */
--ct-article:        #0058A0;
--ct-article-pale:   #DCE8F8;
--ct-article-dark:   #183E90;

/* Events — diepgroen */
--ct-event:          #007838;
--ct-event-pale:     #D8F0E8;
--ct-event-dark:     #004828;

/* Books — geel/oker */
--ct-book:           #C8BC00;
--ct-book-pale:      #F8F5D0;
--ct-book-dark:      #706800;

/* Brands — blauw */
--ct-brand:          #4070B0;
--ct-brand-pale:     #DCE8F8;
--ct-brand-dark:     #183E90;

/* Membership / Insider / Talks — teal */
--ct-member:         #007890;
--ct-member-pale:    #DDF2F5;
--ct-member-dark:    #005A6A;
```

> **Let op:** in de mockup wordt `--ct-member` ook gebruikt voor de Talks-navigatie (zelfde teal-palet). Gating-elementen (Insider-only badges, modals) gebruiken eveneens deze teal.

---

## Typografie

### Font families
```css
--font-display: 'Schibsted Grotesk', system-ui, sans-serif;
--font-body:    'Schibsted Grotesk', system-ui, -apple-system, sans-serif;
```

> **Eén grotesk-familie:** Schibsted Grotesk (400, 500, 600, 700) voor zowel body als display.
> Geladen via `next/font/google` (self-hosted, geen externe requests) in `src/app/layout.tsx`.

### Body baseline
```css
html, body {
  font-family: var(--font-body);
  font-size: 15px;          /* basis lichaamsgrootte (Variant 2) */
  line-height: 1.65;
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
}
```

### Display-typografie (kopstijlen)
Alle display-elementen gebruiken `var(--font-display)` (Schibsted Grotesk) met strakke tracking.

```css
/* Gemeenschappelijk voor alle display-koppen */
font-family: var(--font-display);
font-weight: 500;          /* default */
letter-spacing: -0.02em;
line-height: 1.15;
```

### Type-schaal (effectieve waarden uit mockup)

| Token | Px | Rem | Toepassing |
|---|---|---|---|
| `--text-eyebrow` | 11px | 0.6875rem | Eyebrows, micro-labels, tags (uppercase, letter-spacing 0.12em) |
| `--text-xs` | 12px | 0.75rem | Captions, secundaire labels |
| `--text-sm` | 13px | 0.8125rem | Buttons-sm, kleine UI-tekst |
| `--text-base` | 14px | 0.875rem | Card titles, header nav |
| `--text-md` | 15px | 0.9375rem | Body default, story titles |
| `--text-lg` | 16px | 1rem | Lead-paragrafen, btn-lg |
| `--text-xl` | 17px | 1.0625rem | Card titles (display) |
| `--text-2xl` | 20px | 1.25rem | Sidebar CTA title (small) |
| `--text-3xl` | 28px | 1.75rem | Sidebar CTA title (groot), section titles (mobiel) |
| `--text-4xl` | 36px | 2.25rem | Featured editorial title |
| `--text-5xl` | 44px | 2.75rem | Section titles (desktop), stat values |
| `--text-6xl` | 52px | 3.25rem | Editorial featured title (groot) |
| `--text-7xl` | 64px | 4rem | Hero title (desktop) |

### Specifieke kop-componenten

```css
.section-title {
  font-family: var(--font-display);
  font-size: 44px;        /* desktop — 28px op tablet, 20px op mobiel */
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--text);
}

.hero-title {
  font-family: var(--font-display);
  font-size: 64px;        /* desktop — 32px tablet, 28px mobiel, 24px klein */
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.02;
  color: white;
}

.ed-featured-title {
  font-family: var(--font-display);
  font-size: 52px;        /* desktop — 22px op kleinere schermen */
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.page-title {
  font-family: var(--font-display);
  font-size: 48px;        /* desktop — 22px op mobiel */
  font-weight: 600;
  margin-bottom: 32px;
}

.login-title      { font-size: 56px; font-weight: 600; }
.login-form-title { font-size: 42px; font-weight: 600; }
.stat-value       { font-size: 44px; font-weight: 600; letter-spacing: -0.03em; }
.sidebar-cta-title{ font-size: 28px; font-weight: 600; line-height: 1.15; }
.ip-title         { font-size: 24px; }                /* slide-over panel */
.cm-pull-quote    { font-size: 22px; line-height: 1.45; font-style: italic; }

.card-title  { font-size: 17px; font-weight: 600; line-height: 1.4; letter-spacing: -0.015em; }
.story-title { font-size: 15px; font-weight: 500; line-height: 1.4; letter-spacing: -0.01em; }
```

### Eyebrows / micro-labels
Worden gebruikt voor `.tag`, `.shortcuts-label`, `.story-label`, `.card-date`, `.field-label`, `.login-eyebrow`, etc.

```css
font-family: var(--font-body);
font-size: 11px;
font-weight: 500;
letter-spacing: 0.12em;
text-transform: uppercase;
```

### Header-navigatie
```css
.header-nav button {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  text-transform: none;       /* GEEN uppercase meer */
  letter-spacing: -0.005em;
  color: var(--text);
  height: 62px;
}
.header-nav button.active { color: var(--ink); border-bottom: 2px solid var(--ink); }  /* F2.1: zwart i.p.v. navy */
```

### Logo
```css
.logo-text {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
}
```

---

## Spacing

```css
--space-1:   0.25rem;    /* 4px */
--space-2:   0.5rem;     /* 8px */
--space-3:   0.75rem;    /* 12px */
--space-4:   1rem;       /* 16px */
--space-5:   1.25rem;    /* 20px */
--space-6:   1.5rem;     /* 24px */
--space-7:   1.75rem;    /* 28px */
--space-8:   2rem;       /* 32px */
--space-10:  2.5rem;     /* 40px */
--space-12:  3rem;       /* 48px */
--space-14:  3.5rem;     /* 56px */
--space-16:  4rem;       /* 64px */
--space-18:  4.5rem;     /* 72px */
--space-20:  5rem;       /* 80px */
--space-24:  6rem;       /* 96px */
--space-30:  7.5rem;     /* 120px */
```

> Variant 2 hanteert een ruimer ritme dan voorheen: homepage main padding is `96px 32px 120px`, hp-content gap is `96px`, sectie-paddings 56–80px.

---

## Border radius

```css
--radius:     3px;    /* Klein — buttons, badges, channel pills */
--radius-md:  4px;    /* Cards, panels, inputs (subtiel) */
--radius-lg:  8px;    /* Modals, login-page, grote containers */
```

> Subtieler dan voorheen — de mockup gaat bewust voor strakke, redactionele rondingen.

---

## Shadows

```css
--shadow:     none;                                                            /* default — bewust afwezig */
--shadow-lg:  0 2px 14px rgba(0,0,0,0.06);                                     /* hover-state, modals */

/* Specifieke gevallen */
--shadow-modal:  0 20px 60px rgba(13,47,78,0.25);                              /* insider modal */
--shadow-panel:  0 -4px 24px rgba(13,47,78,0.10);                              /* sticky footer */
```

> Cards hebben standaard **geen** shadow — alleen een hairline-border. Hover trekt hem op met `--shadow-lg`. Geen translateY-lift meer op hover.

---

## Breakpoints

```css
--bp-mobile:  768px;    /* < 768px = mobiel */
--bp-tablet:  1024px;   /* 768–1024px = tablet */
--max-width:  1280px;   /* Max content-breedte (geen breakpoint) */
```

> De mockup gebruikt **twee** mediabreakpoints: `max-width: 1024px` (tablet) en `max-width: 768px` (mobile). 1280px is uitsluitend de container max-width.

```css
@media (max-width: 1024px) { /* tablet — header 56px, hero 32px */ }
@media (max-width: 768px)  { /* mobile — header 54px, hero 28px, nav verbergen */ }
```

---

## Layout

```css
--header-height-desktop: 62px;
--header-height-tablet:  56px;
--header-height-mobile:  54px;

--sidebar-width:          256px;   /* Dashboard sidebar */
--filter-sidebar-width:   220px;   /* Overzichtspagina filter sidebar */
--filter-sidebar-mobile:  280px;   /* Mobiele filter drawer */

--content-padding-desktop: 32px;
--content-padding-tablet:  20px;
--content-padding-mobile:  14px;

--editorial-sidebar:      240px;   /* `.ed-side` op overzichtspagina's */
--pub-layout-sidebar:     300px;   /* Article/talk pub-layout sidebar */
--insider-panel-width:    440px;   /* Slide-over panel rechts */
--compare-slot:           120px;   /* Compare bar slot breedte */
```

---

## Component-specifieke tokens

### Knoppen
```css
.btn        { height: 42px; padding: 0 22px; font-size: 14px; font-weight: 500;
              letter-spacing: -0.005em; border-radius: var(--radius); }
.btn-sm     { height: 34px; padding: 0 14px; font-size: 13px; }
.btn-lg     { height: 52px; padding: 0 32px; font-size: 16px; }

.btn-primary { background: var(--navy); color: white; }
.btn-primary:hover { background: var(--navy-mid); }

.btn-green   { background: var(--green-mid); color: white; }
.btn-green:hover { background: var(--green); }

.btn-blue    { background: var(--navy-light); color: white; }
.btn-blue:hover { background: var(--navy-mid); }

.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
.btn-outline:hover { background: var(--surface2); }

.btn-danger  { background: #C0392B; color: white; }
.btn-danger:hover { background: #A93226; }
```

### Header
```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  height: 62px;        /* tablet: 56px, mobile: 54px */
}

/* Dark mode */
[data-theme="dark"] .site-header {
  background: rgba(22, 29, 43, 0.97);
}
```

### Footer
```css
footer { background: #0E2E78; color: white; }
[data-theme="dark"] footer { background: #060E18; }
```

### Insider badge
```css
.insider-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  background: #1E8FA1;        /* historische kleur — let op: --ct-member is #007890 */
  color: white;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0 8px 0 0;
  border-radius: 10px;
}
```

> **Discrepantie in mockup:** `.insider-badge` gebruikt hardcoded `#1E8FA1`, terwijl `--ct-member` op `#007890` staat. In productie kiezen we **één** waarde — voorstel: harmoniseer naar `var(--ct-member)` (#007890) zodat de badge consistent is met de rest van het Insider/membership palet.

### Channel pills
```css
.channel-pill {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text);
  backdrop-filter: blur(4px);
  white-space: nowrap;
}
```

### Content-type tags (`.ct-tag`)
```css
.ct-tag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 9px;
  border-radius: 100px;
}
.ct-material { background: var(--ct-material-pale); color: var(--ct-material-dark); }
.ct-article  { background: var(--ct-article-pale);  color: var(--ct-article-dark);  }
.ct-event    { background: var(--ct-event-pale);    color: var(--ct-event-dark);    }
.ct-book     { background: var(--ct-book-pale);     color: var(--ct-book-dark);     }
.ct-brand    { background: var(--ct-brand-pale);    color: var(--ct-brand-dark);    }
.ct-member   { background: var(--ct-member-pale);   color: var(--ct-member-dark); font-weight: 700; }
```

### Form fields
```css
.field-wrap {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  transition: border-color 0.15s;
}
.field-wrap:focus-within { border-color: var(--navy-light); background: var(--surface); }
.field-wrap.filled       { border-color: var(--green-mid);  background: var(--surface); }
.field-wrap.error        { border-color: var(--red);        background: var(--surface); }

.field-wrap input,
.field-wrap textarea,
.field-wrap select {
  width: 100%;
  height: 48px;          /* Variant 2 — voorheen 44px */
  padding: 0 16px;
  border: none;
  background: transparent;
}
```

### Channel bar
```css
/* Sticky onder header */
top: var(--header-height-desktop);   /* 62px op desktop */
z-index: 30;
```

### Compare bar (sticky onderaan)
```css
.compare-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 200;
  background: var(--navy);
  color: white;
  padding: 14px 32px;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
}
```

### Insider modal
```css
.insider-modal {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(13,47,78,0.25);
  max-width: 480px;
}
.insider-modal-top { background: #007890; }   /* gebruikt --ct-member kleur */
```

---

## Z-index schaal

```css
--z-base:     1;
--z-dropdown: 10;
--z-sticky:   30;       /* channel bar */
--z-sticky-footer: 50;  /* progress / multi-step footer */
--z-header:   100;      /* site-header */
--z-overlay:  160;      /* mobile filter drawer */
--z-panel:    200;      /* slide-over panel, compare bar */
--z-modal:    500;      /* insider modal, dialogs */
--z-toast:    1000;
```

---

## Animaties

```css
--transition-fast:   0.12s ease;
--transition-base:   0.15s ease;
--transition-slow:   0.25s ease;
--transition-panel:  0.3s cubic-bezier(0.4, 0, 0.2, 1);   /* slide-over, drawers */
```

---

## Wijzigingen t.o.v. de vorige versie

Voor de volledigheid — dit zijn de afwijkingen van het oude design-tokens document:

| Token | Oud | Nieuw |
|---|---|---|
| `--font-display` | Playfair Display (serif) | **Space Grotesk** (geometrische sans) |
| `--navy` | `#0D2F4E` | `#183E90` |
| `--navy-mid` | `#1A3D5C` | `#0058A0` |
| `--navy-light` | `#1A4B6E` | `#4070B0` |
| `--green-mid` | `#2D8A5F` | `#3A9C38` |
| `--bg` | `#F0F0EE` (warm grey) | `#FFFFFF` (paper-feel `#FBFAF7` als alternatief) |
| `--surface2` | `#F5F5F3` | `#F5F7F8` |
| `--border` | `#E4E4E0` | `#E2E8EF` |
| `--text` | `#1A1A1A` | `#0D1F2D` |
| `--ct-material` | `#5A9E6A` (mid-green) | `#88A800` (olijf) |
| `--ct-article` | `#E8A030` (oker) | `#0058A0` (blauw) |
| `--ct-event` | `#E06060` (rood) | `#007838` (diepgroen) |
| `--ct-book` | `#8A6ABA` (paars) | `#C8BC00` (geel) |
| `--ct-brand` | `#4A8AC0` | `#4070B0` |
| `--ct-member` | `#1E8FA1` | `#007890` |
| `--radius` | 4px | **3px** |
| `--radius-md` | 8px | **4px** |
| `--radius-lg` | 12px | **8px** |
| `--shadow` | dubbele zachte shadow | **none** (hairline only) |
| `--shadow-lg` | zwaarder | `0 2px 14px rgba(0,0,0,0.06)` |
| `.btn` height | 36px | **42px** |
| `.btn-sm` height | 30px | **34px** |
| `.btn-lg` height | 46px | **52px** |
| Section title size | — | **44px** desktop |
| Hero title size | — | **64px** desktop |
| Page title size | — | **48px** desktop |
| Body font-size | 13px | **15px** |
| Header nav | uppercase | **niet uppercase**, letter-spacing `-0.005em` |
| Card hover | `translateY(-2px)` + shadow | **alleen shadow**, geen translate |

> Het document is volledig herschreven op basis van de actieve waarden in de definitieve mockup (`MaterialDistrict_MockUp_DEF.html`). Alle waarden zijn rechtstreeks uit de stylesheet overgenomen.

---

## Wijzigingen — F1.0 (Fase 3, 08-06-2026)

Bijgewerkt n.a.v. de design-keuze in de F1-verkenning. Dit zijn de enige
afwijkingen t.o.v. de tabel hierboven:

| Token | Was | Nu |
|---|---|---|
| `--font-display` | Space Grotesk¹ | **Schibsted Grotesk** |
| `--font-body` | Inter¹ | **Schibsted Grotesk** |
| `--bg` (light) | `#FFFFFF` | **`#FBFAF7`** (paper canvas) |

> ¹ Let op: de productiecode stond op het moment van wijzigen feitelijk op
> **DM Sans + DM Serif Display** (een eerdere stap die nooit in dit doc was
> verwerkt). Dit doc is daarmee twee stappen bijgewerkt en staat nu gelijk aan de
> code. `--surface` blijft `#FFFFFF` — witte tegels op de paper-achtergrond.
> Dark-mode `--bg` (`#0D1117`) ongewijzigd. Token-only wijziging; geen
> layout-herziening (die volgt in F2/F3/F5).

---

## Wijzigingen — F2.1 (Fase 3, catalog-chrome batch 1, 09-06-2026)

Eerste productie-batch van de F2-catalogstyling. Interface-chrome verliest navy
en de per-content-type-kleuren; zwart (`--ink`) is voortaan het enige
chrome-accent. Toegevoegd in `globals.css` als één additief `§F2.1`-blok plus de
tokens hieronder; in `Header.tsx` is de desktop *Sign out* een icoon-knop geworden.

| Token / regel | Was | Nu |
|---|---|---|
| `--ink` (light) | — | **`#16202B`** (nieuw) |
| `--on-ink` (light) | — | **`#FFFFFF`** (nieuw) |
| `--ink` (dark) | — | **`#F0F6FC`** (inverteert) |
| `--on-ink` (dark) | — | **`#0D1117`** |
| Hoofdnav actief | per-content-type-kleur + navy | **`--ink`** (zwart), font-size 14 |
| Header-Dashboard-knop | `--navy` (`.btn-primary`) | **`--ink`** (alleen in `.header-actions`) |
| Header-iconen hover | `--surface2` | **invert naar `--ink`** |
| Paginatie actief | `--navy` | **`--ink`** (beide modi) |
| Breadcrumb `margin-bottom` | 8px | **22px** |
| Desktop *Sign out* | tekstknop (`.btn-outline`) | **icoon-knop** (`.icon-btn`) |

> `.btn-primary` buiten de header blijft navy — alleen de header-Dashboard is
> gescoped naar zwart. Olijf (`--ct-material`) blijft de content-type-accent voor
> materials; het verdwijnt alleen uit de interface-chrome.

---

## Wijzigingen — F2.2 (Fase 3, overzicht-chrome batch 2, 09-06-2026)

Geen nieuwe tokens. De bestaande `--ink`/`--on-ink` (zwart-chrome) en
`--ct-insider` (teal) sturen nu ook de overzicht-chrome. Toegevoegd in
`globals.css` als één additief `§F2.2`-blok; markup-wijziging in
`FilterSidebar.tsx`. Geleverd samen met F2.1 in één zip.

| Regel | Was | Nu |
|---|---|---|
| Channelbar achtergrond | `--surface` (wit) + onderlijn | **`--bg`** (paper), geen lijn |
| Channel actief | navy onderstreping | **`--ink`** zwarte pill (30px) |
| Channel scroll-pijl hover | `--navy` | **invert naar `--ink`** |
| Channelbar-zoekveld | `--surface2` | **`--surface`** (wit) |
| Filterpaneel | wit paneel + navy header | **op paper**, geen box/navy |
| `.filter-count.is-active` | `--navy` | **`--ink`** |
| `.uf-checkbox.checked` | `--navy` | **`--ink`** (+ check `currentColor`) |
| Filter Save-knop | tekst + icoon | **rond icoon**, `--ct-insider` (teal) |
| Filter Clear-knop | "Clear N"-tekst | **ronde prullenbak**, hover-invert `--ink` |
| Overzicht-`h1` (`.t-display-lg`) | zichtbaar groot | **sr-only** (blijft in DOM voor SEO) |
| Overzicht-telling | regel onder de titel | **in de channelbar-zoekbox** |
| Footer | navy (`#0E2E78`), witte tekst | **licht-neutraal** op paper, donkere tekst |

> Telling-in-de-zoekbox geldt voor álle overzichten (materials, brands, events,
> talks, articles). Articles is rechtgetrokken: channelbar toegevoegd (server-side
> theme-filtering), zoekveld uit de header-aside naar de channelbar verhuisd. De
> story-type-filter + CTA's blijven articles' eigen linkerkolom. Footer dark-mode
> ongemoeid.

---

## Wijzigingen — F2.3 (Fase 3, card-systeem + kolomkeuze batch 3, 09-06-2026)

Geen nieuwe tokens. Card-tegels worden compacter; FEATURED gebruikt `--navy`,
duurzaamheids-badges `--green-mid`, de view-toggle-actief `--ink`. Eén additief
`§F2.3`-blok + props op `ContentCard`/`MaterialCard` + nieuwe `ViewToggle`.

| Regel | Was | Nu |
|---|---|---|
| `.content-card-title` | 28px (mobile 22) | **16px** (mobile 15) |
| Card linksboven | altijd content-type Tag | **FEATURED-pill** (`--navy`) of niets op single-type |
| Card linksonder | channel-tags (donker) | **duurzaamheids-badges** wit/`--green-mid`, max 2 + "+N" (materials) |
| Kolommen overzicht | vast 3 (responsief 2/1) | **view-toggle 2/3/4** via `[data-cols]` op desktop |
| View-toggle actief | — | `--ink` / `--on-ink` |

> Kolomkeuze geldt voor alle catalogus-grids (`.ov-grid-3` + `.ov-grid-brands`) en
> wordt onthouden in localStorage. Smalle schermen houden de responsieve val
> (2 dan 1 kolom). Events- en brand-tegels volgen alleen de kolomkeuze; hun
> kaart-inhoud verandert niet.
