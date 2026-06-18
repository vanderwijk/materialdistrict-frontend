# MANIFEST — Dashboard review-ronde 2 (18-06-2026, herijkt)

Herijkt op de actuele main (HEAD `4c5465e`, na Johans homepage-ronde-3, visuele
ronde en follow-hydration deploys). Eén zip, complete bestanden in moedermap-
structuur.

## Conflict-check uitgevoerd

Van de 9 gewijzigde bestanden overlapt alleen **globals.css** en **session-log.md**
met Johans nieuwe commits. De 7 dashboard-componenten waren in de nieuwe main
byte-identiek aan mijn base (Johan raakte ze niet aan) → veilige drop-ins.
globals.css en session-log zijn opnieuw opgebouwd bovenop de nieuwe main, zodat
Johans nieuwe werk intact blijft:
- globals.css: Johans blokken (§VISUAL-ROUND-18-06, §CHANNEL-PILL-FOLLOW,
  S10.2 ronde-3, follow-switch/-digest) staan er nog; §DASH-REVIEW-4 staat
  daar áchter.
- session-log.md: Johans entries (visuele ronde, ronde-3, follow-hydration)
  staan er nog; mijn ronde-2 entry is toegevoegd.

## Gewijzigde bestanden

| Bestand | Wat |
|---|---|
| `src/components/dashboard/DashboardShell.tsx` | `.dash-shell` > lege `#dash-header-band` + normaal grid. `display:contents` eruit. |
| `src/components/dashboard/DashboardPageHeader.tsx` | Client-component; portalt de `<h1>` via `createPortal` in de band. |
| `src/components/dashboard/DashboardSidebar.tsx` | `.sb-footer` (Back to homepage + Sign out) + imports verwijderd. |
| `src/components/ui/BrandTierGate.tsx` | Herbouwd naar de demo (kaal hangslot, "{feature} requires {tier}", overlay over hele kaart, zwarte Upgrade-knop). |
| `src/components/dashboard/panels/BrandProfileForm.tsx` | 5 gated secties: gate wikkelt nu de hele sectie (titel + velden). |
| `src/components/dashboard/panels/MaterialForm.tsx` | 4 gated secties, idem. |
| `src/components/dashboard/panels/ProfileForm.tsx` | Bedrijfsnaam + btw verplicht bij "Invoice to a company". |
| `src/styles/globals.css` | §3B herschreven (veldritme), §3E (Add brand), §3G herschreven (band), §3H ingetrokken (footer), §DASH-REVIEW-4 nieuw (gate) — toegevoegd ná Johans blokken. |
| `session-log.md` | Ronde-2 entry toegevoegd (Johans entries intact). |

## Verificatie

- `globals.css` brace-balans: 2970/2970.
- `diff` tegen de NIEUWE main (4c5465e): alleen §3B/§3E/§3G/§3H + nieuw §4;
  Johans 19 nieuwe markers nog aanwezig.
- Alle 7 gewijzigde TSX-bestanden gevalideerd met esbuild (transform OK).

## Eén bewuste afwijking van de demo

De Upgrade-knop in de gates is **zwart** (`--ink`), niet de blauwe MF_TIERS-kleur
uit de demo — groen/kleur blijft voorbehouden aan de enige primaire actie per
pagina (Save changes). Alles eromheen volgt de demo 1-op-1.

## Aandachtspunt backend (Johan)

De personal-profile-save (`POST /api/dashboard/profile`) zou bedrijfsnaam + btw
óók server-side moeten afdwingen wanneer "Invoice to a company" aanstaat.
