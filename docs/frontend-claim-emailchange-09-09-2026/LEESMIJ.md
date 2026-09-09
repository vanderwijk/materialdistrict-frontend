# Frontend — claim en e-mailwijziging

Levering 09-09-2026, bij de backend die Johan vandaag live heeft gezet.

## Wat erin zit

| bestand | wat het is |
|---|---|
| `src/app/claim-account/page.tsx` + `ClaimAccountForm.tsx` | een contact activeert zijn account |
| `src/app/confirm-email-change/page.tsx` + `ConfirmEmailChangeView.tsx` | bevestiging van een nieuw adres |
| `src/components/dashboard/panels/EmailChangeField.tsx` | het e-mailveld in het profiel |
| `ProfileForm-wijziging.md` | de twee regels die in `ProfileForm.tsx` veranderen |

## Wat er nog niet in zit, en waarom

De vier proxyroutes onder `src/app/api/`:

```
src/app/api/auth/claim/check/route.ts
src/app/api/auth/claim/complete/route.ts
src/app/api/dashboard/email-change/start/route.ts
src/app/api/dashboard/email-change/check/route.ts
src/app/api/dashboard/email-change/complete/route.ts
src/app/api/dashboard/email-change/cancel/route.ts
```

Die roepen WordPress aan, en daarvoor gebruiken de bestaande routes twee helpers die niet
in de bron-zip zaten: `wpDashboardFetch` en `DashboardApiError` uit `@/lib/api/dashboard`,
en het anonieme patroon uit `@/lib/api/wordpress` (waar `confirmEmail` in zit).

Ik weet niet welke argumenten die functies precies aannemen en of `wpDashboardFetch` zonder
bearer gebruikt kan worden — de claim- en bevestigingsroutes zijn anoniem, want de link
wordt geopend vanuit een mailbox en vaak op een ander apparaat dan waar de sessie zit.

Ik kan dat raden, maar dat is precies wat er deze week twee keer is misgegaan. Stuur die
twee bestanden en de zes routes volgen dezelfde dag.

## Twee ontwerpkeuzes die opvallen

**De claimpagina consumeert niets bij het laden.** `/confirm-email` doet dat wel, en dat mag
daar: het ergste wat een mailscanner kan aanrichten is een account activeren dat de persoon
zelf heeft aangevraagd. Bij een claim ligt dat anders — het token wordt pas ingewisseld als
het formulier wordt verstuurd, dus een scanner die de link volgt kan hem niet verbranden.

**De bevestiging van een e-mailwijziging zit achter een knop.** Om dezelfde reden, maar
sterker: dat token kan een account naar een ander adres verplaatsen. Het nieuwe adres wordt
eerst getoond, zodat iemand die dit niet heeft aangevraagd ziet waar zijn account heen zou
gaan en de pagina kan sluiten.

## Wat het e-mailveld doet

Het veld is alleen-lezen en het adres gaat niet meer mee in het opslaan van het profiel.
Wijzigen is een eigen stroom: nieuw adres invullen, wij sturen daar een link heen, en het
account blijft het huidige adres houden tot erop geklikt is. Loopt er een wijziging, dan
staat dat er gemaskeerd bij — `j***@example.com` — met een knop om hem in te trekken.
