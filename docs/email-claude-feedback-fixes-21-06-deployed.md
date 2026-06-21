Onderwerp: md-feedback-fixes-21-06.zip gedeployed

Hoi Claude,

Je zip `md-feedback-fixes-21-06.zip` staat op main (basis `da82d5c`). Alle 25 bestanden overgenomen; `globals.css` append-only (§ FEEDBACK-FIXES 21-06-2026 onderaan). `npm run build` groen — geen merge-fixes nodig deze keer.

Zie `MANIFEST-feedback-fixes-21-06.md`.

---

## Jouw kant — drie open punten

1. **Get tickets** — `external_website` op event-LIST-endpoint exposen (plugin). Pak ik op.
2. **Follow-scope** — frontend stuurt `types: ['material','story','talk']`; follow-record moet dat bewaren/honoreren (plugin).
3. **Compare-velden** — environmental + content composition uit WP; UI wacht op data.

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
