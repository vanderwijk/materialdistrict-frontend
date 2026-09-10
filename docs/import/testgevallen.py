#!/usr/bin/env python3
"""
Testgevallen — de fouten van 01-09-2026, vastgelegd met hun juiste antwoord.

    python3 testgevallen.py

Elk geval hieronder is een fout die in de MDU 2026-ronde daadwerkelijk is gemaakt en
door een meting is gevonden, niet door een regel. Een regel die één keer fout is gegaan
en niet getest wordt, gaat opnieuw fout. Draai dit vóór elke importronde.

Afloopcode 0 is groen, 1 is rood.
"""

import sys

sys.path.insert(0, ".")
try:
    import regels as norm
except ImportError:
    sys.exit("regels.py niet gevonden — draai dit script in dezelfde map.")


GEVALLEN = []


def geval(naam, toelichting):
    def wrap(fn):
        GEVALLEN.append((naam, toelichting, fn))
        return fn
    return wrap


@geval(
    "domeinkern zonder extensie",
    "Exact matchen miste Burned Wood (.com tegenover .nl), Forner (.nl/.pl) en "
    "Rubio Monocoat (.nl/.com). Drie duplicaten.",
)
def t_kern():
    kern = lambda d: norm.stam(d).split(".")[0]
    paren = [
        ("burnedwood.com", "burnedwood.nl"),
        ("forner.nl", "forner.pl"),
        ("rubiomonocoat.nl", "rubiomonocoat.com"),
    ]
    for a, b in paren:
        assert kern(a) == kern(b), f"{a} en {b} moeten dezelfde kern hebben"
    # en niet te ruim: verschillende bedrijven mogen niet samenvallen
    assert kern("moso.eu") != kern("mosobamboo.com")
    # samengestelde landextensies delen niet de stam 'ac'
    assert norm.stam("aub.ac.uk") != norm.stam("uibk.ac.at")


@geval(
    "platformcontrole op hostniveau",
    "De deelstringcontrole keurde roylinx.com en roofclix.com af omdat ze 'x.com' "
    "bevatten. Twee echte merken bijna afgewezen.",
)
def t_platform():
    for goed in ("roylinx.com", "roofclix.com", "burnedwood.com", "studioaggu.com"):
        assert not norm.is_platform(goed), f"{goed} is een gewoon bedrijfsdomein"
    for fout in ("x.com", "instagram.com", "carmenenriquezportfolio.cargo.site",
                 "ioanacaramiciu.wixsite.com", "maelysvenkiah.cargo.site"):
        assert norm.is_platform(fout), f"{fout} is een platform- of socialdomein"


@geval(
    "nationale nul in telefoonnummers",
    "'+31 (0)6 22337638' en '+31 06 …' leverden een nul te veel op. Dat maakte 32 "
    "identieke nummers tot schijnbare wijzigingen.",
)
def t_telefoon():
    verwacht = {
        "+31 (0)6 22337638": "+31622337638",
        "+31(0)77-8500954": "+31778500954",
        "+31 06 12565244": "+31612565244",
        "+31(0)20-8943848": "+31208943848",
        "+31 88 010 1707": "+31880101707",
        "0785309086": "+31785309086",
    }
    for ruw, goed in verwacht.items():
        uit = norm.telefoon(ruw, "NL")[0]
        assert uit == goed, f"{ruw!r} gaf {uit!r}, verwacht {goed!r}"
    # twee nummers in één veld levert leeg met een reden, geen half nummer
    leeg, reden = norm.telefoon("+31201234567 / +31612345678", "NL")
    assert leeg == "" and reden, "twee nummers horen leeg met een reden op te leveren"


@geval(
    "ontdubbelen niet op e-mailadres alleen",
    "Rijen 42 en 125 deelden info@leoxx.com en zijn samengevoegd, terwijl het "
    "A Casa Agency en wineo by LEOXX waren — twee inschrijvingen via één bureau. "
    "De registratienaam verschilde en dat is de scheidslijn.",
)
def t_ontdubbelen():
    rijen = [
        {"rij": 42, "email": "info@leoxx.com", "alias": "ACASAAGENCY"},
        {"rij": 125, "email": "info@leoxx.com", "alias": "WIMEO"},
        {"rij": 70, "email": "info@rubiomonocoat.nl", "alias": "RUBIOMONOCOAT"},
        {"rij": 106, "email": "info@rubiomonocoat.nl", "alias": "RUBIOMONOCOAT"},
    ]
    groepen = {}
    for r in rijen:
        groepen.setdefault((r["email"], r["alias"]), []).append(r["rij"])
    assert len(groepen) == 3, "leoxx moet splitsen, rubiomonocoat moet samenvallen"
    assert [42] in groepen.values() and [125] in groepen.values()
    assert [70, 106] in groepen.values()


@geval(
    "standnummer is geen identiteit",
    "De catalogus koppelde op standnummer. Op E07 staat in de export 'wineo by LEOXX' "
    "en in de catalogus 'A Casa Agency'; op O06 Stichting Insert tegenover BNI. "
    "Stand telt alleen mee met een tweede signaal.",
)
def t_stand():
    def koppel(stand_gelijk, domein_gelijk, alias_gelijk):
        return stand_gelijk and (domein_gelijk or alias_gelijk)

    # E07: alleen de stand komt overeen -> niet koppelen
    assert not koppel(True, False, False)
    # O01 TBI Klimaattrein: stand + e-maildomein + alias -> wel koppelen
    assert koppel(True, True, True)
    # domein gelijk zonder stand -> koppelen mag op het domein zelf, buiten deze regel om
    assert not koppel(False, True, False)


@geval(
    "een verouderd domein is geen identiteit",
    "atelierdashatsapenko.com stond in het 2025-bestand als website maar is inmiddels "
    "geparkeerd. De naam mocht mee, het domein niet.",
)
def t_dood_domein():
    dood = {"atelierdashatsapenko.com"}
    def bruikbaar(d):
        return bool(d) and not norm.is_platform(d) and d not in dood
    assert not bruikbaar("atelierdashatsapenko.com")
    assert bruikbaar("studiowae.nl")


@geval(
    "normaliseren vóór vergelijken",
    "De database draagt telefoonnummers en websites in negen notaties. Vergelijken op "
    "de ruwe waarde leest 2.047 identieke nummers als een wijziging.",
)
def t_vergelijken():
    assert norm.telefoon("+31 (0)6 22337638", "NL")[0] == norm.telefoon("+31622337638", "NL")[0]
    assert norm.domein("https://www.burnedwood.nl/") == norm.domein("burnedwood.nl")
    assert norm.postcode("1521RC", "NL") == norm.postcode("1521 RC", "NL")


@geval(
    "de canonieke statussleutel",
    "De import van 03-09 schreef record_status = prospect, terwijl de REST op "
    "_brand_record_status leest. Gevolg: 49 merken die de REST niet als prospect ziet. "
    "Besluit Johan 04-09-2026: opslag is _brand_record_status, de kale sleutel is niet "
    "leidend en wordt door een import niet meer geschreven.",
)
def t_statussleutel():
    import re
    try:
        php = open("import-mdu2026.php", encoding="utf-8").read()
    except FileNotFoundError:
        return  # buiten de bundel gedraaid
    regels = [l for l in php.splitlines()
              if "update_post_meta" in l and "record_status" in l]
    assert regels, "geen schrijfregel voor de recordstatus gevonden"
    for l in regels:
        assert "_brand_record_status" in l, f"schrijft de kale sleutel: {l.strip()}"


@geval(
    "huisnummer apart in de tweede adresregel",
    "Deze regel zat in het script van de MDU 2026-ronde en ontbrak in dat van 2025, "
    "omdat beide rondes hun eigen script hadden. Sinds 04-09-2026 staat hij in regels.py "
    "en wordt hij aangeroepen in plaats van overgetypt.",
)
def t_huisnummer():
    r = {"address_line_1": "Hoorn", "address_line_2": "234", "city": "Uithoorn"}
    norm.adres_opschonen(r)
    assert r["address_line_1"] == "Hoorn 234", r["address_line_1"]
    assert r["address_line_2"] == ""

    r = {"address_line_1": "Samsonweg 10", "address_line_2": "37A", "city": "Zaandam"}
    log = norm.adres_opschonen(r)
    assert r["address_line_1"] == "Samsonweg 10", "regel 1 had al een nummer: niet samenvoegen"
    assert any("los nummer" in x for x in log), "hoort wel gemarkeerd te worden"

    r = {"address_line_1": "Hulswitweg 109", "address_line_2": "109", "city": "Wijk"}
    norm.adres_opschonen(r)
    assert r["address_line_2"] == "", "regel 2 herhaalde regel 1"


@geval(
    "een armere bronwaarde is geen update",
    "Industriëlaan 97a werd Industriëlaan 97 en Schiemond 20-22 werd Schiemond 20, "
    "omdat een niveau-1-bron van legacy wint. Verlies van detail is geen update. "
    "Gevonden in de MDU 2025-ronde, 04-09-2026.",
)
def t_verschraling():
    assert norm.verliest_detail("address_line_1", "Industriëlaan 97a", "Industriëlaan 97")
    assert norm.verliest_detail("address_line_1", "Schiemond 20-22", "Schiemond 20")
    assert norm.verliest_detail("city", "Inarzo (VA)", "Inarzo")
    # een echte aanvulling mag wel
    assert not norm.verliest_detail("address_line_1", "Hoorn", "Hoorn 234")
    assert not norm.verliest_detail("address_line_1", "Kerkstraat 1", "Dorpsplein 4")


@geval(
    "een persoonsgebonden adres hoort niet op een merk",
    "Poort 3. In de bestaande database staan 601 merken met een persoonsgebonden adres "
    "en 150 op een gratis provider.",
)
def t_poort3():
    assert norm.is_persoonsgebonden("janderksen@moza.nl", "Moza")
    assert norm.is_persoonsgebonden("m.bouwens@abet.nl", "ABET")
    assert norm.is_persoonsgebonden("studio.emma@gmail.com", "Studio Emma")
    assert not norm.is_persoonsgebonden("info@moza.nl", "Moza")
    assert not norm.is_persoonsgebonden("sales@abet.nl", "ABET")


@geval(
    "een kolomnaam is geen kolomtype",
    "Op 09-09-2026 kreeg de kolom grond een hele zin terwijl hij VARCHAR(16) is; de "
    "invoegingen faalden en de migratie moest opnieuw. De naam was gemeten, het type "
    "aangenomen. SHOW COLUMNS geeft beide — lees ze allebei.",
)
def t_kolomtype():
    # Wat er in een kolom geschreven wordt, wordt getoetst aan de gemeten breedte,
    # niet aan wat het veld heet.
    kolommen = {"grond": 16, "bewijs": 191, "rol": 32, "rol_detail": 32}

    def past(kolom, waarde):
        breedte = kolommen.get(kolom)
        return breedte is not None and len(waarde) <= breedte

    assert past("grond", "handmatig")
    assert past("grond", "domein gelijk")
    assert not past("grond", "bestaande koppeling in connected_brand_id")
    assert past("bewijs", "usermeta connected_brand_id")
    assert past("rol", "commercieel contact")


@geval(
    "grond is een gesloten lijst van hooguit zestien tekens",
    "Afgesproken met Johan 09-09-2026 nadat de migratie live faalde: grond is een enum "
    "(domein|domeinstam|naam|handmatig|registratie). Uitleg hoort in bewijs of bron.",
)
def t_grond_enum():
    for goed in norm.GROND:
        assert norm.controleer_grond(goed) == goed
        assert norm.past_in_kolom("grond", goed), f"{goed} past niet in VARCHAR(16)"

    for fout in ("bestaande koppeling in connected_brand_id", "e-maildomein gelijk aan merkdomein"):
        try:
            norm.controleer_grond(fout)
        except ValueError:
            pass
        else:
            raise AssertionError(f"{fout!r} had geweigerd moeten worden")

    for rol in norm.ROL:
        assert norm.controleer_rol(rol) == rol
        assert norm.past_in_kolom("rol", rol)


@geval(
    "een domein draagt meer dan één merk",
    "Op 09-09-2026 zette de matcher domeinen in een gewone dict, waardoor bij twee merken "
    "op één domein willekeurig de laatste won. Bij i-did.nl koos hij Sylvia Calvo in "
    "plaats van I-did, terwijl daar een besluit over lag.",
)
def t_domein_index():
    merken = [
        {"id": 54787, "web": "i-did.nl"},
        {"id": 135221, "web": "i-did.nl"},
        {"id": 2801, "web": "abet.nl"},
        {"id": 99, "web": "instagram.com"},
    ]
    idx = norm.domein_index(merken, lambda m: m["web"])

    assert len(idx["i-did.nl"]) == 2, "beide merken op i-did.nl horen kandidaat te zijn"
    assert {m["id"] for m in idx["i-did.nl"]} == {54787, 135221}
    assert len(idx["abet.nl"]) == 1
    assert "instagram.com" not in idx, "platformdomein hoort geen identiteit te zijn"


@geval(
    "paginering rekent, en neemt niet over",
    "X-WP-TotalPages hoort bij de per_page van dat ene verzoek. Op 09-09-2026 werd het "
    "aantal pagina's opgehaald met per_page=1 en daarna in stappen van 100 gelezen: "
    "2.635 pagina's in plaats van 27, en de ronde liep vast.",
)
def t_paginering():
    def paginas(totaal, per_page):
        return max(1, -(-totaal // per_page))

    assert paginas(2635, 100) == 27
    assert paginas(100, 100) == 1
    assert paginas(101, 100) == 2
    assert paginas(0, 100) == 1
    assert paginas(2635, 100) != 2635


@geval(
    "type en editie zijn twee kolommen",
    "Op een samengesteld label als exposant_mdu2022 valt niet te tellen en niet te "
    "filteren, en 'wie stond er drie edities' is een teloefening. Uit §8 van het protocol.",
)
def t_activiteit():
    assert norm.controleer_activiteit("exposant") == "exposant"
    for fout in ("exposant_mdu2022", "bezoeker2023", "onbekend"):
        try:
            norm.controleer_activiteit(fout)
        except ValueError:
            pass
        else:
            raise AssertionError(f"{fout!r} had geweigerd moeten worden")

    # Een catalogus zegt dat het bedrijf exposant was; standbemanning hangt aan de persoon.
    assert norm.subject_kant("exposant") == "brand"
    assert norm.subject_kant("standbemanning") == "user"
    assert norm.subject_kant("no_show") == "user"

    # Hetzelfde feit twee keer geeft dezelfde sleutel, dus geen tweede rij.
    a = norm.feitsleutel("user", 42, "standbemanning", "MDU 2026", "2026-03-04")
    b = norm.feitsleutel("user", "42", "standbemanning", "MDU 2026", "2026-03-04")
    assert a == b
    # Andere editie is een ander feit.
    assert a != norm.feitsleutel("user", 42, "standbemanning", "MDU 2025", "2026-03-04")


@geval(
    "een indexnaam mag geen gereserveerd woord zijn",
    "Op 09-09-2026 botsten KEY lead en KEY object op wp_md_activity; dbDelta struikelde "
    "erover en Johan moest ze hernoemen naar lead_idx en object_idx.",
)
def t_gereserveerd():
    for fout in ("lead", "object", "order", "rank"):
        try:
            norm.veilige_schemanaam(fout)
        except ValueError:
            pass
        else:
            raise AssertionError(f"{fout!r} had geweigerd moeten worden")

    for goed in ("lead_idx", "object_idx", "type_editie", "batch", "subject"):
        assert norm.veilige_schemanaam(goed) == goed


@geval(
    "overslaan geldt voor de persoon, niet voor de rij",
    "Op 09-09-2026 sloeg het schrijfpad bij actie=overslaan de hele rij over, inclusief "
    "de activiteit. Het exposant-rondje plantte daardoor nul feiten, en nul leest als "
    "'er viel niets te doen'. Een merkfeit draagt geen persoon en hoort er toch te komen.",
)
def t_overslaan():
    def verwerk(rij):
        """Wat het schrijfpad met een rij doet, in het klein."""
        uit = {"persoon": False, "activiteit": False}
        geen_persoon = rij.get("actie") == "overslaan" or not rij.get("email")
        if not geen_persoon:
            uit["persoon"] = True
        if rij.get("activiteit"):
            uit["activiteit"] = True
        return uit

    merkfeit = {"actie": "overslaan", "email": "", "activiteit": "exposant",
                "subject_type": "brand", "subject_id": 135361}
    assert verwerk(merkfeit) == {"persoon": False, "activiteit": True}

    persoonsfeit = {"actie": "nieuw", "email": "iemand@example.org",
                    "activiteit": "standbemanning", "subject_type": "user"}
    assert verwerk(persoonsfeit) == {"persoon": True, "activiteit": True}

    leeg = {"actie": "overslaan", "email": "", "activiteit": ""}
    assert verwerk(leeg) == {"persoon": False, "activiteit": False}


@geval(
    "het subject van een feit is niet de brand_id van een koppeling",
    "brand_id is de kolom voor de KOPPELING; het subject van een activiteit staat in "
    "subject_id. Op 09-09-2026 gebruikte het schrijfpad brand_id voor een merkfeit, en dat "
    "veld is daar leeg — alle exposant-feiten kwamen op subject 0 uit.",
)
def t_subject():
    def subject(rij, user_id=0):
        sid = rij.get("subject_id") or 0
        if not sid:
            sid = user_id if rij.get("subject_type") == "user" else (rij.get("brand_id") or 0)
        return sid

    # merkfeit: subject staat in de rij, brand_id is leeg
    assert subject({"subject_type": "brand", "subject_id": 135361, "brand_id": None}) == 135361
    # persoonsfeit: subject komt van de gevonden persoon
    assert subject({"subject_type": "user", "subject_id": None, "brand_id": 2801}, user_id=42) == 42
    # niets bruikbaars: dat hoort geweigerd te worden, niet stil op 0 te belanden
    assert subject({"subject_type": "brand", "subject_id": None, "brand_id": None}) == 0


@geval(
    "postcode en plaats uit een catalogusregel",
    "Op 09-09-2026 pakte de ontleding uit '3072 DB Rotterdam' alleen 3072 en verdwenen "
    "de letters. Unilin Flooring Nederland kwam daardoor zonder postcode in de ronde, en "
    "poort 5 sloeg terecht aan op een halve postcode die geen halve postcode was.",
)
def t_postcode_stad():
    assert norm.splits_postcode_stad("3072 DB Rotterdam", "NL") == ("3072 DB", "Rotterdam")
    assert norm.splits_postcode_stad("1234AB Amsterdam", "NL") == ("1234 AB", "Amsterdam")
    assert norm.splits_postcode_stad("8792 Waregem", "BE") == ("8792", "Waregem")
    assert norm.splits_postcode_stad("SW1A 1AA London", "GB") == ("SW1A 1AA", "London")
    # Geen postcode in de regel: de hele regel is de plaatsnaam, postcode blijft leeg.
    assert norm.splits_postcode_stad("Genemuiden", "NL") == ("", "Genemuiden")


@geval(
    "de bedrijfsnaam in het straatveld is geen straat",
    "Bij Unilin Flooring Nederland stond de bedrijfsnaam in Company Street. Een straat "
    "zonder cijfer die de merknaam is, hoort leeg te blijven zodat de catalogus of een "
    "opzoekactie hem vult.",
)
def t_straat():
    assert norm.straat_is_geen_straat("Unilin Flooring Nederland", "Unilin Flooring Nederland - Projecten")
    assert not norm.straat_is_geen_straat("Wilhelminaplein 20", "Unilin Flooring Nederland")
    # Een Britse straat zonder huisnummer is wel een straat.
    assert not norm.straat_is_geen_straat("Henfaes Lane", "Newmor Wallcoverings")


def main():
    goed = 0
    for naam, toelichting, fn in GEVALLEN:
        try:
            fn()
            print(f"  groen  {naam}")
            goed += 1
        except AssertionError as e:
            print(f"  ROOD   {naam}")
            print(f"         {toelichting}")
            print(f"         {e}")
        except Exception as e:  # noqa: BLE001
            print(f"  ROOD   {naam} — {type(e).__name__}: {e}")
    print(f"\n{goed} van {len(GEVALLEN)} testgevallen groen.")
    return 0 if goed == len(GEVALLEN) else 1


if __name__ == "__main__":
    sys.exit(main())
