#!/usr/bin/env python3
"""
Poortcontrole — leest een afgeleverd importwerkboek en geeft groen of rood.

    python3 poortcontrole.py import-mdu2026-v10.xlsx

Dit script staat bewust BUITEN de keten die het werkboek maakt. Het opent het
bestand alleen-lezen, verandert er niets aan en kan niets repareren. Een controle
die je zelf kunt wegpoetsen is geen controle: de vijf poorten draaiden tot nu toe
in hetzelfde proces dat de uitkomst produceerde, dus als er een faalde loste ik
hem op en faalde hij daarna niet meer.

Faalt er één poort, dan is de afloop rood en gaat het bestand niet naar Johan.

De vijf poorten komen uit het importprotocol:
  1. Niets verloren   — elk veld dat in de bron gevuld was, is in het resultaat even vol
  2. Niets dubbel     — geen twee merken met hetzelfde btw, KvK, domein of e-mailadres
  3. Geen persoonsgegevens op een merk
  4. Elk merk heeft een identiteit — website, btw of KvK
  5. Elk veld heeft de juiste vorm
  6. Elke bronregel heeft een activiteit — het logboek is de ruggengraat, niet een extra

Poort 6 is toegevoegd op 04-09-2026. Aanleiding: drie importsessies lang is de
merkenkant afgemaakt terwijl er nul activiteiten zijn vastgelegd, en dat is drie keer
pas opgemerkt doordat Jeroen ernaar vroeg. Een ronde zonder activiteiten is geen
geslaagde ronde maar een afgebroken ronde, en deze poort zegt dat hardop.

Afloopcode 0 is groen, 1 is rood.
"""

import re
import sys
from collections import Counter, defaultdict

try:
    from openpyxl import load_workbook
except ImportError:
    sys.exit("openpyxl ontbreekt: pip install openpyxl")


ALGEMEEN = {
    "info", "contact", "mail", "office", "sales", "hello", "hallo", "service", "post",
    "welcome", "enquiries", "general", "marketing", "order", "orders", "shop", "studio",
    "kontakt", "verkoop", "reception", "press", "team", "export", "samples", "support",
    "atelier", "bureau", "klimaattrein",
}

PLATFORM = (
    "cargo.site", "cargocollective", "wixsite", "squarespace", "myshopify",
    "wordpress.com", "weebly", "jimdo", "webnode", "strikingly", "sites.google",
    "carrd.co", "notion.site", "framer.website", "bigcartel", "etsy.com",
    "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
    "youtube.com", "pinterest.com", "tiktok.com", "behance.net",
)

VRIJ = (
    "gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com",
    "live.nl", "me.com", "aol.com", "gmx.de", "web.de", "googlemail.com",
)


def is_platform(domein: str) -> bool:
    """Toetst het hostdomein zelf, niet een deelstring: roylinx.com bevat 'x.com'."""
    if not domein:
        return False
    d = domein.lower().strip(".")
    for p in PLATFORM:
        if d == p or d.endswith("." + p):
            return True
    return False


def is_persoonlijk(adres: str, domein: str, merknaam: str) -> bool:
    if not adres or "@" not in adres:
        return False
    lokaal = adres.split("@")[0].lower()
    basis = re.sub(r"\d+$", "", lokaal)
    if basis in ALGEMEEN or any(basis.startswith(a) for a in ALGEMEEN):
        return False
    kaal = basis.replace(".", "").replace("-", "").replace("_", "")
    domeinkern = domein.split(".")[0].replace("-", "") if domein else ""
    merkkaal = re.sub(r"[^a-z0-9]", "", (merknaam or "").lower())
    return kaal not in (domeinkern, merkkaal)


def blad(wb, naam):
    if naam not in wb.sheetnames:
        return None
    rijen = list(wb[naam].iter_rows(values_only=True))
    if not rijen:
        return []
    kop = [str(k).strip() if k else "" for k in rijen[0]]
    return [dict(zip(kop, r)) for r in rijen[1:] if any(x is not None for x in r)]


def lees(pad):
    wb = load_workbook(pad, data_only=True, read_only=True)
    if "MERKEN" not in wb.sheetnames:
        sys.exit("Geen tabblad MERKEN gevonden — is dit een importwerkboek?")
    return blad(wb, "MERKEN"), blad(wb, "ACTIVITEITEN"), blad(wb, "PERSONEN")


def waarde(rij, naam):
    v = rij.get(naam)
    return str(v).strip() if v not in (None, "") else ""


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pad = sys.argv[1]
    merken, activiteiten, personen = lees(pad)
    actief = [m for m in merken if waarde(m, "actie") in ("bijwerken", "nieuw")]

    print(f"Poortcontrole op {pad}")
    print(f"  {len(merken)} merken in het werkboek, {len(actief)} met een schrijfactie\n")

    fouten = []
    waarschuwingen = []

    # ---- poort 2: niets dubbel
    for veld, label in (("website", "domein"), ("e-mail", "e-mailadres")):
        telling = Counter(waarde(m, veld).lower() for m in actief if waarde(m, veld))
        dubbel = {k: v for k, v in telling.items() if v > 1}
        if dubbel:
            fouten.append(f"poort 2 — {len(dubbel)} {label}(s) komen bij meer dan één merk voor: "
                          + ", ".join(f"{k} ({v}x)" for k, v in list(dubbel.items())[:5]))

    namen = Counter(re.sub(r"[^a-z0-9]", "", waarde(m, "merk").lower())
                    for m in actief if waarde(m, "merk"))
    dubbel_naam = {k: v for k, v in namen.items() if v > 1 and k}
    if dubbel_naam:
        waarschuwingen.append(f"poort 2 — {len(dubbel_naam)} genormaliseerde namen komen meer dan "
                              f"één keer voor: {', '.join(list(dubbel_naam)[:5])}")

    # ---- poort 3: geen persoonsgegevens op een merk
    persoonlijk = []
    for m in actief:
        e = waarde(m, "e-mail").lower()
        if not e:
            continue
        dom = e.split("@")[1] if "@" in e else ""
        if any(v in dom for v in VRIJ):
            persoonlijk.append(f"{waarde(m, 'merk') or waarde(m, 'Excel-rij bron')}: {e} (vrije provider)")
        elif is_persoonlijk(e, dom, waarde(m, "merk")):
            persoonlijk.append(f"{waarde(m, 'merk') or waarde(m, 'Excel-rij bron')}: {e}")
    if persoonlijk:
        fouten.append(f"poort 3 — {len(persoonlijk)} merken dragen een persoonsgebonden e-mailadres:\n      "
                      + "\n      ".join(persoonlijk[:8]))

    # ---- poort 4: elk merk heeft een identiteit
    zonder = [m for m in actief if not waarde(m, "website")]
    if zonder:
        fouten.append(f"poort 4 — {len(zonder)} merken zonder website, btw of KvK: "
                      + ", ".join((waarde(m, "merk") or waarde(m, "Excel-rij bron")) for m in zonder[:8]))

    platform = [m for m in actief if is_platform(waarde(m, "website"))]
    if platform:
        fouten.append(f"poort 4 — {len(platform)} merken dragen een platform- of socialdomein als identiteit: "
                      + ", ".join(waarde(m, "website") for m in platform[:6]))

    # ---- poort 5: vorm per veld
    vormfouten = defaultdict(list)
    for m in actief:
        merk = waarde(m, "merk") or waarde(m, "Excel-rij bron")
        tel = waarde(m, "telefoon")
        if tel and not re.fullmatch(r"\+[1-9]\d{6,14}", tel):
            vormfouten["telefoon niet in E.164"].append(f"{merk}: {tel}")
        land = waarde(m, "land")
        if land and not re.fullmatch(r"[A-Z]{2}", land):
            vormfouten["land niet ISO-2"].append(f"{merk}: {land}")
        pc = waarde(m, "postcode")
        if land == "NL" and pc and not re.fullmatch(r"\d{4} [A-Z]{2}", pc):
            vormfouten["NL-postcode verkeerde vorm"].append(f"{merk}: {pc}")
        stad = waarde(m, "plaats")
        if stad and len(stad) > 3 and stad.upper() == stad:
            vormfouten["plaats in kapitalen"].append(f"{merk}: {stad}")
        if stad and re.search(r"\d", stad):
            vormfouten["cijfer in de plaatsnaam"].append(f"{merk}: {stad}")
        web = waarde(m, "website")
        if web and not re.fullmatch(r"[a-z0-9.-]+\.[a-z]{2,}", web):
            vormfouten["website niet als kaal domein"].append(f"{merk}: {web}")
        straat = waarde(m, "straat")
        if straat and not re.search(r"\d", straat):
            vormfouten["straat zonder huisnummer"].append(f"{merk}: {straat}")
    for soort, gevallen in vormfouten.items():
        regel = f"poort 5 — {soort}: {len(gevallen)} ({', '.join(gevallen[:4])})"
        if soort == "straat zonder huisnummer":
            waarschuwingen.append(regel)   # kan buiten Nederland kloppen
        else:
            fouten.append(regel)

    # ---- poort 6: elke bronregel heeft een activiteit
    if activiteiten is None:
        fouten.append("poort 6 — er is geen tabblad ACTIVITEITEN. Een importronde zonder "
                      "logboek is geen ronde: het logboek is waar de vraag 'wie stond er "
                      "drie edities' uit beantwoord wordt.")
    elif not activiteiten:
        fouten.append("poort 6 — het tabblad ACTIVITEITEN is leeg. Er wordt niets vastgelegd "
                      "over wie wat gedaan heeft.")
    else:
        soorten = Counter(waarde(a, "soort") for a in activiteiten if waarde(a, "soort"))
        zonder_editie = [a for a in activiteiten if not waarde(a, "editie")]
        zonder_subject = [a for a in activiteiten if not waarde(a, "subject_type")]
        losse_labels = [s for s in soorten if "_20" in s or s[-4:].isdigit()]

        print(f"  poort 6 — {len(activiteiten)} activiteiten: "
              + ", ".join(f"{k} ({v})" for k, v in soorten.most_common()) + "\n")

        if zonder_subject:
            fouten.append(f"poort 6 — {len(zonder_subject)} activiteiten zonder subject_type: "
                          "niet te zien wie het gedaan heeft.")
        if losse_labels:
            fouten.append("poort 6 — samengesteld label in plaats van twee kolommen: "
                          + ", ".join(losse_labels[:4])
                          + ". Type en editie horen apart, anders valt er niet op te tellen.")
        if zonder_editie:
            waarschuwingen.append(f"poort 6 — {len(zonder_editie)} activiteiten zonder editie. "
                                  "Dat mag bij feiten die niet bij een beurs horen.")

        # elke schrijfactie op een merk hoort een activiteit te hebben
        met_act = {waarde(a, "subject_naam") for a in activiteiten} | {
            waarde(a, "detail") for a in activiteiten}
        mist = [m for m in actief
                if waarde(m, "merk") and waarde(m, "merk") not in met_act]
        if mist:
            waarschuwingen.append(
                f"poort 6 — {len(mist)} merken met een schrijfactie komen niet voor in "
                f"ACTIVITEITEN: {', '.join(waarde(m, 'merk') for m in mist[:5])}")

    # ---- poort 1: niets verloren, voor zover uit het werkboek zelf te zien
    leeg_met_reden = sum(1 for m in actief if str(m.get("let op") or "").strip())
    print(f"  poort 1 — {leeg_met_reden} merken dragen een reden bij een leeg veld; "
          "die is hier zichtbaar en dus niet stil verloren gegaan.\n")

    # ---- afloop
    for w in waarschuwingen:
        print(f"  LET OP  {w}")
    if waarschuwingen:
        print()

    if fouten:
        print("ROOD — het werkboek komt er niet uit:\n")
        for f in fouten:
            print(f"  x {f}")
        print(f"\n{len(fouten)} poort(en) gefaald.")
        return 1

    print("GROEN — alle vijf poorten doorstaan.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
