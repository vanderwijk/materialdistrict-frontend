# Mailvoorkeur — datamodel (input voor de mailautomation-sessie)

> Vastgesteld in de data-sessie van 21/22-07-2026. Dit is de bron van waarheid voor
> wie welke mail mag en wil ontvangen. De mailengine leest deze velden, bepaalt ze niet.

---

## Uitgangspunt

**De mailvoorkeur leeft op het user-record, niet in de mailtool.** Sendy (of welke verzender
dan ook) is een verzendpijp die de voorkeur uitleest. Zou de voorkeur in Sendy leven, dan is
Sendy de bron van waarheid — dat willen we niet.

Dit vervangt de huidige versnippering: nieuwsbriefstatus in Sendy + een `newsletter`-veld in
WP + `mail_suppressed`.

---

## Drie velden

| Veld | Wat het is | Waarden | Wie zet het |
|---|---|---|---|
| `mail_suppressed` | hard blok na spamklacht | true/false | wij (bestaat al) |
| `newsletter_consent` | mág je mailen | ja/nee + datum + bron | de persoon zelf |
| `digest_frequency` | hoe vaak | daily / weekly / monthly / none | de persoon zelf |

**Volgorde is hard:** `mail_suppressed` wint altijd → dan `newsletter_consent` → dan pas
`digest_frequency`. Staat consent op nee, dan gaat er niets uit, ongeacht de frequentie.

---

## Twee regels die je niet mag samenvouwen

**1. Consent ≠ frequentie.** Consent is juridisch (mag ik), frequentie is een instelling
(hoe vaak). Wie van wekelijks naar maandelijks gaat, trekt geen toestemming in. Op één veld
samengevoegd lees je een frequentiewijziging aan als uitschrijving.

**2. Suppressed blokkeert marketing, niet transactioneel.** Wachtwoord-reset,
orderbevestiging en andere accountmail blijven werken. Anders sluit je mensen buiten van hun
eigen account.

---

## Wat de digest-engine leest

Een gebruiker krijgt een digest als:

```
mail_suppressed  = false
newsletter_consent = ja
digest_frequency ≠ none
+ de channels die hij volgt (bestaand follow-systeem)
```

- **Inhoud** komt uit de follows.
- **Timing** komt uit de frequentie.
- Een gebruiker zonder follows krijgt geen lege digest.

---

## Migratie van de huidige Sendy-status

| Sendy-status | Aantal | Nieuw op het record |
|---|---|---|
| `Active` | 61.764 | consent = ja · frequentie = **weekly** (startwaarde) |
| `Unsubscribed` | 33.188 | consent = nee · **account + follows blijven staan** |
| `Marked as spam` | 1.496 | `mail_suppressed = true` (al gezet door Johan) |
| `Bounced` | 37.635 | al verwijderd uit de database |
| niet in Sendy | 9.366 | consent = nee — onbekend is geen toestemming |

**Startwaarde `weekly`** voor de bestaande abonnees: niemand heeft ooit een frequentie
gekozen, en weekly ligt het dichtst bij de huidige nieuwsbriefcadans. In de eerste mailing
krijgen ze de keuze aangeboden.

---

## Uitschrijven ≠ account kwijt

Uitschrijven van de nieuwsbrief zet `newsletter_consent` op nee. Het account, de follows en
de opgeslagen materialen blijven bestaan. Dat zijn twee losse keuzes van de gebruiker en
moeten los blijven in de database.

---

## Frequentiewijziging is een event

`digest_frequency_changed` hoort in dezelfde eventlaag als `saved` / `shared` /
`channel_followed`. Van wekelijks naar maandelijks is een afkoelsignaal; naar dagelijks een
opwarmsignaal. Een van de weinige momenten waarop een gebruiker expliciet zegt hoe betrokken
hij is.

---

## Openstaand

- De ~42.000 adressen die nog betaald gevalideerd moeten worden (uitgeschreven + onbekend) —
  doen vóór de eerste verzending, niet erna.

## Besluit — servicemail naar de 33.188 uitschrijvers

**Gaat door** (besluit Jeroen, 24-07). Eenmalig servicebericht met een échte keuze: opt-in,
"blijf afgemeld" even prominent, één keer, nooit naar de spamklachten. Tekst vooraf langs een
privacyjurist.

**Verzending vanaf een apart subdomein**, na de opwarming van het marketing-subdomein, in
batches met een harde afbreekdrempel op het klachtpercentage. Reden: deze groep klikt eerder op
"spam" dan op "afmelden", en dat mag de bezorging voor de 61.764 actieve abonnees niet raken.

Deze adressen worden dus wél gemaild en moeten dus wél gevalideerd worden — ze blijven
onderdeel van de ~42.000.
