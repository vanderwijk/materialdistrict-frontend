# Begrippenlijst

> **Normdocument.** Eén betekenis per woord, over de frontend, het CMS, de dashboards, de
> documentatie en de communicatie met het team heen. Waar een begrip een besluit draagt, staat het
> besluitnummer erbij; de onderbouwing leeft in `besluitenregister.md`.
>
> **Twee lagen.** MaterialDistrict heeft, net als elk platform dat lang genoeg bestaat, een
> mensentaal en een systeemnaam voor dezelfde zaak. Die twee worden bewust *niet* gelijkgetrokken:
> hernoemen in de database kost meer dan het oplevert. Wat wél moet: weten welk woord waar hoort.
> §2 is die tabel.
>
> **Wat hier niet staat:** de classificatienorm (welk materiaal welk type of channel krijgt) —
> dat is `docs/materiaal-classificatie-regelboek.md` in de frontend-repo.
>
> Versie 1.0 · 25-08-2026 · eerste vastlegging. Cijfers gemeten tegen de live CMS-API op
> 25-08-2026. Zie §Status.

---

## 1. Begrippen

**Article** · Een redactioneel verhaal. In de interface en in gesprek heet dit een **story**; in
de code en de API is het post type `article`. Zie §2. Het footer-label staat nu nog op "Story by
MaterialDistrict" omdat named authors niet zijn afgerond.

**Board** · Een persoonlijke verzameling van een ingelogde bezoeker waarin materialen worden
opgeslagen voor later. Niet te verwarren met een saved search, die een *zoekopdracht* bewaart en
geen selectie.

**Brand** · Het merk of de fabrikant achter een materiaal. Een brand is een redactioneel product
met een eigen pagina, los van de vraag of zijn materialen gepubliceerd zijn: een gepubliceerd
material met een niet-publieke brand is een legitieme permanente toestand (B12). Zie ook *member*.

**Channel** · Het thematische ingangsbegrip van het platform — waarop je volgt, wat de digest
vult, wat de homepage-strips voedt. **Dit is het woord, altijd.** In de WordPress-taxonomie heet
hetzelfde ding `theme` en in de URL `/channel`. Zeg in teamcommunicatie nooit "termen", ook niet
wanneer het technisch over taxonomietermen gaat. Zie §2 en §3.

**Channel-catalogus** · De canonieke lijst channels, geleverd door `GET /md/v2/material-channels`.
Op 25-08-2026 telt die achttien channels. Zes daarvan dragen tien of minder materialen
(*Recycling* 1, *Regenerative* 1, *Sense & Sensibility* 0, *Timber* 10, *Leisure & Hospitality*
10, *Translucency* 14). De lijst is dus nog niet vastgezet; dat is launch-taak 1.
*Let op:* het commentaar in `src/lib/api/channels.ts` spreekt nog van "de 20 channels" — dat
getal is verouderd.

**Follow** · Het volgen van een channel of brand door een ingelogde bezoeker. Standaard-scope is
`material/story/talk`; boeken, events en brands vallen daar níét onder wanneer via het generieke
volgblok wordt gevolgd.

**Insider** · De betaalde lidmaatschapsstatus van een individuele bezoeker (Stripe-abonnement).
Niet te verwarren met *member*, wat over merken gaat. Content achter de Insider-poort draagt de
`insiderOnly`-vlag.

**Insider report** · Een rapport of publicatie achter de Insider-poort. In de code is dit post
type `insider_report`; in follow-mapping komt `book` hierop uit. In de interface heet het
"Insider insights".

**Material** · Het centrale catalogusobject: wat een architect of specificeerder zoekt, vergelijkt
en aanvraagt. Post type `material`. Elk material behoort tot één brand en draagt één *type* en tot
drie *channels*.

**Material code** · `_material_code`, de stabiele identifier van een material. Verandert niet mee
bij een typewijziging; de prefix wordt daarmee historisch (B25).

**Member** · Een brand met een betaald lidmaatschap. Een merk-begrip, geen bezoeker-begrip — voor
bezoekers is het *Insider*. Materialen zijn vanaf legacy te sorteren naar member of betaalde
materiaalpublicatie.

**Redactiedashboard** · De gated omgeving voor Sigrid en het contentteam, bovenop
materialdistrict.com. **Businessdashboard** is de sales- en relatiekant. Gebruik deze twee
woorden; "Atlas" is een vervallen werknaam uit een oude mockup en hoort niet meer in tekst of
gesprek. Zie §3.

**Saved search** · Een bewaarde filtercombinatie, met een `alertsEnabled`-voorkeur. De alert-engine
(cron, matching, mail) is nog niet gebouwd — de toggle bestaat wel.

**Story** · Zie *article*. Het mensentaal-woord voor een redactioneel verhaal.

**Talk** · Een lezing uit het MDU-archief, met video en spreker. Post type `talk`.

**Type** · De materiaalcategorie: één van elf, in de taxonomie `material_category`. Elk material
draagt er precies één. Zie de tabel in §2 voor de slug-naam-verschillen — die zijn een bekende
valkuil bij scripts.

---

## 2. Mensentaal en systeemnaam

Twee lagen, bewust niet gelijkgetrokken. De linkerkolom is wat je zegt en schrijft; de
rechterkolom is wat in de database, de API en de code staat. Een script dat op de linkerkolom
zoekt vindt niets.

| Mensentaal (interface, dashboard, gesprek, documentatie) | Systeemnaam (database, API, code) |
|---|---|
| channel | taxonomie `theme` · URL-segment `/channel` · in follow-mapping `theme` |
| type / materiaalcategorie | taxonomie `material_category` |
| story | post type `article` |
| insider report / Insider insights | post type `insider_report` · in follow-mapping komt `book` hierop uit |
| material | post type `material` |
| brand | post type `brand` |
| talk | post type `talk` |
| member (merk) | brand-meta / membershipvelden |
| Insider (bezoeker) | `insiderOnly`-vlag op content; Stripe-abonnement op de user |

**Regel.** Database- en codevelden worden **niet** hernoemd om de mensentaal te volgen. Ze zijn
niet zichtbaar voor de eindgebruiker en een rename raakt migraties, scripts en Johans werk zonder
dat er iets aan de ervaring verbetert. Wat wél wordt gelijkgetrokken zijn interfaceteksten en
teamcommunicatie.

### De elf types — slug versus label

De slug en het getoonde label lopen op vier plekken uiteen. Wie op labelnaam filtert, mist records.

| Slug | Label in de interface | Aantal (25-08-2026) |
|---|---|---|
| `plastics` | (Bio)Plastics | 868 |
| `other-naturals` | Bio-based (excl. Wood) | 843 |
| `wood` | Wood | 339 |
| `metals` | Metals | 229 |
| `coatings` | Coatings | 227 |
| `glass` | Glass | 217 |
| `ceramics` | Ceramics | 171 |
| `concretes` | Concrete | 151 |
| `natural-stones` | Natural Stones | 76 |
| `leather` | Leather | 67 |
| `composites` | Composites | 53 |

De vier afwijkers: `plastics` → "(Bio)Plastics", `other-naturals` → "Bio-based (excl. Wood)",
`concretes` → "Concrete" (enkelvoud), `natural-stones` → "Natural Stones".

---

## 3. Woorden die we niet gebruiken

| Niet | Wel | Waarom |
|---|---|---|
| termen | channels | "Term" is de WordPress-implementatie. In teamcommunicatie verwart het Sigrid en Sjoerd zonder iets toe te voegen — ook wanneer het technisch klopt. |
| Atlas | businessdashboard | Vervallen werknaam uit de `crm-v4.html`-mockup. Staat nog op enkele plekken in `roadmap.md` §1 en §5b; die vermeldingen zijn achterstand, geen uitzondering. |
| thema (NL) | channel | Het Engelse `theme` is de taxonomienaam, niet het gespreksbegrip. |
| product | material | "Product" is WooCommerce-taal en slaat op boeken, niet op de catalogus. |
| klant | member (merk) of Insider (bezoeker) | "Klant" laat in het midden welke van de twee bedoeld wordt, en dat is precies het onderscheid dat ertoe doet. |

---

## 4. Dit betekent níét

*Negatieve regels. Ze staan hier omdat een positieve definitie de verkeerde aanname niet
uitsluit, en omdat elk van deze misverstanden minstens één keer echt is gemaakt.*

**Een leeg channelveld betekent niet "geen channel van toepassing".** Het betekent in de praktijk
"nog niet beoordeeld". Op 25-08-2026 draagt een groot deel van de catalogus geen channel; dat is
achterstand, geen uitspraak. Daarom mag een script een channel-set nooit leegmaken (B26) en
daarom kent `mutatieprotocol.md` de status *gereserveerd*.

**Een niet-publieke brand betekent niet dat het material offline moet.** De brandpagina is een
eigen redactioneel product. Naam blijft zichtbaar, link vervalt (B12).

**Een certificaat betekent niet dat het channel van toepassing is.** C2C, FSC en PEFC zijn geen
channel-bewijs; de materiaaltekst moet de claim maken (B23).

**Een uiterlijk-woord betekent geen samenstelling.** "Wood look", "concrete effect", "leather
print" zeggen niets over waar het materiaal van gemaakt is (B24).

**Een merknaam-match betekent geen bewijs.** Dat een brand "Bamboo Industries" heet, maakt zijn
materialen geen bamboe (B24).

**Een lege `vimeo_id` in de publieke API betekent niet dat er geen video is.** De publieke
`wp/v2/talk`-respons strípt dat veld bij Insider-only talks; `has_video` is de publieke vlag en de
ID komt na login via `/api/talks/[id]/embed` (B51). Dit geldt breder: meet nooit een gated veld
tegen de publieke API zonder te controleren of het gestript wordt.

**"Live op het platform" betekent niet "klaar om te versturen".** Publicatie en distributie zijn
twee poorten (B20).

---

## Status

**v1.0 · 25-08-2026** — eerste vastlegging. De begrippen komen uit de moedermap-stand van
24-08-2026 en uit de codebase (`src/lib/api/channels.ts`, `cache-tags.ts`); de aantallen zijn
gemeten tegen `cms.materialdistrict.com` op 25-08-2026 en zijn dus een momentopname, geen norm.

Aanleiding: bij het opstellen van `besluitenregister.md` bleek dat de terminologie-afspraken
(nooit "termen", nooit "Atlas", channel = `theme`) nergens in de moedermap staan. Ze leefden in
sessiegeheugen, wat betekent dat ze bij een verse sessie of een nieuw teamlid verdwijnen.

Twee constateringen die opvolging vragen: het commentaar in `src/lib/api/channels.ts` noemt nog
twintig channels terwijl het er achttien zijn, en zes channels dragen tien of minder materialen —
relevant voor launch-taak 1 (channellijst vastzetten). Opgesteld door Claude, namens Jeroen.
