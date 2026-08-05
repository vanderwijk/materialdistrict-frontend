# CMS lockdown-theme — `cms.materialdistrict.com`

**Wanneer:** 6 augustus 2026 (morgen na soft-launch / DNS-cutover)  
**Doel:** op het headless CMS geen publieke content meer tonen; editors werken alleen via wp-admin; alle “bekijk op site”-links gaan naar de Vercel-frontend.

## Eisen

1. **Nieuw (of minimal) WordPress-thema** activeren op `cms.materialdistrict.com`.
2. **Geen publieke content** op het CMS-domein:
   - Anonieme / niet-ingelogde bezoekers: alles doorverwijzen naar `https://materialdistrict.com` (zelfde pad of homepage, bewust kiezen).
   - Alleen **editors / admins** (ingelogd met cap om te bewerken) mogen het CMS-front of login zien.
3. **Login blijft bereikbaar** op het CMS (`/wp-login.php`, eventueel `/wp-admin/`) zodat redactie kan inloggen.
4. **wp-admin “View” / permalink-links** moeten naar de **Vercel-site** wijzen, niet naar `cms.materialdistrict.com`:
   - `post` / `page` / CPT sample-permalinks, “View post”, “View material”, enz.
   - Gebruik bij voorkeur `MD_FRONTEND_URL` / `https://materialdistrict.com` als publieke basis-URL (filters op `preview_post_link`, `post_type_link`, `page_link`, `get_sample_permalink`, admin bar “View”, …).
5. **REST / API** voor de Next-frontend moet blijven werken (niet blokkeren met de front-redirects). Typisch: redirects alleen op front-end requests, niet op `/wp-json/*`, cron, of admin-ajax waar nodig.

## Aanpak (voorstel)

- Minimaal thema of mu-plugin: `template_redirect` → 301/302 naar frontend tenzij `is_user_logged_in()` + capability (bijv. `edit_posts`) of `is_admin()` / login.
- Apart: filters die `home_url` / permalinks in admin herschrijven naar de frontend-URL zonder de REST-base te breken (`rest_url` / `siteurl` blijven CMS).
- Na activatie: rooktest login, wp-admin view-link op material/story/brand, anonieme hit op `cms.materialdistrict.com/` → redirect, `GET /wp-json/` blijft 200.

## Referenties

- Livegang-checklist: [`livegang-checklist.md`](./livegang-checklist.md) §0.1 / §3.3
- Frontend production: `https://materialdistrict.com` (Vercel)
- CMS: `https://cms.materialdistrict.com` (DigitalOcean)
