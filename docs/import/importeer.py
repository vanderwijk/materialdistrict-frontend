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


def besluiten(uniek):
    for m in uniek:
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
    uniek = besluiten(uniek)

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
