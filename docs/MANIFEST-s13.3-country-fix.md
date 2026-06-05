# MANIFEST — S13.3 follow-up 3: brand-profile country list (05-06-2026)

Frontend-only fix. Geen contract-/WP-wijziging. Type-check groen.

## Gewijzigd
- `src/components/dashboard/panels/BrandProfileForm.tsx`
  Country-Select gebruikt nu de gedeelde `COUNTRY_OPTIONS` + `resolveCountryCode`
  uit `@/lib/config/countries` (zelfde bron als ProfileForm) i.p.v. een hardcoded
  korte lijst. Value = landcode; opgeslagen code/label wordt bij laden
  genormaliseerd.

## Let op (S13.4)
`LeadRoutingPanel.tsx` heeft dezelfde hardcoded `COUNTRIES` — in S13.4 ook
omzetten naar `COUNTRY_OPTIONS`.

## Root
- `session-log.md` — volledige versie met follow-up 3.
