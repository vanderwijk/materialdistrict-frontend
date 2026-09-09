# Rollen en rechten tussen persoon en merk

9 september 2026. Ter beoordeling door Johan. Hoort bij §4 van `docs/importprotocol.md`.

Uitgeschreven zodat de kolommen, de leespaden en de migratie in één stuk staan en er niets
bedacht hoeft te worden op het moment dat het gebouwd wordt.

---

## 1. Hoe het nu werkt, gemeten

Beheerderschap loopt via het usermeta-veld `connected_brand_id`, meerwaardig. Het wordt op
precies twee plekken gelezen:

| plek | wat het doet |
|---|---|
| `md_auth_connected_brands_payload()` — `rest-auth.php` r.286 | bouwt de lijst merken die iemand in zijn dashboard ziet |
| `md_dashboard_require_managed_brand()` — `rest-dashboard.php` r.62 | de poort: mag deze gebruiker dit merk bewerken |

Daarnaast is er één doorgang: wie `edit_others_posts` heeft — redactie en beheer — komt
overal bij, zonder koppeling. Dat blijft zo.

**Het veld staat bij 15 van de 118.996 gebruikers.** De migratie is dus klein; dit is een
goed moment om het om te zetten en een slecht moment om te wachten tot het er duizenden zijn.

`wp_md_user_brand` bestaat en is leeg — nul rijen — met de kolommen `id`, `user_id`,
`brand_id`, `grond`, `bewijs`, `mag_beheren`, `created_by_batch`, `created_at`.

---

## 2. Waarom een rol iets anders is dan een recht

Deze twee lopen makkelijk door elkaar en het onderscheid draagt de rest van het model.

**Een rol** zegt wát iemand is voor een merk: contactpersoon, medewerker, factuurcontact.
Het is een beschrijving van de werkelijkheid en er kunnen er meerdere tegelijk gelden.

**Een recht** zegt wat iemand mág: het merkprofiel bewerken, materialen publiceren, de
facturen inzien. Dat is een besluit, geen waarneming.

Een import stelt rollen vast, want die zijn af te leiden uit een bron. Een import kent
nooit rechten toe, want daar is niets uit af te leiden. Dat een import kan vaststellen dat
Jan Derksen contactpersoon van Moza is, betekent niet dat Jan het merkprofiel mag wijzigen.

Daarom blijft `mag_beheren` een eigen kolom en wordt hij nooit door een import gevuld.

---

## 3. De rollen

Gesloten lijst. Een open lijst wordt binnen een jaar een rommelbak, en dan is niet meer te
zeggen wat een rol betekent.

| rol | wat het zegt | komt uit | mag beheren |
|---|---|---|---|
| `medewerker` | werkt bij dit bedrijf | e-maildomein gelijk aan merkdomein | nee |
| `contactpersoon` | het aanspreekpunt | `_brand_contact_*` | nee |
| `commercieel contact` | voor commerciële mail | `_automation_commercial_*` | nee |
| `lead routing` | ontvangt aanvragen, per land | `_brand_lead_routing` | nee |
| `factuurcontact` | ontvangt facturen | boekhouding | nee |
| `beheerder` | mag het merkprofiel bewerken | handmatige toekenning | **ja** |

`rol_detail` draagt bij `lead routing` de landcode. Bij de rest leeg. Het hoort bij de rol
en niet bij de persoon: iemand kan lead routing zijn voor Nederland terwijl een ander dat
voor Duitsland is, bij hetzelfde merk.

**Sleutel: `user_id + brand_id + rol`.** Eén persoon kan meerdere rollen hebben bij één
merk, en bij meerdere merken horen — `studio@evaxcarola.com` staat nu bij vier. Twee keer
dezelfde rol bij hetzelfde merk mag niet.

**`beheerder` is de enige rol met een recht eraan.** De andere vijf beschrijven alleen. Wie
beheerder wordt, wordt met de hand goedgekeurd; dat volgt nooit uit een import, uit een
domein of uit een activiteit.

---

## 4. Wat elke rol mag

| | profiel bewerken | materialen publiceren | facturen zien | ontvangt sample-aanvragen | ontvangt leads |
|---|---|---|---|---|---|
| `beheerder` | ja | ja | ja | ja, als terugval | ja, als terugval |
| `contactpersoon` | nee | nee | nee | **ja** | ja, als terugval |
| `lead routing` | nee | nee | nee | nee | **ja, voor zijn land** |
| `commercieel contact` | nee | nee | nee | nee | nee |
| `factuurcontact` | nee | nee | **ja** | nee | nee |
| `medewerker` | nee | nee | nee | nee | nee |

De laatste twee kolommen zijn wat nu in de merkvelden zit. De volgorde van terugvallen bij
een sample-aanvraag blijft zoals hij is — eerst de specifieke rol, dan het algemene
merkadres — alleen komt de bron van die rol uit de koppelingstabel in plaats van uit een
tekstveld.

---

## 5. Wat er in de tabel bij moet

```sql
ALTER TABLE wp_md_user_brand
  ADD COLUMN `rol`        VARCHAR(32)  NOT NULL DEFAULT 'medewerker' AFTER `brand_id`,
  ADD COLUMN `rol_detail` VARCHAR(32)  NULL DEFAULT NULL            AFTER `rol`,
  ADD COLUMN `bron`       VARCHAR(191) NULL DEFAULT NULL            AFTER `bewijs`,
  ADD COLUMN `brondatum`  DATE         NULL DEFAULT NULL            AFTER `bron`,
  ADD COLUMN `geldig_tot` DATE         NULL DEFAULT NULL            AFTER `brondatum`,
  ADD UNIQUE KEY `user_brand_rol` (`user_id`, `brand_id`, `rol`),
  ADD KEY `brand_rol` (`brand_id`, `rol`);
```

`bron` en `brondatum` staan erbij om dezelfde reden als bij een veldwaarde: een koppeling
is een bewering met een houdbaarheid. Dat iemand in 2019 contactpersoon was, is geen bewijs
dat hij dat nu is.

`geldig_tot` is leeg zolang de koppeling loopt. Een oude contactpersoon wordt beëindigd en
niet verwijderd — weggooien is verlies, beëindigen is een feit dat je later nog kunt
navragen.

Het migratiescript `migratie-user-brand-rollen.php` zit bij deze levering en is idempotent.

---

## 6. De leespaden

Dit is het stuk dat breekt als de volgorde niet klopt, dus het staat er expliciet.

### Nu

```php
// rest-auth.php r.288
$brand_ids = get_user_meta( $user->ID, 'connected_brand_id', false );

// rest-dashboard.php r.77
$linked_ids = get_user_meta( $user->ID, 'connected_brand_id', false );
```

### Straks

Beide via één helper, zodat er niet twee plekken zijn die hetzelfde net iets anders doen:

```php
/**
 * Brands this user may manage.
 *
 * Reads wp_md_user_brand, falling back to the connected_brand_id usermeta while both
 * exist. The fallback comes out only after the comparison in step C shows the two
 * agree on every row — see docs/importprotocol.md §5.
 */
function md_user_managed_brand_ids( $user_id ) {
	global $wpdb;

	$tabel = $wpdb->prefix . 'md_user_brand';
	$ids   = $wpdb->get_col( $wpdb->prepare(
		"SELECT brand_id FROM {$tabel}
		  WHERE user_id = %d AND mag_beheren = 1
		    AND ( geldig_tot IS NULL OR geldig_tot >= CURDATE() )",
		absint( $user_id )
	) );

	if ( empty( $ids ) ) {
		$ids = get_user_meta( $user_id, 'connected_brand_id', false );
	}

	return array_values( array_unique( array_filter( array_map( 'absint', (array) $ids ) ) ) );
}
```

En voor de mailroutering, die nu `_brand_lead_routing` en `_brand_contact_email` leest:

```php
/**
 * People holding a role at this brand, most specific first.
 *
 * @param int    $brand_id Brand.
 * @param string $rol      One of the closed list.
 * @param string $detail   Country code for lead routing, empty otherwise.
 * @return int[] User IDs.
 */
function md_brand_users_with_role( $brand_id, $rol, $detail = '' ) {
	global $wpdb;

	$tabel = $wpdb->prefix . 'md_user_brand';
	$waar  = 'brand_id = %d AND rol = %s AND ( geldig_tot IS NULL OR geldig_tot >= CURDATE() )';
	$vars  = array( absint( $brand_id ), $rol );

	if ( '' !== $detail ) {
		$waar  .= ' AND ( rol_detail = %s OR rol_detail IS NULL OR rol_detail = "" )';
		$vars[] = $detail;
		// Country-specific rows first, the catch-all after.
		$orde   = 'ORDER BY ( rol_detail = %s ) DESC, id ASC';
		$vars[] = $detail;
	} else {
		$orde = 'ORDER BY id ASC';
	}

	return array_map( 'absint', (array) $wpdb->get_col(
		$wpdb->prepare( "SELECT user_id FROM {$tabel} WHERE {$waar} {$orde}", $vars )
	) );
}
```

### De volgorde waarin dat omgaat

Dezelfde als §5 van het protocol, en niet omwisselbaar:

**A.** Koppelingen aanleggen náást de bestaande velden. Er verandert niets aan gedrag.
**B.** De twee helpers erin, met de terugval. Lead routing, sample-aanvragen, claim-hints
en het dashboard gaan er één voor één op leunen.
**C.** Alle regels vergelijken — geeft het nieuwe pad hetzelfde antwoord als het oude, voor
elk van de 406 merken met lead routing, 1.197 met een contactadres en de 15 gebruikers met
`connected_brand_id`? Geen steekproef.
**D.** Pas dan de velden leegmaken en als laatste de terugval eruit.

---

## 7. Wat een import wel en niet doet

| | import | mens |
|---|---|---|
| rol vaststellen | ja | ja |
| `mag_beheren` zetten | **nooit** | ja |
| koppeling beëindigen (`geldig_tot`) | ja, als de bron dat zegt | ja |
| koppeling verwijderen | nooit | ja |

Een import die 1.567 contactpersonen aanlegt, legt 1.567 rollen aan en nul rechten. Wie
daarna beheerder wordt, is een besluit van een mens — en dat besluit is er precies één per
merk om mee te beginnen.

---

## 8. Wat dit oplost dat nu niet kan

- **Eén persoon bij meerdere merken.** Nu onmogelijk in een tekstveld; 27 van de 1.567
  doen het al, één bij vier merken.
- **Meerdere rollen bij één merk.** Iemand kan contactpersoon zijn én lead routing voor
  Nederland.
- **Weten waarom een koppeling er is.** `grond` en `bewijs` staan er al; met `bron` en
  `brondatum` erbij is ook te zien uit welk bestand hij komt en wanneer dat gold.
- **Een oude contactpersoon die vertrekt.** Nu wordt het veld overschreven en is het weg.
  Straks krijgt de koppeling `geldig_tot` en blijft de geschiedenis staan.
- **Filteren.** "Alle lead-routingcontacten voor Duitsland" is nu geen vraag die je kunt
  stellen.

---

## Status

Opgesteld 09-09-2026, op verzoek van Jeroen, zodat het rolmodel klaarligt op het moment dat
punt 3 van Johans planning aan de beurt is. De rollenlijst komt uit §4 van het
importprotocol en is daar niet weersproken; nieuw in dit stuk zijn de rechtentabel in §4,
de twee leeshelpers in §6 en de migratie.
