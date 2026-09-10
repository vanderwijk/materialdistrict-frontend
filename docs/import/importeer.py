#!/usr/bin/env python3
"""
importeer.py — één script dat een importronde draait.

    python3 importeer.py bronbestand.xlsx \
        --bron "Exposantenexport MDU 2024" \
        --brondatum 2024-03-13 \
        --editie "MDU 2024" \
        --niveau 1 \
        --activiteit exposant \
        --kant merk \
        [--catalogus catalogusindex.docx] \
        [--uit uitvoermap]

Zonder alle vijf de gegevens begint het script niet. Dat is geen strengheid maar de
enige manier om te voorkomen dat ze uit een bestandsnaam worden afgeleid.

Waarom dit bestaat
------------------
Tot 09-09-2026 was er een protocol, een regelmodule en een poortcontrole, maar geen
script dat een ronde draaide. Elke editie kreeg zijn eigen lijmwerk, en daar ging het
elke keer mis: de huisnummerregel zat in de MDU 2026-ronde en ontbrak in die van 2025,
de domeinindex was in de ene ronde een lijst en in de andere een map.

Alles wat hier gebeurt roept `regels.py` aan. Er wordt in dit bestand geen enkele regel
opnieuw geschreven; staat een regel niet in `regels.py`, dan hoort hij daar en niet hier.

De negen stappen uit docs/importprotocol.md, in volgorde
--------------------------------------------------------
 1 tellen          nulmeting per kolom
 2 splitsen        merk, persoon, activiteit uit elkaar
 3 uniform maken   vóór het vergelijken, niet erna
 4 herkennen       persoonsgebonden adres hoort niet op een merk
 5 ontdubbelen     binnen de bron
 6 vergelijken     tegen een VERSE uitdraai van de live database
 7 verrijken       en dan de lus, tot twee ronden niets meer veranderen
 8 poorten         zes, en één die faalt blokkeert
 9 opleveren       werkboek, databestand, besluitenlog

Wat het niet doet: schrijven. De uitvoer is een werkboek en een databestand; het
wegschrijven gebeurt met het PHP-script door Johan.
"""

import argparse
import json
import re
import sys
import urllib.request
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path

import regels

CMS = "https://cms.materialdistrict.com/wp-json/md/v2"
KOP = {"User-Agent": "MaterialDistrict-import/1.0"}

VELDEN = {
    "website": "_brand_website",
    "email": "_brand_email",
    "phone": "_brand_phone",
    "address_line_1": "_brand_address",
    "address_line_2": "_brand_address_2",
    "postcode": "_brand_postcode",
    "city": "_brand_city",
    "country": "_brand_country",
    "vat_number": "_brand_vat_number",
    "chamber_number": "_brand_chamber_number",
}

NIVEAU_NAAM = {
    1: "het bedrijf of de persoon zelf",
    2: "een openbaar register",
    3: "wij",
    4: "opgezocht",
}


def zeg(*a):
    print(*a, flush=True)


# ---------------------------------------------------------------------------
# De live database. Nooit een oude uitdraai — advies Johan, 09-09-2026.
# ---------------------------------------------------------------------------

def haal_merken(sleutel):
    """Alle merken, vers. Pagina's die falen worden opnieuw gehaald, niet overgeslagen."""
    kop = dict(KOP, **{"X-MD-Import-Key": sleutel})

    def pagina(p):
        url = f"{CMS}/import/brands?per_page=100&page={p}"
        with urllib.request.urlopen(urllib.request.Request(url, headers=kop), timeout=90) as r:
            return json.loads(r.read())

    # X-WP-TotalPages hoort bij de per_page van dit ene verzoek. Vragen met per_page=1 en
    # daarna in stappen van 100 lezen gaf 2.635 pagina's in plaats van 27, en de ronde liep
    # vast. Het aantal pagina's wordt dus uitgerekend, niet overgenomen.
    eerste = urllib.request.Request(f"{CMS}/import/brands?per_page=1", headers=kop)
    with urllib.request.urlopen(eerste, timeout=60) as r:
        totaal = int(r.headers.get("X-WP-Total", 0))
    paginas = max(1, -(-totaal // 100))

    zeg(f"  live database: {totaal} merken over {paginas} pagina's")

    merken, gezien = [], set()
    for p in range(1, paginas + 1):
        for poging in range(3):
            try:
                for b in pagina(p):
                    if b["id"] not in gezien:
                        gezien.add(b["id"])
                        merken.append(b)
                break
            except Exception as e:
                if poging == 2:
                    sys.exit(f"pagina {p} kwam na drie pogingen niet binnen: {e}")

    merken = [b for b in merken if b.get("status") != "trash"]
    zeg(f"  opgehaald: {len(merken)} merken, prullenbak uitgesloten")
    return merken


# ---------------------------------------------------------------------------
# Stap 1 en 2 — tellen en splitsen
# ---------------------------------------------------------------------------

def lees_bron(pad):
    from openpyxl import load_workbook

    ws = load_workbook(pad, data_only=True).active
    rijen = list(ws.iter_rows(values_only=True))
    namen, gezien = [], Counter()
    for i, k in enumerate(rijen[0]):
        n = str(k) if k else f"kolom{i}"
        gezien[n] += 1
        namen.append(n if gezien[n] == 1 else f"{n}_{gezien[n]}")
    return [
        (i + 2, dict(zip(namen, r)))
        for i, r in enumerate(rijen[1:])
        if any(x is not None for x in r)
    ], namen


def nulmeting(bron, namen):
    zeg(f"\nStap 1 — tellen: {len(bron)} rijen, {len(namen)} kolommen")
    leeg = []
    for k in namen:
        gevuld = sum(1 for _, d in bron if str(d.get(k) or "").strip())
        if gevuld:
            zeg(f"    {k:34s} {gevuld:5d}")
        else:
            leeg.append(k)
    if leeg:
        zeg(f"    leeg: {', '.join(leeg)}")
    return {k: sum(1 for _, d in bron if str(d.get(k) or "").strip()) for k in namen}


def kolom(d, *namen):
    for n in namen:
        if n in d and d[n] not in (None, ""):
            return str(d[n]).strip()
    return ""


def splits(bron, brondatum):
    """Stap 2 en 3: uit elkaar trekken en meteen uniform maken."""
    merken, personen, meldingen = [], [], Counter()

    for rij, d in bron:
        land = regels.land(kolom(d, "Company Country", "Country"))
        tel, tel_reden = regels.telefoon(kolom(d, "Company Phone", "Phone"), land)
        web = regels.domein(kolom(d, "Company Website", "Website"))
        web_reden = ""
        if web and regels.is_platform(web):
            web_reden = f"{web}: platform- of socialdomein, geen identiteit"
            meldingen["website afgekeurd"] += 1
            web = ""

        m = {
            "bron_rij": rij,
            "brand_name": regels.schoonnaam(kolom(d, "Company Name", "Bedrijfsnaam")),
            "alias": kolom(d, "Shortname"),
            "website": web,
            "website_reden": web_reden,
            "email": regels.email(kolom(d, "Company Email")),
            "phone": tel,
            "phone_reden": tel_reden,
            "address_line_1": regels.s(kolom(d, "Company Street")),
            "address_line_2": regels.s(kolom(d, "Company Street 2")),
            "postcode": regels.postcode(kolom(d, "Company Postcode"), land),
            "city": regels.kapitaliseer(kolom(d, "Company City")),
            "country": land,
            "vat_number": "",
            "chamber_number": "",
            "stand": kolom(d, "Stand Number"),
            "brondatum": (kolom(d, "LAST_CHANGED") or brondatum)[:10],
        }
        if tel_reden:
            meldingen[f"telefoon: {tel_reden}"] += 1

        # Stap 3, adressen. De regel staat in regels.py en wordt hier alleen aangeroepen.
        for melding in regels.adres_opschonen(m):
            meldingen[melding.split(":")[0]] += 1
            m.setdefault("adres_meldingen", []).append(melding)

        m["naamsleutel"] = regels.naamsleutel(m["brand_name"])
        m["kern"] = regels.domeinkern(m["website"])
        merken.append(m)

        pe = regels.email(kolom(d, "Email Address"))
        personen.append({
            "bron_rij": rij,
            "email": pe,
            "first_name": regels.kapitaliseer(kolom(d, "First Name")),
            "last_name": regels.kapitaliseer(kolom(d, "Last Name")),
            "emaildomein": pe.split("@")[1] if pe else "",
            "brondatum": m["brondatum"],
        })

    zeg(f"\nStap 2 en 3 — gesplitst en uniform gemaakt: {len(merken)} merkrijen, {len(personen)} personen")
    for k, v in meldingen.most_common():
        zeg(f"    {v:4d}  {k}")
    return merken, personen


# ---------------------------------------------------------------------------
# Stap 4 — persoonsgebonden adressen van het merk halen
# ---------------------------------------------------------------------------

def poort_drie(merken):
    n = 0
    for m in merken:
        if m["email"] and regels.is_persoonsgebonden(m["email"], m["brand_name"]):
            m["email_persoonlijk"] = m["email"]
            m["email"] = ""
            m["email_reden"] = "persoonsgebonden adres — hoort niet op een merk (poort 3)"
            n += 1
    zeg(f"\nStap 4 — {n} persoonsgebonden adressen van het merk gehaald")
    return n


# ---------------------------------------------------------------------------
# Stap 5 — ontdubbelen binnen de bron
# ---------------------------------------------------------------------------

def ontdubbel(merken):
    """Op domein, adres of naam — maar nooit op e-mailadres alleen.

    Twee inschrijvingen via hetzelfde bureau delen een adres en zijn twee merken. De
    registratienaam is de scheidslijn; zie regels.py en testgevallen.py.
    """
    groepen = defaultdict(list)
    for m in merken:
        sleutel = m["website"] or m["email"] or m["naamsleutel"] or f"rij{m['bron_rij']}"
        groepen[(sleutel, m.get("alias") or "")].append(m)

    uniek = []
    for _, leden in groepen.items():
        h = dict(leden[0])
        h["bron_rijen"] = [x["bron_rij"] for x in leden]
        h.pop("bron_rij", None)
        for x in leden[1:]:
            for k, v in x.items():
                if k != "bron_rij" and v and not h.get(k):
                    h[k] = v
        h["standen"] = sorted({x["stand"] for x in leden if x["stand"]})
        uniek.append(h)

    gesplitst = sum(
        1 for (s, _), l in groepen.items()
        if len([g for (s2, _), g in groepen.items() if s2 == s]) > 1
    )
    zeg(f"\nStap 5 — ontdubbeld: {len(merken)} rijen -> {len(uniek)} unieke merken")
    if gesplitst:
        zeg(f"    {gesplitst} gescheiden gehouden op verschillende registratienaam")
    return uniek


# ---------------------------------------------------------------------------
# Stap 6 — tegen de database
# ---------------------------------------------------------------------------

def match(uniek, db):
    """Exact domein, dan domeinkern, dan naam mét domeinbevestiging.

    De domeinindex geeft een LIJST terug. Bij twee merken op één domein zijn dat twee
    kandidaten en geen willekeurige winnaar — zie testgevallen.py.
    """
    def web_van(b):
        return regels.domein((b.get("meta") or {}).get("_brand_website") or "")

    dom = regels.domein_index(db, web_van)
    kern, naam = defaultdict(list), defaultdict(list)
    for b in db:
        w = web_van(b)
        b["_web"] = w
        if w and not regels.is_platform(w) and len(regels.domeinkern(w)) >= 4:
            kern[regels.domeinkern(w)].append(b)
        k = regels.naamsleutel(b.get("brand_name") or "")
        if k:
            naam[k].append(b)

    for m in uniek:
        kand = {}
        for b in dom.get(m["website"], []):
            kand[b["id"]] = (b, "exact domein")
        if not kand and len(m.get("kern") or "") >= 4:
            for b in kern.get(m["kern"], []):
                kand.setdefault(b["id"], (b, "domeinkern, andere extensie"))
        if not kand and m["naamsleutel"]:
            for b in naam.get(m["naamsleutel"], []):
                g = ("naam + domeincorroboratie"
                     if b["_web"] and m["naamsleutel"] in regels.domeinkern(b["_web"]).replace("-", "")
                     else "naam")
                kand.setdefault(b["id"], (b, g))
        m["kandidaten"] = [
            {"id": b["id"], "naam": b["brand_name"], "web": b["_web"], "grond": g, "status": b["status"]}
            for b, g in kand.values()
        ]

    tel = Counter(
        "geen" if not m["kandidaten"] else ("een" if len(m["kandidaten"]) == 1 else "meervoudig")
        for m in uniek
    )
    zeg(f"\nStap 6 — tegen {len(db)} merken gehouden: {dict(tel)}")
    for m in uniek:
        if len(m["kandidaten"]) > 1:
            zeg(f"    meervoudig: {m['brand_name']!r} -> {[(c['id'], c['naam']) for c in m['kandidaten']]}")
    return uniek


# ---------------------------------------------------------------------------
# Stap 7 — wat er verandert, mét de bronsterkte- en datumregel
# ---------------------------------------------------------------------------

def wijzigingen(uniek, db, sleutel, bron, brondatum, niveau):
    db_op_id = {b["id"]: b for b in db}
    uit, tel = [], Counter()

    for m in uniek:
        if len(m["kandidaten"]) != 1:
            continue
        b = db_op_id.get(m["kandidaten"][0]["id"])
        if not b:
            continue
        meta = b.get("meta") or {}
        herkomst = haal_herkomst(b["id"], sleutel)

        for veld, sl in VELDEN.items():
            nieuw = (m.get(veld) or "").strip()
            huidig = str(meta.get(sl) or "").strip()
            if not nieuw:
                tel["bron leeg"] += 1
                continue
            if not huidig:
                tel["vult leeg veld"] += 1
                uit.append({"merk": b["brand_name"], "veld": veld, "huidig": "",
                            "nieuw": nieuw, "soort": "vult leeg veld", "reden": ""})
                continue
            if regels.vergelijkbaar(veld, nieuw, m.get("country", "")) == \
               regels.vergelijkbaar(veld, huidig, m.get("country", "")):
                tel["identiek of alleen notatie"] += 1
                continue
            if regels.verliest_detail(veld, huidig, nieuw):
                tel["tegengehouden: verlies van detail"] += 1
                uit.append({"merk": b["brand_name"], "veld": veld, "huidig": huidig, "nieuw": nieuw,
                            "soort": "NIET vervangen",
                            "reden": "bronwaarde is korter en zit in de bestaande waarde"})
                continue

            p = herkomst.get(veld, {})
            oud_niveau = sterkte_van(p.get("source"))
            oud_datum = p.get("source_date") or ""
            if niveau != oud_niveau:
                mag, reden = niveau < oud_niveau, f"bronsterkte {niveau} tegen {oud_niveau}"
            elif not oud_datum:
                mag, reden = True, "bestaande waarde heeft geen brondatum"
            else:
                mag, reden = brondatum > oud_datum, f"brondatum {brondatum} tegen {oud_datum}"

            tel["wordt vervangen" if mag else "tegengehouden: datumregel"] += 1
            uit.append({"merk": b["brand_name"], "veld": veld, "huidig": huidig, "nieuw": nieuw,
                        "soort": "wordt vervangen" if mag else "NIET vervangen", "reden": reden})

    zeg(f"\nStap 7 — wat er verandert aan bestaande merken:")
    for k, v in tel.most_common():
        zeg(f"    {v:5d}  {k}")
    return uit


def sterkte_van(bron_naam):
    if not bron_naam or bron_naam == "legacy":
        return 9
    if bron_naam == "research":
        return 4
    return 1


_herkomst_cache = {}


def haal_herkomst(brand_id, sleutel):
    if brand_id in _herkomst_cache:
        return _herkomst_cache[brand_id]
    kop = dict(KOP, **{"X-MD-Import-Key": sleutel})
    try:
        rq = urllib.request.Request(f"{CMS}/import/brands/{brand_id}", headers=kop)
        with urllib.request.urlopen(rq, timeout=30) as r:
            d = json.loads(r.read())
        uit = {p["field"]: p for p in (d.get("provenance") or [])}
    except Exception:
        uit = {}
    _herkomst_cache[brand_id] = uit
    return uit


# ---------------------------------------------------------------------------
# Stap 8 — toelating en de poorten
# ---------------------------------------------------------------------------

SCHOOL = ("hochschule", "universit", "university", "academie", "academy", "hogeschool",
          "college", "school", "faculteit", "faculty")
STICHTING = ("stichting", "foundation", "vereniging", "association", "museum")


def lees_oordelen(pad):
    """Eerder gegeven oordelen van Jeroen, zodat een vraag maar één keer wordt gesteld.

    Een oordeel is veldgesloten: het geldt voor elke volgende ronde en wordt er niet
    opnieuw uitgevraagd. Zonder dit register stond dezelfde vraag over i-did in twee
    achtereenvolgende rondes opnieuw op tafel, en werd wat op 1 september was beslist
    op 9 september alsnog anders gematcht.

    Sleutel is het domein of de genormaliseerde naam uit de bron. Waarde:

        {"besluit": "WEL"|"NIET", "brand_id": 54787|null,
         "website": "ntgrate.eu", "naam": "NTGRATE", "alias": "LEOXX",
         "reden": "...", "door": "Jeroen", "datum": "2026-09-09"}
    """
    if not pad:
        return {}
    p = Path(pad)
    if not p.exists():
        zeg(f"  oordelenregister {pad} bestaat niet — geen eerdere oordelen toegepast")
        return {}
    reg = json.loads(p.read_text(encoding="utf-8"))
    zeg(f"  oordelenregister: {len(reg)} eerdere oordelen")
    return reg


def pas_oordelen_toe(uniek, register):
    """Legt vastgelegde oordelen over de uitkomst heen, vóór de automatische besluiten."""
    if not register:
        return uniek, 0

    toegepast = 0
    for m in uniek:
        sleutels = [k for k in (m.get("website"), m.get("naamsleutel")) if k]
        for a in (m.get("alias") or "").split("; "):
            if a:
                sleutels.append(regels.naamsleutel(a))

        for sleutel in sleutels:
            o = register.get(sleutel)
            if not o:
                continue

            if o.get("naam"):
                m["brand_name"] = o["naam"]
                m["naamsleutel"] = regels.naamsleutel(o["naam"])
            if o.get("website"):
                m["website"] = o["website"]
                m["kern"] = regels.domeinkern(o["website"])
            if o.get("alias"):
                m["alias"] = o["alias"]

            if o.get("brand_id"):
                m["kandidaten"] = [c for c in m["kandidaten"] if c["id"] == o["brand_id"]] or [
                    {"id": o["brand_id"], "naam": o.get("naam", ""), "web": o.get("website", ""),
                     "grond": "handmatig", "status": "?"}
                ]
            elif o.get("besluit") == "WEL":
                # eigen merk: eerdere kandidaten waren de verkeerde
                m["kandidaten"] = []

            m["besluit"] = o.get("besluit", "")
            m["reden"] = f"{o.get('reden', 'oordeel')} — {o.get('door', 'Jeroen')}, {o.get('datum', '')}"
            m["oordeel_toegepast"] = sleutel
            toegepast += 1
            break

    zeg(f"    {toegepast} eerdere oordelen toegepast")
    return uniek, toegepast



# ---------------------------------------------------------------------------
# Stap 7b — aanvullen wat leeg is
#
# Dit ontbrak tot 09-09-2026, en dat is de reden dat elke ronde met de hand werd
# nagelopen en elke ronde net anders. Een leeg veld met een reden is geen eindstation
# maar een opzoektaak; blijft hij daarna leeg, dan staat er waarom.
# ---------------------------------------------------------------------------

AANVULBAAR = ("email", "phone", "website", "address_line_1", "postcode", "city", "country")

STAND = re.compile(r"^[A-Z]{1,4}\s?\d{1,3}[A-Za-z]?$")


def lees_catalogus(pad):
    """De catalogusindex: vaste blokken van naam, standnummer, adres, T, E en I.

    Bij MDU 2026 bleek dit het rijkste van de drie bestanden: het draagt algemene
    e-mailadressen waar de export een persoonlijk adres heeft, en complete adressen waar de
    export er geen heeft. Wordt alleen gebruikt om lege velden te vullen, nooit om iets te
    overschrijven — zie stap 7b.
    """
    if not pad:
        return []
    try:
        from docx import Document
    except ImportError:
        zeg("  LET OP  python-docx ontbreekt; de catalogus is NIET gelezen")
        return []
    if not Path(pad).exists():
        zeg(f"  LET OP  catalogus {pad} bestaat niet; NIET gelezen")
        return []

    regel = [p.text.strip() for p in Document(pad).paragraphs if p.text.strip()]
    uit, i = [], 0
    while i < len(regel):
        if i + 1 < len(regel) and STAND.match(regel[i + 1]):
            naam, stand, j, blok = regel[i], regel[i + 1], i + 2, []
            while j < len(regel) and not (j + 1 < len(regel) and STAND.match(regel[j + 1])):
                blok.append(regel[j])
                j += 1

            straat = pc = stad = land = tel = mail = web = ""
            for b in blok:
                if b.startswith("T "):
                    tel = b[2:].strip()
                elif b.startswith("E "):
                    mail = b[2:].strip()
                elif b.startswith("I "):
                    web = b[2:].strip()
                elif re.search(r",\s*[A-Z]{2}$", b):
                    kop, land = b.rsplit(",", 1)
                    land = land.strip()
                    pc, stad = regels.splits_postcode_stad(kop, land)
                else:
                    straat = (straat + " " + b).strip()

            w = regels.domein(web)
            uit.append({
                "naam": regels.schoonnaam(naam),
                "naamsleutel": regels.naamsleutel(naam),
                "stand": stand.replace(" ", ""),
                "address_line_1": straat,
                "postcode": regels.postcode(pc, land),
                "city": regels.kapitaliseer(stad),
                "country": regels.land(land) or land,
                "phone": regels.telefoon(tel, land)[0],
                "email": regels.email(mail),
                "website": "" if (w and regels.is_platform(w)) else w,
            })
            i = j
        else:
            i += 1

    zeg(f"  catalogusindex: {len(uit)} records gelezen")
    return uit

PADEN = ("", "contact", "contact-us", "over-ons", "kontakt", "impressum")


def haal_website(domein):
    """De eigen site van een merk, hooguit een paar pagina's.

    Een onbereikbare site is een toestand en geen bevinding: dan blijft het veld leeg met
    die reden erbij, zodat een volgende ronde het opnieuw probeert.
    """
    blob = ""
    for pad in PADEN:
        for url in (f"https://{domein}/{pad}", f"https://www.{domein}/{pad}"):
            try:
                rq = urllib.request.Request(url, headers={"User-Agent": KOP["User-Agent"]})
                with urllib.request.urlopen(rq, timeout=8) as r:
                    blob += r.read(200000).decode("utf-8", "ignore")
                break
            except Exception:
                continue
        if len(blob) > 250000:
            break
    return blob


def aanvullen(uniek, catalogus_op_naam):
    """Vult per merk elk leeg veld dat aangevuld kan worden, in drie ronden van goedkoop
    naar duur: eerst de catalogus, dan de eigen site, en anders blijft het leeg met reden.

    Geeft een telling terug zodat in de uitvoer staat hoeveel er leeg was, hoeveel is
    gevonden en hoeveel niet — anders is "leeg" niet te onderscheiden van "vergeten".
    """
    tel = Counter()
    leeg_vooraf = Counter()

    for m in uniek:
        if m.get("besluit") == "NIET":
            continue
        for v in AANVULBAAR:
            if not (m.get(v) or "").strip():
                leeg_vooraf[v] += 1

    # 1 — de catalogus, als die dit merk kent
    for m in uniek:
        if m.get("besluit") == "NIET":
            continue
        c = catalogus_op_naam.get(m.get("naamsleutel") or "")
        if not c:
            continue
        for v in AANVULBAAR:
            if (m.get(v) or "").strip() or not (c.get(v) or "").strip():
                continue

            # Wat aanvult moet door dezelfde poorten als wat uit de bron komt. Anders vult
            # stap 7b terug wat stap 4 er net heeft uitgehaald — precies wat er op
            # 09-09-2026 gebeurde: 41 persoonsgebonden adressen kwamen via de catalogus
            # weer op de merken terecht en poort 3 sloeg alsnog aan.
            waarde = c[v]

            if v == "email" and regels.is_persoonsgebonden(waarde, m.get("brand_name")):
                m["email_reden"] = "catalogus geeft een persoonsgebonden adres; niet op een merk"
                tel["catalogus geweigerd: persoonsgebonden adres"] += 1
                continue

            if v == "postcode" and not regels.postcode_bruikbaar(waarde, c.get("country") or m.get("country")):
                m["postcode_reden"] = f"catalogus geeft een onvolledige postcode: {waarde!r}"
                tel["catalogus geweigerd: halve postcode"] += 1
                continue

            if v == "address_line_1" and regels.straat_is_geen_straat(waarde, m.get("brand_name")):
                m["address_line_1_reden"] = "catalogus geeft de bedrijfsnaam in het straatveld"
                tel["catalogus geweigerd: naam in straatveld"] += 1
                continue

            m[v] = waarde
            m[v + "_bron"] = "catalogusindex"
            m[v + "_herkomst"] = "bestand"
            m.pop(v + "_reden", None)
            tel["uit de catalogus"] += 1

    # 2 — de eigen site, alleen voor wat daar te halen valt
    for m in uniek:
        if m.get("besluit") == "NIET" or not m.get("website"):
            continue
        mist_mail = not (m.get("email") or "").strip()
        mist_tel = not (m.get("phone") or "").strip()
        if not (mist_mail or mist_tel):
            continue

        blob = haal_website(m["website"])
        if not blob:
            for v in ("email", "phone"):
                if not (m.get(v) or "").strip():
                    m[v + "_reden"] = "site onbereikbaar; opnieuw proberen"
            tel["site onbereikbaar"] += 1
            continue

        if mist_mail:
            stam = regels.stam(m["website"])
            kand = {x.lower() for x in re.findall(r"[A-Za-z0-9._%+-]+@" + re.escape(stam), blob)}
            goed = sorted([e for e in kand if regels.is_algemeen_adres(e)], key=len)
            if goed:
                m["email"] = goed[0]
                m["email_bron"] = "research"
                m["email_herkomst"] = "opgezocht"
                m.pop("email_reden", None)
                tel["e-mailadres opgezocht"] += 1
            else:
                m["email_reden"] = "geen algemeen adres op de site gevonden"
                tel["e-mailadres niet gevonden"] += 1

        if mist_tel:
            t = re.search(r"(?:tel|phone|telefoon|t:)\D{0,12}(\+?[\d][\d\s().\-/]{7,20}\d)", blob, re.I)
            nummer, waarom = regels.telefoon(t.group(1), m.get("country", "")) if t else ("", "geen nummer op de site")
            if nummer:
                m["phone"] = nummer
                m["phone_bron"] = "research"
                m["phone_herkomst"] = "opgezocht"
                m.pop("phone_reden", None)
                tel["telefoon opgezocht"] += 1
            else:
                m["phone_reden"] = waarom or "geen bruikbaar nummer op de site"
                tel["telefoon niet gevonden"] += 1

    # 3 — wat nog leeg is krijgt een reden, zodat leeg nooit stil is
    leeg_achteraf = Counter()
    for m in uniek:
        if m.get("besluit") == "NIET":
            continue
        for v in AANVULBAAR:
            if not (m.get(v) or "").strip():
                leeg_achteraf[v] += 1
                if not m.get(v + "_reden"):
                    m[v + "_reden"] = "ontbreekt in de bron en niet gevonden"

    zeg("\nStap 7b — aanvullen wat leeg is")
    for wat, hoeveel in tel.most_common():
        zeg(f"    {hoeveel:4d}  {wat}")
    for v in AANVULBAAR:
        if leeg_vooraf[v]:
            zeg(f"    {v:16s} leeg vooraf {leeg_vooraf[v]:3d} -> na aanvullen {leeg_achteraf[v]:3d}")
    return uniek


def besluiten(uniek):
    for m in uniek:
        if m.get("oordeel_toegepast"):
            continue

        n = (m.get("brand_name") or "").lower()
        if any(s in n for s in SCHOOL):
            m["besluit"], m["reden"] = "NIET", "onderwijsinstelling — geen bedrijf"
        elif any(s in n for s in STICHTING):
            m["besluit"], m["reden"] = "NIET", "stichting of vereniging — geen bedrijf"
        elif len(m["kandidaten"]) == 1:
            c = m["kandidaten"][0]
            m["besluit"], m["reden"] = "WEL", f"bestaand merk {c['id']} ({c['grond']})"
        elif len(m["kandidaten"]) > 1:
            m["besluit"], m["reden"] = "", "meerdere kandidaten — oordeel Jeroen"
        elif m.get("website"):
            m["besluit"], m["reden"] = "WEL", "nieuw merk, identiteit aantoonbaar"
        else:
            m["besluit"], m["reden"] = "NIET", "geen eigen domein, btw of KvK — opzoektaak"
    tel = Counter(m.get("besluit") or "OORDEEL" for m in uniek)
    zeg(f"\nStap 8 — besluiten: {dict(tel)}")
    return uniek


def poorten(uniek, activiteiten):
    actief = [m for m in uniek if m.get("besluit") == "WEL"]
    fouten, let_op = [], []

    for veld, label in (("website", "domein"), ("email", "e-mailadres")):
        c = Counter((m.get(veld) or "").lower() for m in actief if m.get(veld))
        d = {k: v for k, v in c.items() if v > 1}
        if d:
            fouten.append(f"poort 2 — dubbel {label}: {d}")

    p = [m for m in actief if m.get("email") and regels.is_persoonsgebonden(m["email"], m.get("brand_name"))]
    if p:
        fouten.append(f"poort 3 — {len(p)} merken met een persoonsgebonden adres")

    z = [m for m in actief if not m.get("website")]
    if z:
        fouten.append(f"poort 4 — {len(z)} merken zonder website, btw of KvK")

    vorm = Counter()
    for m in actief:
        if m.get("phone") and not re.fullmatch(r"\+[1-9]\d{6,14}", m["phone"]):
            vorm["telefoon niet E.164"] += 1
        if m.get("country") and not re.fullmatch(r"[A-Z]{2}", m["country"]):
            vorm["land niet ISO-2"] += 1
        if m.get("country") == "NL" and m.get("postcode") and not re.fullmatch(r"\d{4} [A-Z]{2}", m["postcode"]):
            vorm["NL-postcode verkeerde vorm"] += 1
        if m.get("city") and m["city"].isupper() and len(m["city"]) > 3:
            vorm["plaats in kapitalen"] += 1
        if m.get("website") and regels.is_platform(m["website"]):
            vorm["platformdomein als identiteit"] += 1
        if m.get("address_line_1") and not re.search(r"\d", m["address_line_1"]):
            let_op.append(f"straat zonder huisnummer: {m['brand_name']} — {m['address_line_1']}")
    if vorm:
        fouten.append(f"poort 5 — {dict(vorm)}")

    if not activiteiten:
        fouten.append("poort 6 — geen activiteiten. Een ronde zonder logboek is geen ronde.")

    zeg("\nStap 8 — de zes poorten")
    zeg(f"    poort 1: {sum(1 for m in actief if any(k.endswith('_reden') for k in m))} merken dragen een reden bij een leeg veld")
    zeg(f"    poort 6: {len(activiteiten)} activiteiten")
    for w in let_op[:5]:
        zeg(f"    LET OP  {w}")
    for f in fouten:
        zeg(f"    ROOD    {f}")
    return fouten


# ---------------------------------------------------------------------------
# Stap 9 — opleveren
# ---------------------------------------------------------------------------

def lever(uniek, wijz, personen, ronde, uit_map):
    uit_map.mkdir(parents=True, exist_ok=True)
    stempel = ronde["editie"].lower().replace(" ", "")
    batch = f"{stempel}-{ronde['activiteit']}-01"

    merken = []
    for m in uniek:
        if m.get("besluit") != "WEL":
            continue
        velden = {}
        for veld, sl in VELDEN.items():
            w = (m.get(veld) or "").strip()
            if w:
                velden[veld] = {
                    "meta_key": sl, "waarde": w,
                    "bron": m.get(f"{veld}_bron", ronde["bron"]),
                    "brondatum": m.get(f"{veld}_brondatum", m.get("brondatum")),
                    "herkomst": m.get(f"{veld}_herkomst", "bestand"),
                }
        merken.append({
            "bron_excelrij": [str(x) for x in m["bron_rijen"]],
            "brand_id": m["kandidaten"][0]["id"] if len(m["kandidaten"]) == 1 else None,
            "post_title": m.get("brand_name") or "",
            "alias": m.get("alias") or "",
            "record_status": "active" if len(m["kandidaten"]) == 1 else "prospect",
            "post_status_bij_aanmaken": "draft",
            "velden": velden,
            "reden": m.get("reden", ""),
        })

    acts = [{
        "batch": batch, "subject_type": ronde["kant"],
        "subject_id": m["kandidaten"][0]["id"] if len(m["kandidaten"]) == 1 else None,
        "subject_sleutel": m.get("website") or m.get("brand_name"),
        "soort": ronde["activiteit"], "editie": ronde["editie"],
        "datum": ronde["brondatum"], "detail": "stand " + ", ".join(m.get("standen", [])),
        "zichtbaarheid": "geteld", "bron": ronde["bron"],
    } for m in uniek if m.get("besluit") == "WEL"]

    data = {
        "ronde": ronde["editie"],
        "gemeten_op_cms": ronde["gemeten"],
        "bron": ronde["bron"], "brondatum": ronde["brondatum"],
        "ingevuld_door": NIVEAU_NAAM[ronde["niveau"]],
        "batches": {"merken": batch, "activiteiten": batch},
        "merken": merken, "contacten": [], "activiteiten": acts,
    }
    (uit_map / f"import-{stempel}-data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

    with (uit_map / f"besluitenlog-{stempel}.csv").open("w", encoding="utf-8", newline="") as f:
        import csv
        w = csv.writer(f)
        w.writerow(["merk", "veld", "besluit", "reden", "staat", "bron"])
        for x in wijz:
            w.writerow([x["merk"], x["veld"], x["soort"], x["reden"], x["huidig"], x["nieuw"]])

    (uit_map / f"uniek-{stempel}.json").write_text(
        json.dumps(uniek, ensure_ascii=False), encoding="utf-8")

    zeg(f"\nStap 9 — opgeleverd in {uit_map}/")
    zeg(f"    import-{stempel}-data.json   {len(merken)} merken, {len(acts)} activiteiten, batch {batch}")
    zeg(f"    besluitenlog-{stempel}.csv   {len(wijz)} regels")
    zeg(f"    uniek-{stempel}.json         tussenstand, voor het werkboek")
    return data


# ---------------------------------------------------------------------------

def main():
    p = argparse.ArgumentParser(description="Draait één importronde volgens docs/importprotocol.md")
    p.add_argument("bronbestand")
    p.add_argument("--bron", required=True, help="welk bestand dit is, in woorden")
    p.add_argument("--brondatum", required=True, help="JJJJ-MM-DD, wanneer de gegevens geldig waren")
    p.add_argument("--editie", required=True, help='bijvoorbeeld "MDU 2024"')
    p.add_argument("--niveau", required=True, type=int, choices=[1, 2, 3, 4],
                   help="wie het invulde: 1 het bedrijf zelf, 2 een register, 3 wij, 4 opgezocht")
    p.add_argument("--activiteit", required=True, help="exposant, standbemanning, bezoeker_aanwezig, …")
    p.add_argument("--kant", required=True, choices=["merk", "persoon"])
    p.add_argument("--catalogus", help="optioneel: catalogusindex .docx")
    p.add_argument("--sleutel", help="MD_IMPORT_KEY; anders uit de omgeving MD_IMPORT_KEY")
    p.add_argument("--oordelen", help="JSON met eerder gegeven oordelen van Jeroen")
    p.add_argument("--uit", default="uitvoer")
    a = p.parse_args()

    import os
    sleutel = a.sleutel or os.environ.get("MD_IMPORT_KEY", "")
    if not sleutel:
        sys.exit("Geen importsleutel. Geef --sleutel of zet MD_IMPORT_KEY in de omgeving.")

    try:
        datetime.strptime(a.brondatum, "%Y-%m-%d")
    except ValueError:
        sys.exit(f"--brondatum {a.brondatum!r} is geen datum in de vorm JJJJ-MM-DD.")

    gemeten = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    zeg("=" * 72)
    zeg(f"Importronde {a.editie}")
    zeg(f"  bron          {a.bron}")
    zeg(f"  brondatum     {a.brondatum}")
    zeg(f"  ingevuld door {NIVEAU_NAAM[a.niveau]} (niveau {a.niveau})")
    zeg(f"  activiteit    {a.activiteit}, aan het {a.kant}")
    zeg(f"  gemeten op    {gemeten}")
    zeg("=" * 72)

    bron, namen = lees_bron(a.bronbestand)
    nulmeting(bron, namen)
    merken, personen = splits(bron, a.brondatum)
    poort_drie(merken)
    uniek = ontdubbel(merken)

    zeg("\nStap 6 — verse uitdraai ophalen")
    db = haal_merken(sleutel)
    uniek = match(uniek, db)

    wijz = wijzigingen(uniek, db, sleutel, a.bron, a.brondatum, a.niveau)
    uniek, _ = pas_oordelen_toe(uniek, lees_oordelen(a.oordelen))

    # Een adres dat bij meer dan één merk staat is van geen van die merken.
    opgeruimd = regels.deel_adressen_opruimen(
        uniek,
        lambda m: m.get("email"),
        lambda m: m.get("website"),
        lambda m, reden: (m.__setitem__("email_persoonlijk", m.get("email")),
                          m.__setitem__("email", ""),
                          m.__setitem__("email_reden", reden)),
    )
    if opgeruimd:
        zeg(f"    {opgeruimd} gedeelde e-mailadressen leeggemaakt met reden")

    # Een halve postcode is geen postcode.
    half = 0
    for m in uniek:
        if not regels.postcode_bruikbaar(m.get("postcode"), m.get("country")):
            m["postcode_reden"] = f"onvolledige postcode in de bron: {m['postcode']!r}"
            m["postcode"] = ""
            half += 1
    if half:
        zeg(f"    {half} onvolledige postcodes leeggemaakt met reden")

    uniek = besluiten(uniek)
    catalogus = lees_catalogus(a.catalogus)
    uniek = aanvullen(uniek, {c["naamsleutel"]: c for c in catalogus})

    ronde = {"bron": a.bron, "brondatum": a.brondatum, "editie": a.editie,
             "niveau": a.niveau, "activiteit": a.activiteit, "kant": a.kant,
             "gemeten": gemeten}
    acts = [m for m in uniek if m.get("besluit") == "WEL"]
    fouten = poorten(uniek, acts)

    data = lever(uniek, wijz, personen, ronde, Path(a.uit))

    zeg("")
    if fouten:
        zeg("ROOD — er is een poort gefaald. Het werkboek gaat niet naar Johan.")
        return 1
    zeg("GROEN — alle poorten doorstaan.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
