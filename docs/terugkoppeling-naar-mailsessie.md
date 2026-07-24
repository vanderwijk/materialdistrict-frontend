# Terugkoppeling datasessie → mailsessie (24-07)

> Review van `mailsysteem-spec.md` v2 vanuit de datasessie. Conclusie: in lijn.
> Vier punten die iets veranderen of afronden.

---

## 1. Open punt 13.1 is beantwoord — er is een importgat van 8.148

De vraag was of de actieve abonnees allemaal een WP user-record hebben. Sendy-export tegen de
volledige user-export gelegd (143.342 WP-users vs 147.983 Sendy-rijen):

| Sendy-status | mét WP-record | **zonder WP-record** |
|---|---|---|
| Active | 61.725 | **8.148** |
| Unsubscribed | 33.166 | 3.821 |
| Bounced | 37.607 | 1.820 |
| Marked as spam | 1.496 | 200 |
| | | **13.989 totaal** |

**De 8.148 actieve abonnees zonder WP-record zijn het punt.** Zij ontvangen nu de nieuwsbrief,
maar bestaan alleen in Sendy. Zodra Sendy uitgaat, verdwijnen ze — het nieuwe model kent ze niet.

Er moet dus een importstap in fase 0, vóór het uitfaseren van Sendy: van die 8.148 een WP-user
maken met status `contact` (geen wachtwoord, geen rol, telt niet mee als gebruiker),
`newsletter_consent = ja`, `digest_frequency = weekly`. Bron-tag: sendy-migratie.

De 3.821 unsubscribed zonder record kunnen als `contact` + consent nee — puur zodat de
uitschrijving bewaard blijft en ze nooit per ongeluk opnieuw geïmporteerd worden. De 1.820
bounced en 200 spamklachten zonder record hoeven niet aangemaakt te worden, wél op een
suppressielijst zodat ze niet via een andere bron terugkomen.

**Dit werk ligt nu bij niemand.** Toevoegen aan fase 0.

---

## 2. Beleidswijziging: bij hard bounce suppressen, niet verwijderen

De spec zet `mail_suppressed` óók bij hard bounce (§3.1). In de datasessie zijn bounces juist
*verwijderd* — 38.074 accounts weg. De nieuwe lijn is beter en wordt hierbij de regel.

Reden: bij die verwijderronde moest Johan drie accounts uitzonderen omdat er een
`connected_brand_id` aan hing. Een dood mailadres betekent niet dat de relatie waardeloos is —
iemand kan van baan zijn gewisseld terwijl het account nog aan een brand of aan orders hangt.

**Vanaf nu: hard bounce → `mail_suppressed`, account blijft.** De opschoning van 22-07 is
eenmalig geweest en geen precedent.

---

## 3. Punt 7 (dubbele follow-events) is al afgerond

De spec noemt als actie dat de frontend moet stoppen met `channel_followed` / `brand_followed`
via `/api/events`. Dat is nooit live gegaan: Johan heeft de betreffende frontend-wijziging
(`follows.ts`) bewust niet overgenomen omdat WordPress het al server-side afvuurt in
`rest-follows.php`. Server-side wint, en dat is al de situatie.

Wel live vanuit de frontend: `saved` en `shared` via `DetailActions`. Die bestonden nergens
anders, dus daar is geen dubbeltelling. `material_compared` staat nog niet in de whitelist en
wordt daarom niet afgevuurd.

---

## 4. Servicemail naar de 33.188: BESLUIT — wel versturen, vanaf een apart subdomein

**Besluit Jeroen (24-07): de servicemail gaat door.** Niet schrappen, niet uitstellen tot
onbepaalde tijd. Wel onder strikte condities, zodat het risico beheerst blijft.

Achtergrond van de condities: klachtdrempel is 0,3% over het afzenddomein — op 33.188 mails is
dat ~100 klachten, en een uitgeschreven cohort haalt in de praktijk meer. Daarom niet vanaf het
hoofddomein.

**Condities bij verzending:**

- **Apart subdomein**, los van zowel het transactionele als het marketing-subdomein. Een klap op
  de reputatie raakt dan niet de 61.764 die de mail wél willen, en niet de wachtwoord-resets.
- **Ná de volledige opwarming** van het marketing-subdomein — niet ervoor, niet tegelijk.
- **In batches** van enkele duizenden, met een **harde afbreekdrempel** op het klachtpercentage.
  Loopt het op, dan stopt de rest van de verzending.
- **Eén keer.** Geen reactie = dat is het antwoord. Geen tweede poging.
- **Opt-in, niet opt-out.** Terug op de lijst alleen bij een actieve keuze; stilte betekent
  afgemeld blijven.
- **Nooit naar de 1.496 spamklachten.**
- Tekst vooraf langs een privacyjurist.

**Gevolg voor de validatie:** de 33.188 uitgeschreven adressen worden dus wél gemaild en moeten
dus wél betaald gevalideerd worden. De validatiegroep blijft ~42.000 (uitgeschreven + onbekend),
plus de aanbevolen steekproef uit de actieve groep. Valideren gebeurt vóór verzending, niet erna
— juist bij deze groep, want een bounce bovenop een klacht is dubbel schadelijk.

---

## Ongewijzigd overgenomen

Drie velden + harde volgorde, consent los van frequentie, suppressed blokkeert marketing maar
niet transactioneel, migratietabel, `weekly` als startwaarde, uitschrijven laat account en
follows staan. Geen bezwaren.

Ook goed: mailevents naar dezelfde eventlaag als het sitegedrag, en het onderscheid tussen
event (`digest_frequency_changed`) en stand (`digest_frequency = weekly`).
