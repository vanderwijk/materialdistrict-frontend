# CMS lockdown-theme — `cms.materialdistrict.com`

**Wanneer:** 6 augustus 2026  
**Status:** live (variant A: same-path 301)  
**Doel:** op het headless CMS geen publieke content meer tonen; editors werken via wp-admin; “bekijk op site”-links gaan naar de Vercel-frontend.

## Live

| Item | Waarde |
|------|--------|
| Theme | `materialdistrict-cms-theme` **v2 block theme** (actief; Schibsted Grotesk in editor) |
| Repo | https://github.com/vanderwijk/materialdistrict-cms-theme |
| Plugin | `includes/md-cms-frontend-links.php` + `md_frontend_permalink_for_post()` |
| Redirect | 301 `https://materialdistrict.com{path}` |
| Homepage `/` | Editor gateway (login / dashboard) |
| Rollback | Theme terug naar `materialdistrict-theme` |

## Gedrag

1. **Anoniem content-URL** → 301 naar frontend (zelfde pad + query).
2. **Homepage** → minimale gateway (geen materials-grid); `noindex`.
3. **Allowlist (geen redirect):** `/wp-json/*`, `/wp-admin`, `/wp-login.php`, `admin-ajax.php` / `admin-post.php`, `wp-cron.php`, `/?wc-ajax=*`, `/wp-content/uploads/`.
4. **`/xmlrpc.php`** → 403.
5. **wp-admin View / permalinks** → `MD_FRONTEND_URL` (plugin-filters; REST `link` blijft CMS).
6. **`siteurl` / `home` / `rest_url`** blijven CMS — geen blanket `home_url`-rewrite.
7. **Cross-host redirect:** `allowed_redirect_hosts` bevat `materialdistrict.com` (anders valt `wp_safe_redirect` terug op `/wp-admin/`).

## Bekende beperking — draft preview

**“Preview in new tab” werkt niet voor drafts** (en is geen snelle fix).

Oorzaak: de publieke site is headless (Next.js). Drafts staan niet in de anonieme REST API. Preview stuurde eerder naar `materialdistrict.com/…` of `?p=&preview=` → homepage/404. Een echte draft-preview vraagt om een apart preview-systeem (auth token / draft endpoint / Next preview route) — bewust niet gebouwd.

**Werkwijze voor redactie:** opmaak en typografie beoordelen in de **block editor** (CMS block theme = Schibsted Grotesk + brand tokens). Live check na publicatie op materialdistrict.com.

## Rooktest (6 aug 2026)

| Test | Resultaat |
|------|-----------|
| `GET /` | 200 gateway + `X-Robots-Tag: noindex` |
| `GET /material/rivets/` | 301 → `https://materialdistrict.com/material/rivets/` |
| `GET /wp-json/` | 200 |
| `GET /wp-json/wc/store/v1/cart` | 200 |
| `GET /wp-login.php` | 200 |
| `POST /xmlrpc.php` | 403 |
| Upload-bestand | 200 |
| `/?wc-ajax=get_refreshed_fragments` | 200 |

## Referenties

- Plan: [`plan-cms-lockdown-theme-2026-08-06.md`](./plan-cms-lockdown-theme-2026-08-06.md)
- Frontend: `https://materialdistrict.com` (Vercel)
- CMS: `https://cms.materialdistrict.com` (DigitalOcean)
