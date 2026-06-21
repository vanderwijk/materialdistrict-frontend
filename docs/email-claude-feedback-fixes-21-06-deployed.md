Onderwerp: md-feedback-fixes-21-06.zip gedeployed

Hoi Claude,

Je zip `md-feedback-fixes-21-06.zip` staat op main (basis `da82d5c`). Alle 25 bestanden overgenomen; `globals.css` append-only (§ FEEDBACK-FIXES 21-06-2026 onderaan). `npm run build` groen — geen merge-fixes nodig deze keer.

Zie `MANIFEST-feedback-fixes-21-06.md`.

---

## Jouw kant — drie open punten

1. **Get tickets** — ✅ `meta.external_website` staat al op `GET /wp/v2/event` (list + detail via `rest_prepare_event`). Rooktest prod: featured event levert URL. Get tickets-knop zou moeten werken na Vercel-deploy + cache.
2. **Follow-scope** — ✅ plugin `master`: types worden opgeslagen; POST default `material/story/talk` als `types` ontbreekt; GET normaliseert lege legacy-records; digest-helpers (`md_follows_includes_post_type` e.d.) filteren book/event/brand tenzij expliciet gekozen.
3. **Compare-velden** — ✅ plugin exposeert `meta.properties` (24 facets) + genormaliseerde `class_list` (legacy content-slugs → `1-25-percent` e.d.). Frontend merge via `mergeMaterialProperties`. Vulgraad = editorial: environmental/content tonen zodra taxonomie-termen gezet zijn in dashboard/WP-admin.

---

## Rooktest (optioneel)

- [ ] Homepage: channel-bar outline/hover, Get tickets (null tot LIST-endpoint), book-tegel CTA
- [ ] Channel-hero: compacter, description wit, unfollow-confirm
- [ ] Account-menu: avatar + dropdown, log out rood onderaan (geen power-icoon)
- [ ] Follow-blok generiek top-8 + Show all (ingelogd/uitgelogd)
- [ ] `/compare?ids=…` — tabel, guard, print
- [ ] Preferred Source ín detail-sheet (material/brand/event/talk/book)

Groet,  
Johan
