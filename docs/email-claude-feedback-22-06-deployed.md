Onderwerp: md-feedback-22-06.zip gedeployed

Hoi Claude,

Je zip `md-feedback-22-06.zip` staat op main (`0d2cb3f`, basis `433bf96`). Alle 21 bestanden overgenomen; `globals.css` append-only (§FEEDBACK-22-06 / -B / -C / -D onderaan). `npm run build` groen na één merge-fix (zie hieronder).

Zie `MANIFEST-feedback-22-06.md` en `session-log.md`.

---

## Wat er live staat (9 punten Jeroen-review)

1. **Channel-bar-label** — "CHANNEL" verticaal uitgelijnd met tabs (homepage `.is-nav`).
2. **Compare op homepage-material-tegels** — `CardCompareButton` + `(home)/layout.tsx` met `CompareProvider` + `CompareBar`.
3. **Get tickets ín event-tegel** — `EventCard` `home`-variant: beeld/tekst → event, tickets-knop apart (geen geneste links).
4. **Follow the Transition** — footer-knop opent full-width slide-up (`FollowTransitionPanel`); Escape / klik-buiten / kruisje sluiten.
5. **Volgblok card + "+N"** — achtergrond `--surface2`; blauwe "Show all"-link → "+N"-bolletje in chip-stijl.
6. **Volgblok op alle detailpagina's** — server-side channels via `getDigestChannels()` (material, brand, event, article, talk).
7. **Insider-kleur acties** — Add to board + Compare: outline standaard, gevuld+wit alleen actief.
8. **Renewable-pil** — kringloop-icoon i.p.v. vinkje op sustainability-pill.
9. **Channeloverzicht → follow-hub** — `ChannelsHub`: hero, sort (Most materials / A–Z), "Channels you follow", rijke kaarten met follow-toggle.

---

## Merge-fix bij deploy

**`article/[slug]/page.tsx`** — in de zip stond `digestChannels = await getDigestChannels()` in `generateMetadata` i.p.v. in de page body. TypeScript faalde op `channels={digestChannels}` in de sidebar. Opgelost: fetch verplaatst naar `Promise.all` in de page component. Verder 1:1 uit de zip.

---

## Jouw kant — vervolg (geen haast, zoals in je mail)

**P9 follow-hub — backend-data later:**

| Feature | Status nu |
|---------|-----------|
| Sort Most materials / A–Z | ✅ frontend |
| Sort Most active / Recently updated | 🔜 plugin/API |
| Gemengde content-thumbnails per channel | 🔜 plugin/API |
| "New this week"-badges/tellingen | 🔜 plugin/API |

**Content (launch):** lege channel-coverafbeeldingen (Recycling, Acoustic, Biodegradable) — redactioneel, geen code-blokkade.

Niets backend-blokkerend voor deze set; alles was frontend.

---

## Rooktest (optioneel)

- [ ] Homepage: CHANNEL-label uitgelijnd; compare op material-tegels + CompareBar; Get tickets in event-tegel (event met `external_website`)
- [ ] Footer: "Follow the Transition" → paneel open/dicht; volgblok met chips + "+N"
- [ ] Detail (material/brand/event/article/talk): volgblok sidebar met chips (niet kaal)
- [ ] Material detail: Add to board + Compare Insider-outline; renewable-pil met kringloop-icoon
- [ ] `/channel`: follow-hub hero, sort, ingelogd = "Channels you follow", follow-toggle per kaart

Groet,  
Johan
