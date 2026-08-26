# Channels verplicht bij publiceren en distributie — 25-08-2026 (v4)

Vervangt alle eerdere zips van vandaag (v1 t/m v3). Die mogen weg; deze is compleet.

Aanleiding: het artikel *Denim Waste Material System Wins ICONIC Award* (25-08, post 140134)
staat live zonder channel. Dat bleek geen incident.

> Normdocument bij dit onderwerp: `docs/materiaal-classificatie-regelboek.md` (plugin-repo).
> Dat gaat over materialen; voor artikelen bestaat nog geen vastgelegde norm. De
> channelvoorstellen in het xlsx zijn een voorstel — de redactie beslist.

## Wat de data laat zien

Gemeten op 25-08-2026 via de CMS-API.

**Artikelen** (laatste 300): t/m mei 2026 was elk artikel gekoppeld. Juni 10 van 44, juli 31
van 46, augustus 12 van 33 — totaal 53 zonder channel. Talks: 14 van de laatste 40. Events op
één na in orde.

Van de 70 artikelen sinds juni onder gebruikers-ID 1 missen er 50 een channel, tegen 3 van de
53 onder ID 108086. Wie of wat achter ID 1 zit is van buitenaf niet te zien —
`wp-json/wp/v2/users` vereist authenticatie.

**Materialen** (2.000 opgehaald): 250 zonder channel. Slechts **2** hebben
`_md_distribution_approved = 1`, van 24 en 25 augustus. De distributiepoort werkt dus alleen
vooruit; de bestaande catalogus staat op leeg.

## De regel: route, niet rol

Eerdere versies gebruikten de capability `edit_others_posts` en een apart onderscheid per
posttype. Dat kan weg. Het redactiedashboard bestaat nog niet; de redactie werkt in gewoon
WP-admin op `cms.materialdistrict.com`, het ledendashboard in de frontend is van de members.
Daarmee is er één regel:

**Alles wat wij zelf publiceren — artikel, talk, event of materiaal — heeft minstens één
channel nodig. Wat een merk zelf via het ledendashboard publiceert niet.**

Het onderscheid is de route waarlangs iets binnenkomt, en die is hard te meten: de REST-route
wordt vastgelegd op `rest_pre_dispatch`, en alles onder `/wp/v2/` is WP-admin (daar slaat de
blokeditor op). Insider-materiaal komt per definitie van ons en dus via WP-admin, waardoor het
al onder de regel valt — een aparte vlagcontrole is overbodig.

Komt het redactiedashboard er, dan krijgt dat een eigen namespace: toevoegen aan
`md_required_channel_editorial_routes()` en de regel verhuist mee. Verder niets aanpassen.

## Insider-only op materialen

Talks en articles dragen `_insider_only`; material had het niet — er was dus geen manier om
een materiaal achter de Insider-poort te zetten. `md-material-insider-only.php` voegt dezelfde
vlag toe, onder dezelfde meta-key, met een checkbox in het Publiceren-blok van het materiaal-
scherm en een kolom **Insider** in de lijst. Bewust niet schrijfbaar vanuit het ledendashboard:
of iets achter de Insider-poort gaat is een commerciële keuze van MaterialDistrict, niet van
het merk.

Twee dingen om bij review op te letten:
1. Talk levert zowel `insider_only` als `_insider_only` in zijn REST-meta. Voor material is
   dezelfde alias toegevoegd via `rest_prepare_material`. Doet de plugin dat al centraal, laat
   die filter dan weg.
2. Of de frontend-mapper voor materials `insider_only` al uitleest is van buitenaf niet te
   controleren — `materialdistrict.com` geeft 503 vanuit mijn omgeving en de repo kan ik niet
   doorzoeken. Leest hij het nog niet, dan is dat een kleine toevoeging in de material-mapper;
   stuur `src/lib/api/mappers.ts` mee en ik lever hem af.

## De twee regels in `md-required-channel.php`

**A.** Publiceren via WP-admin zonder channel gaat niet. Blokeditor krijgt een leesbare fout,
klassieke editor en Quick Edit vallen terug naar concept met uitleg, plus een vangnet op
`save_post`. WP-CLI, cron en imports zijn uitgezonderd, zodat bulkwerk scriptbaar blijft.

**B.** Distributiepoort: `_md_distribution_approved` kan niet aan zolang er geen channel op
zit. Dit dicht het lek voor member-materiaal zonder de member te hinderen: publiceren mag,
de deur uit gaan niet. Intrekken van goedkeuring mag altijd. Geldt ook voor WP-CLI. Voor de
goedkeurflow zit er een helper in: `md_channel_gate_can_distribute( $post_id )`.

## Bestanden

1. `plugin/md-required-channel.php` — de twee regels, plus kolom **Channels** en weergave
   **No channel (n)** in de overzichtslijsten (telling 5 minuten gecachet).
2. `plugin/md-material-insider-only.php` — de insider-vlag op materialen.
3. `plugin/md-backfill-channels.php` — WP-CLI, koppelt de 53 artikelen zodra de redactie
   akkoord is. Dry run standaard.
4. `plugin/md-backfill-distribution-approval.php` — WP-CLI, keurt bestaande gepubliceerde
   materialen mét channel alsnog goed voor distributie, met `_md_first_approved_at` op de
   publicatiedatum van het materiaal zelf. Anders zou de eerstvolgende digest duizenden oude
   materialen als nieuw zien. Dry run standaard.
5. `data/channels-ontbrekend-25-08.xlsx` — de 53 artikelen met voorstel en reden.

## Wat nog openstaat

- **Redactioneel:** akkoord op de 53 voorstellen (Sigrid).
- **Besluit Jeroen:** draaien we de distributie-backfill? Zonder dat komt er uit de bestaande
  catalogus niets in de updates.
- **Talks:** 14 van de laatste 40 zonder channel; zelfde aanpak mogelijk, nog niet uitgewerkt.
- **`session-log.md`** niet bijgewerkt: de actuele versie zat niet in deze sessie.
