# WordPress-instructies — Featured (materials-slots + featured-boolean per type)

> **Voor:** Johan (WordPress-developer).
> **Status:** versie 1.0 — 03-06-2026. Ter implementatie.
> **Hoort bij:** planningsessie Featured & Channels (03-06). Channels volgt apart
>   ná ons gesprek.
> **Geen PHP-fragmenten** — dit is het contract (wat + shape), niet de implementatie.

---

## 0. Samenvatting

Twee dingen aan WP-kant:

1. **Featured-materiaal** — een Partner-brand boekt zelf max 4 featured-slots per
   membership-jaar, per kalenderweek. De REST-response moet per materiaal aangeven
   of het "featured deze week" is.
2. **`featured`-boolean** op de overige content-types (story/article, book, talk,
   brand) zodat de redactie content kan oormerken. Event heeft dit al.

Alles is additief; niets vervangt bestaande velden.

---

## 1. Featured-materiaal — slot-mechaniek

### 1.1 Regels
- Alleen voor brands op tier `partner`.
- Max **4 slots per membership-jaar**.
- Eén slot = **één kalenderweek**, maandag–zondag.
- Boeken **minimaal 7 dagen vooruit**.
- **Reset op `period_end_date`** (einde lopende membership-jaarperiode), NIET op
  1 januari. De termijn is altijd 12 maanden → geen pro rata.
- Quotum + reset-datum worden **WP-zijde berekend** (principe "WordPress rekent,
  frontend leest af"). De frontend rekent niets zelf.
- [Open, WF-2] Ongebruikte slots: vervallen bij verlenging (aanname) of meeschuiven?
  Jeroen bevestigt; tot dan: vervallen.

### 1.2 Opslag (voorstel — vorm is jouw keuze)
Per geboekte slot minimaal: `material_id`, `week_start` (ISO-datum, maandag),
`status` (`scheduled` | `active` | `done`). Gekoppeld aan de brand zodat het quotum
per brand telbaar is.

### 1.3 REST-exposure
Op de **material**-response:
- `meta.is_featured_now` (boolean) — staat er voor dit materiaal een slot actief in
  de **huidige** week?
- Optioneel `meta.featured_week_start` (ISO-datum) — handig voor debugging/sortering.

Op **brand/membership**-niveau (voor het dashboard-paneel `FeaturedPanel`):
- `featured_slots_total` (= 4), `featured_slots_used`, `featured_slots_reset_date`
  (= `period_end_date`). Zodat het paneel "x/4 gebruikt, reset op &lt;datum&gt;" toont.

### 1.4 Waar de frontend dit gebruikt
- **Homepage-slider:** materialen met `is_featured_now === true`, max 3, nieuwste
  eerst (sortering frontend-zijde).
- **Materiaaltype-categorie:** featured materiaal gepind bovenaan de eigen categorie.
- **Dashboard:** boek/annuleer-UI + de x/4-teller (bestaat al als mock).

---

## 2. `featured`-boolean per content-type

Simpele admin-checkbox + REST-exposure, exact zoals `insider_only` al werkt op
articles. Default `false`.

| Content-type | Veld | Status |
|---|---|---|
| Article/story | `meta.featured` (boolean) + alias `meta._featured` | **nieuw** |
| Book | `meta.featured` | **nieuw** |
| Talk | `meta.featured` | **nieuw** |
| Event | `meta.featured` | **bestaat al — graag bevestigen dat-ie in de response zit** |
| Brand | `meta.featured` | **nieuw, modelniveau** (zie 2.1) |

### 2.1 Brand-featured — let op
De brand-`featured`-boolean voegen we toe voor symmetrie + toekomst, maar de
**logo-carrousel** op de homepage wordt **afgeleid uit `tier === 'partner'`**
(server-side), niet uit deze vlag. De vlag is dus voorlopig ongebruikt; een
admin-UI is niet nodig als dat lastig is — als modelveld + REST-exposure volstaat.

### 2.2 Waar de frontend dit gebruikt
- **Story:** featured-artikel = hoofd-hero op de homepage; geen featured → terugval
  op het nieuwste artikel (frontend-logica).
- **Book / Event:** featured-item in het betreffende homepage-blok.
- **Talk:** vlag wordt nu ontsloten; de homepage-plek volgt later (frontend).

---

## 3. Afvink-checklist

- [ ] Featured-slots: opslag per slot (`material_id`, `week_start`, `status`),
      gekoppeld aan brand, quotum telbaar.
- [ ] Slot-quotum + reset = `period_end_date`, WP-berekend.
- [ ] `meta.is_featured_now` op de material-response.
- [ ] `featured_slots_total` / `featured_slots_used` / `featured_slots_reset_date`
      op de brand/membership-response.
- [ ] `meta.featured` (+ `_featured`-alias) op article, book, talk.
- [ ] Bevestigd: `meta.featured` zit in de event-response.
- [ ] `meta.featured` op brand (modelniveau).

---

## 4. Buiten scope hier
- **Channels / theme-taxonomie** — apart, ná ons gesprek (zie WF-3 in `open-issues.md`).
- **Rollover-regel ongebruikte slots** — wacht op Jeroen (WF-2).
