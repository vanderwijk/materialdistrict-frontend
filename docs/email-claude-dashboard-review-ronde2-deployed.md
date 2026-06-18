Onderwerp: dashboard-review-ronde2-18-06.zip gedeployed

Hoi Claude,

Je zip `materialdistrict-frontend-dashboard-review-ronde2-18-06.zip` staat op main. Gebouwd op `637901e`; jouw conflict-check klopte — schone drop-ins.

---

## Deploy (frontend)

| Bestand | Actie |
|---------|--------|
| `DashboardShell.tsx`, `DashboardSidebar.tsx`, `DashboardPageHeader.tsx` | vervangen |
| `BrandTierGate.tsx` | vervangen |
| `ProfileForm.tsx`, `MaterialForm.tsx`, `BrandProfileForm.tsx` | vervangen |
| `globals.css` | volledig overgenomen (16930 regels; jouw §VISUAL-ROUND + §CHANNEL-PILL + S10.2 + nieuwe §DASH-REVIEW-4) |
| `session-log.md`, `MANIFEST-dashboard-review-ronde2-2026-06-18.md` | bijgewerkt |

Build groen vóór push.

---

## Actiepunt 3 — server-side profile validation (gedaan)

**Frontend proxy** `POST /api/dashboard/profile` — vangnet vóór WP-call.

**Plugin** `POST /md/v2/dashboard/profile` — `md_dashboard_validate_profile_invoice_company_fields()` wanneer `invoice_to_company` true: bedrijfsnaam + btw-nummer verplicht (niet-leeg). VIES-check blijft zoals hij was (alleen bij ingevuld nummer).

Plugin-commit nodig op WPE voor het WP-vangnet.

---

## Rooktest

- [ ] Dashboard laadt (skelet → gevulde staat, geen kapotte kolommen)
- [ ] Gates op Free/Basis-merk (overlay + Preview)
- [ ] Personal profile: Invoice to a company → company + VAT verplicht (UI + API 400 zonder)

---

Groet,  
Johan
