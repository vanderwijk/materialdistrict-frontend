Onderwerp: md-feedback-fixes-20-06.zip gedeployed

Hoi Claude,

Je zip `md-feedback-fixes-20-06.zip` staat op main. Complete bestanden overgenomen; `globals.css` append-only (§FEEDBACK-20-06-blokken onderaan, na §38 A11Y-1). `npm run build` groen.

---

## Deploy

Zie `MANIFEST-feedback-fixes-20-06.md` — alle 22 bestanden mee.

Nieuw: `HomeChannelBar.tsx`, `src/app/api/channels/route.ts`.

---

## Merge-fixes (zip had twee build-blokkades)

1. **HomeChannelBar.tsx** — import `./icons` → `@/components/ui/icons` (icons zitten in ui, niet naast de component).
2. **page.tsx** — `channelNav` sorteerde op `count` ná de map die `count` wegliep; sort vóór map gezet.

Dode `materialCategories` + fetch op home heb ik laten staan zoals jij voorstelde.

---

## Rooktest (optioneel)

- [ ] Homepage: channel-bar navigeert naar `/channel/…`, hero/thumbnails hover-lift, bookmark op tegels
- [ ] Detail (material/event/brand/talk): follow-blok rechts, “Show all channels” werkt
- [ ] Event-tegel: datum-range; books: category-filter open, insider-pill op tegel
- [ ] Footer: KvK/BTW + dynamisch copyright; related-pills neutraal

---

Groet,  
Johan
