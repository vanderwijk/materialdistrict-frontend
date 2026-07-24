# Overdracht — mailtak samenvoegen met de datalaag/follow-sessie

*Plak dit bovenaan in de datalaag/follow-sessie. Doel: deze mailtak daarin laten opgaan, zodat er één sessie is. De moedermap + `session-log.md` blijven de bron van waarheid; dit is de brug.*

## Wat deze tak deed
De mailfunctionaliteit ontwerpen bovenop de follow-/datalaag — drie nieuwsbrieven:
1. **Your update** — automatische, persoonlijke digest (uit de follows).
2. **New in [Channel]** — gecureerde noviteiten-mail, channel-gebonden, partner-featurable.
3. **Campagne / beurs** — maatwerk.

## Sluit aan op het fundament (Johan, mails 17-06)
- Follow-endpoints + `mail_frequency` (default `weekly`) draaien al op de hoofd-DB, **los van de analytics-DB** (AWS RDS/Aurora MySQL). De follow-data die de digest nodig heeft, is dus al live.
- De analytics-DB is fase-2-input (gedrag-personalisatie), geen blocker voor een fase-1 follow-gebaseerde digest.

## Besloten in deze tak
- Naam **"Your update"** i.p.v. "digest". Flext met de frequentie.
- **Frequentie:** daily / weekly / monthly; **weekly default** (matcht Johans `md_mail_frequency`); daily = throttle (max 1/dag, alleen als er nieuw is). Vast CET-verzendmoment per tier.
- **Migratie:** bestaande ~80k abonnees op álle channels, default **weekly** (niet daily — firehose/reputatie), met een "je nieuwsbrief is geüpgraded"-mail + manage-knop.
- **Digest-opbouw:** gecapte stroom van items met type- én channel-label; "Your channels"-rijtje bovenin; banner ónder de lead + tussen de content (per flight: verkocht of huis-"stoppertje"); insider-blok automatisch-nieuwste of gepind; footer met manage/unsub + Google-voorkeursbron. Lead = automatisch (geen hero-pin in fase 1).
- **Voorwaarden:** alleen goedgekeurde materialen in de digest; "nieuw" hangt aan een **write-once eerste-goedkeurdatum** (anti-gaming); "nieuw sinds vorige cyclus".
- **"+ N more"** → een persoonlijke **"New in your channels"-listing** (cross-channel, ingelogd; op bestaande FacetWP-infra). Niet een channel-vergaarbak.
- **Eén feed-component, twee gezichten:** mail (push, ijkpunt `last_sent`) + site-bar "nieuw sinds je vorige bezoek" (pull, ijkpunt `last_seen`; model = "sinds datum", niet per-item-ongelezen).
- **New in [Channel]:** materiaalformulier uitbreiden met een **markt-lanceerdatum** (om 15 jaar oude materialen te weren); feature-slot als membership-voordeel.
- **Fasering:** fase 1 = follow-gebaseerd. Gedrag-ranking, sample-CTA's en gerichte betaalde plaatsing = fase 2.

## Open / te beslissen
- **Mailtool: NIET besloten.** Alleen "SES blijft" staat vast. Johan plant nu op "Sendy-op-SES als lead" — die aanname moet bevestigd of gecorrigeerd worden.
- **Send-knoop (de echte gate):** de digest is per ontvanger anders. Assembleren wíj per persoon en versturen via SES (tool = lijst/consent/uitschrijven), óf dwingen we 'm in een lijst-tool? Bepaalt of "snel live" haalbaar is.
- **Consent-wiring + `anonymous_id`-cookie** (frontend) — gate-t de digest (AVG).
- **Frequency-UI** koppelen aan `PATCH /md/v2/follows/mail-frequency` (in het voorkeur-overzicht, één globale knop).
- **Dubbele follow-events** (frontend + plugin loggen beide `channel_followed`) — één bron kiezen; voorstel: server-side.

## Volgende stappen
1. Jeroen lijnt Johan uit: tool is nog **open**.
2. Tool + send-knoop beslissen.
3. Daarna: frontend-taken (frequency-persist, consent/`anonymous_id`, feed-component) + Johans digest-cron/mailtool-spec.

---
**Aan de samengevoegde sessie:** bevestig dat bovenstaande besluiten niet botsen met het fundament (Johans 17-06-status), en ga verder bij "Volgende stappen". Vanaf hier één sessie.
