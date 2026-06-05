# MANIFEST — S13.3 follow-up (05-06-2026)

Naar aanleiding van Johan's twee correcties. Alleen foutweergave gewijzigd;
geen save-payload- of tier-gate-wijziging. Type-check (`tsc --noEmit`) groen.

## Gewijzigd
- `src/components/dashboard/panels/MaterialForm.tsx`
  handleSave: bij `md_dashboard_forbidden` nu `err?.message` (WP source of truth)
  met korte fallback i.p.v. de vaste Plus+/Partner-tekst. Root-fix van de
  save-bug (lege videos-array → 403) zit WP-zijde (plugin master, 278351f-lijn).
- `src/components/dashboard/panels/BrandProfileForm.tsx`
  Zelfde patroon (consistente forbidden-messaging).

## Root
- `session-log.md` — volledige versie met de S13.3-follow-up-sectie.

## Niet opnieuw geleverd (bewust)
De comment-only-correctie rond filterbaar/niet-filterbaar zit al in main bij
Johan; `material-property-options.ts` / `material-properties.ts` / `types/dashboard.ts`
zijn daarom NIET opnieuw uit deze kant geleverd (geen logica daar gewijzigd).
Monitoring: slug-alignment form-defaults ↔ WP-term-slugs (percentage-buckets).
