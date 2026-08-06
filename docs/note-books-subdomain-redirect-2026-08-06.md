# Notitie — books.materialdistrict.com → /book/ redirects

**Datum:** 6 augustus 2026  
**Status:** code + Vercel-domein klaar; **DNS-cutover bij OpenProvider nog open**  
**Eigenaar:** Johan (DNS / OpenProvider)

---

## Kern

De oude WooCommerce-shop op `https://books.materialdistrict.com` (WP Engine, multisite blog 2) wordt uitgeschakeld voor bezoekers. Alle URLs **301**en naar de bookshop op de Vercel-frontend: `https://materialdistrict.com/book/`.

Aanpak: **DNS naar Vercel** + host-based redirects in `next.config.ts` (niet redirects op WP Engine).

---

## Wat is al gedaan (6 aug 2026)

| Stap | Status |
|------|--------|
| Host-based 301s in `next.config.ts` (host `books.materialdistrict.com`) | ✅ |
| Domein `books.materialdistrict.com` toegevoegd aan Vercel-project `materialdistrict-frontend` | ✅ |
| Deploy redirects naar production | via push naar `main` |
| DNS bij OpenProvider wijzigen | ⬜ **jij** |

---

## DNS-cutover (OpenProvider) — te doen

**Nu:** `books.materialdistrict.com` → CNAME `wp.wpenginepowered.com` (WP Engine).

**Gewenst (Vercel):**

| Type | Naam / host | Waarde |
|------|-------------|--------|
| **A** (aanbevolen door Vercel) | `books` | `76.76.21.21` |

Alternatief: CNAME `books` → `cname.vercel-dns.com` (ook gangbaar voor subdomeinen).

**Stappen:**

1. Zorg dat de `next.config`-redirects live staan op production (deploy van deze wijziging).
2. In OpenProvider DNS voor `materialdistrict.com`:
   - Verwijder of wijzig de bestaande CNAME `books` → `wp.wpenginepowered.com`
   - Zet **A** `books` → `76.76.21.21` (of CNAME zoals hierboven)
3. Wacht op DNS-propagatie (TTL; vaak minuten tot een uur).
4. Vercel verifieert het domein automatisch (e-mail bij completion).
5. Rooktest (zie hieronder).

**Rollback:** A/CNAME weer terug naar `wp.wpenginepowered.com` → oude shop live. WP Engine books-site **niet** verwijderen tot redirects ≥6–12 maanden stabiel zijn.

---

## Redirect-regels

Host: `books.materialdistrict.com` → destinations op `https://materialdistrict.com`.

| Source | Destination |
|--------|-------------|
| `/product/:slug` | `/book/:slug` |
| `/product-category/*`, `/shop`, `/cart`, `/checkout`, `/my-account`, `/`, catch-all | `/book/` |

**Slug-remaps (vóór generieke product-regel):**

| Oud (books.*) | Nieuw |
|---------------|-------|
| `mx2014-exhibition-catalogue` | `/book/mx2014-show-catalogue` |
| `mx2015-exhibition-catalogue` | `/book/mx2015-show-catalogue` |
| `mx2016-exhibition-catalogue` | `/book/mx2016-show-catalogue` |
| `mx2017-exhibition-catalogue` | `/book/mx2017-show-catalogue` |
| `material-revolution-2` | `/book/material-revolution-ii` |
| `tomorrows-timber-booming-bamboo` | `/book/` (bundel, geen 1:1) |

`booming-bamboo` heeft geen remap nodig (`/book/booming-bamboo/` bestaat).

---

## Rooktest (na DNS)

```bash
# Moet Location: https://materialdistrict.com/book/...
curl -sI https://books.materialdistrict.com/ | head -5
curl -sI https://books.materialdistrict.com/product/the-timber-truth/ | head -5
curl -sI https://books.materialdistrict.com/product/mx2014-exhibition-catalogue/ | head -5
curl -sI https://books.materialdistrict.com/cart/ | head -5
curl -sI https://books.materialdistrict.com/product-category/books/ | head -5
```

Verwacht: **HTTP 301** (of 308) naar `materialdistrict.com/book/…`.

---

## Referenties

- Redirects: `next.config.ts` § 0b
- Migratieplan: [`woocommerce-migration-plan.md`](./woocommerce-migration-plan.md) Phase 6 stap 7
- Live shop: [`https://materialdistrict.com/book/`](https://materialdistrict.com/book/)
- Oude shop (tot DNS-cutover): [`https://books.materialdistrict.com/`](https://books.materialdistrict.com/)
