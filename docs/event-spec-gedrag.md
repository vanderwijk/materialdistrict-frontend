# Event-spec — gedrag loggen

> Wat er gelogd wordt, welk event waar landt, en wat nog open staat.
> Frontend-aansluitingen door Claude; backend-registratie door Johan.
> Bijgewerkt 21-07-2026 op basis van Johans whitelist-bevestiging.
> Geïntegreerd in de frontend-repo met één correctie (follows — zie hieronder).

---

## Principe

Eén platte eventvorm voor alles: `wie · wat (event_type) · welk object · wanneer · bron`.
Online en offline delen dezelfde tabel. Nieuw type in de toekomst = nieuwe rij, geen verbouwing.
Filter voor opname: *kan iemand er iets mee?* Zo nee, niet loggen.

---

## Groep 1 — lichte interacties (frontend → `/md/v2/events` → RDS)

| Event | object_type | Waar afgevuurd | Status |
|---|---|---|---|
| `saved` | material (of type) | `DetailActions.handleSave` — alleen bij toevoegen | ✅ aangesloten |
| `shared` | material (of type) | `DetailActions.handleShare` | ✅ aangesloten |
| `channel_followed` / `brand_followed` | channel / brand | WP `POST/DELETE /md/v2/follows` (server-side) | ✅ al live backend |
| `material_compared` | material | (nog niet) | ⏳ wacht op whitelist |

Notities:
- `saved` vuurt **alleen bij het toevoegen**, niet bij het weghalen. Het event registreert de
  bewaar-actie, niet elke toggle.
- `shared` vuurt bij de share-actie (native share of clipboard-fallback).
- **Follows:** bewust **niet** via frontend-`logEvent`. WordPress vuurt al
  `channel_followed` / `brand_followed` (en unfollow-varianten) in `rest-follows.php`
  ná een geslaagde upsert/delete. Een tweede frontend-call zou dubbeltellen.
- Save/share via de bestaande `logEvent`-helper — anoniem-veilig (md_aid-cookie), best-effort,
  `keepalive`. Raakt de UI nooit.

---

## Groep 2 — contactformulier (backend, al live)

Het Get-in-touch-formulier maakt een lead én vuurt server-side het analytics-event af. **De
frontend doet hier niets** — een extra `logEvent` zou dubbeltellen.

Canoniek contract (Johan, live in `md_lead_process_get_in_touch`):

```
event_type: info_request_sent
object_type: material (of brand als er geen material is)
object_id:  material_id / brand_id
source:     get-in-touch
attributes: { options: ["call_back","catalogue",...], brand_id, lead_id }
```

- Eén event per submit; alle gekozen opties in `attributes.options`.
- Onderscheid tussen "wil gebeld worden" en "wil catalogus" zit in `options`, niet in een apart
  subtype-veld.
- Lead blijft in WordPress (CRM); event gaat naar RDS. Best-effort: mislukt het event, dan blijft
  de lead staan.

---

## Groep 3 — stille signalen (nog niet gebouwd)

Waardevol, lagere prioriteit dan groep 1/4. Elk is een event zodra het aangesloten wordt:
`profile_viewed`, `search_no_result`, `abandoned_request`, `unfollow` / `unsave`,
herhaalbezoek zelfde brand. Niet-backfillbaar, dus wel snel op de rol zetten.

---

## Groep 4 — conversies (ONTBREEKT, cruciaal)

Zonder deze events kun je gedrag niet aan uitkomst koppelen — dan blijft de data beschrijvend
in plaats van voorspellend. Deze horen server-side, op het moment dat de status verandert:

| Event | Wanneer | Waarom |
|---|---|---|
| `member_started` | brand wordt betalend lid | conversie-ijkpunt |
| `insider_started` | user wordt Insider | conversie-ijkpunt |
| `tier_upgraded` | Member → Member Plus etc. | expansie |
| `membership_cancelled` / `_expired` | lid stopt/verloopt | **churn-signaal** |

Actie Johan: deze vier afvuren op de Stripe-webhook / status-wissel, met object = brand of user.

---

## Groep 5 — bewust NIET loggen

Modal geopend zonder keuze · scroll-diepte · muisbeweging. Zakken op de "kan iemand er iets
mee?"-test. Ruis die het datamodel vervuilt.

---

## Openstaand voor Johan

1. **`material_compared`** — toevoegen aan de whitelist (PHP + AWS-ingest) als we compare willen
   loggen. Zodra het erin zit, sluit Claude de frontend-kant aan (`CardCompareButton` /
   `CompareBar`). Nu bewust niet afgevuurd om geweigerde events te vermijden.
2. **Groep 4 (conversies)** — de vier status-events op de Stripe-webhook. Grootste inhoudelijke gat.
3. **Groep 3 (stille signalen)** — later, maar niet-backfillbaar: hoe eerder hoe beter.
