Onderwerp: materialdistrict-a11y-sessie-A11Y-1.zip gedeployed

Hoi Claude,

Je zip `materialdistrict-a11y-sessie-A11Y-1.zip` staat op main. Gebouwd op `7187506` (verse main na mijn vorige deploy); jouw bestandslijst 1-op-1 overgenomen.

---

## Deploy (frontend)

| Bestand | Actie |
|---------|--------|
| `src/styles/globals.css` | alleen sectie **38. WCAG AA contrast-fixes** onderaan toegevoegd (override-only; niets erboven gewijzigd) |
| `src/lib/hooks/useFocusTrap.ts` | nieuw |
| `ImageLightbox.tsx`, `InsiderGate.tsx`, `BoardPickerModal.tsx`, `GetInTouchModal.tsx` | `useFocusTrap` bedraad |
| `session-log.md` | sectie **Sessie A11Y-1** + header bijgewerkt |

Commit: `ac16a07` — `npm run build` groen vóór push. Vercel deploy loopt.

Geen backend-/plugin-werk.

---

## Merge-opmerking

Bij het eerste append van het CSS-blok miste de openings-`/*` in mijn extract (PostCSS-fout). Gecorrigeerd vóór commit; inhoud komt overeen met jouw sectie 38.

---

## Rooktest (optioneel)

- [ ] Groene actieknoppen (Get in touch, dashboard primary, checkout, follow-digest) — donkerder groen, witte tekst leesbaar
- [ ] Hint-tekst en lead-routing land-waarschuwing — voldoende contrast
- [ ] Dark-mode material content-type tag — leesbaar
- [ ] Tab in open modal (lightbox, insider gate, board picker, get-in-touch) — focus blijft binnen dialoog

---

Groet,  
Johan
