# Featured slots — handmatige UI-test (Partner, test-omgeving)

**URL:** https://materialdistrict-frontend.vercel.app/dashboard/brands/e2e-partner-brand/featured

**Account:** `e2e-dashboard-partner@materialdistrict.com` / `E2eDashboard2026!`

**Backend:** al groen via curl (boeken, quota, validaties, delete, `/auth/me` featured-velden).

**Let op E2E-brand:** er staat nu vaak alleen een **offline** testmateriaal op het merk — dan laadt de pagina wél, maar het boekformulier toont “Publish a material first” tot je een materiaal op **online** zet.

**Bij “Something went wrong”:** meestal faalt de server-side fetch naar WordPress (Vercel `WP_API_URL`, verkeerde deploy, of ontbrekende `/featured-slots` route). Na de resilience-fix zie je een concrete fouttekst i.p.v. de generieke dashboard-error.

---

## Stappen (~5 min)

1. **Open Featured-pagina**  
   Verwacht: paneel “Featured weeks” met “0 of 4 used” (of huidige stand) + reset-datum; daaronder “Booked weeks”.

2. **Boek een week**  
   Materiaal + week → “Book week”.  
   Verwacht: teller x/4, week onder “Booked weeks” als **scheduled**, week niet meer in week-dropdown.

3. **Annuleer**  
   Prullenbak bij scheduled slot.  
   Verwacht: slot weg, teller omlaag, week weer kiesbaar.

4. **Vul alle 4**  
   Verwacht: boekformulier weg; melding “All 4 featured weeks are in use. They reset on …”.

5. **Materiaal-dropdown**  
   Verwacht: alleen online materialen van het merk.

6. **(Optioneel) Huidige week live**  
   Als backend een slot in de lopende week **active** zet: label **live** i.p.v. scheduled.

7. **Fouten**  
   Backend-fouten rood bovenin het paneel; in normale flow alleen geldige weken in dropdown.

---

## Bij afwijking

Noteer: **stapnummer**, **verwacht vs gezien**, eventueel screenshot. Frontend-fix → Claude; API/validatie → plugin.
