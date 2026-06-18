Onderwerp: inlog-onboarding-finetuning zip gedeployed + backend-status 7–11

Hoi Claude,

Je zip `inlog-onboarding-finetuning-18-06-2026-rebased.zip` staat op main (`5abf7e5`). Build groen.

---

## Deploy (volgens je instructies)

| Actie | Status |
|-------|--------|
| `become-a-partner/page.tsx` | vervangen (need-led v9) |
| `register/page.tsx` + `RegisterForm.tsx` | vervangen |
| `sign-in/page.tsx` + `SignInForm.tsx` | vervangen |
| `_auth-components/SocialAuthButtons.tsx` | **nieuw** |
| `Footer.tsx`, `PromoHero.tsx`, `InsiderGate.tsx`, `DownloadsCard.tsx`, `CheckoutSignInPanel.tsx` | vervangen |
| `PartnerCta.tsx` + lege `_components/`-map | verwijderd |
| `session-log.md` | bijgewerkt |
| `globals.css` | append-only: `§BECOME-A-PARTNER-REFINE` + `§AUTH-SOCIAL-ACCOUNTTYPE` toegevoegd; `§DASH-REVIEW-3M` verwijderd (jouw refine-blok vervangt die pagina) |

Geen wholesale replace van `globals.css` — alleen de twee nieuwe blokken onderaan + verwijdering van `§DASH-REVIEW-3M`.

---

## Kleine fixes naast je zip

**Register-flow.** Je formulier maakt voornaam/achternaam optioneel (alleen e-mail + wachtwoord verplicht), maar onze register-proxy en WP-endpoint vereisten nog beide namen. Dat zou registratie breken.

- Frontend: `/api/auth/register` + `registerUser()` — namen optioneel; `profession` + `organisation` worden doorgestuurd
- Plugin (`fc7812d`): `POST /md/v2/auth/register` accepteert optionele namen (fallback: lokaal deel van e-mail), slaat `profession` → usermeta `profession` en `organisation` → `company` op

Plugin moet nog op WPE staan voor de register-fix op productie.

---

## Backend-acties 7–11

| # | Taak | Status |
|---|------|--------|
| **7** | OAuth Google/LinkedIn | **Nog niet.** Social-knoppen wijzen naar `/api/auth/oauth/{provider}` — die routes bestaan nog niet. Vereist OAuth-apps, callback-flow, WP-user match/create op geverifieerd e-mail, zelfde JWT-cookie. UI staat klaar. |
| **8** | `account_type` persistent | **Klaar.** WP slaat `specifier`/`manufacturer` op bij register; manufacturer krijgt draft brand. Frontend stuurt keuze mee (query-param + account-type cards). |
| **9** | `profession` + `organisation` | **Klaar** (zie register-fix hierboven). |
| **10** | request-new → direct brand aanmaken | **Nog pending-flow.** Nu: SES-mail naar `info@`. Nog te bouwen: brand CPT + slug-dedup + koppelen aan user. |
| **11** | SES welkomstmails (merk vs. bezoeker) | **Infra klaar** (`md_ses_send_simple_email`), templates/hook nog niet. Wacht op jouw copy. |

Voorgestelde volgorde: 10 → 11 → 7.

Laat weten wanneer je de welkomstmail-copy hebt, dan pak ik 10+11 op. OAuth (7) kan parallel zodra we de provider-credentials hebben.

---

## Overige context

- Analytics/migratie-WP-CLI is intussen uit de plugin gehaald (`912598a`) — rollups lopen real-time in de DB Lambda op RDS.
- `InsiderGate`: jouw "Login"-label + mijn `isLoggedIn`-guard zijn beide live.

Groet,  
Johan
