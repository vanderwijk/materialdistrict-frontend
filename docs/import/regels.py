"""
regels.py — alle normalisatie- en vergelijkingsregels op één plek.
"""

import re, unicodedata
LAND={'nederland':'NL','netherlands':'NL','the netherlands':'NL','holland':'NL','belgie':'BE','belgië':'BE',
 'belgium':'BE','duitsland':'DE','germany':'DE','deutschland':'DE','united kingdom':'GB','great britain':'GB',
 'verenigd koninkrijk':'GB','united states':'US','usa':'US','frankrijk':'FR','france':'FR','italy':'IT',
 'italie':'IT','italië':'IT','spain':'ES','spanje':'ES','denmark':'DK','sweden':'SE','finland':'FI',
 'austria':'AT','switzerland':'CH','portugal':'PT','poland':'PL','ireland':'IE','norway':'NO','czech republic':'CZ'}
def is_platform(d):
    """Toetst het hostdomein zelf, niet een deelstring: roylinx.com bevat 'x.com'."""
    if not d: return False
    d=d.lower().strip('.')
    for p in PLATFORM+SOCIAL:
        p=p.strip('.')
        if d==p or d.endswith('.'+p) or ('.' not in p and p in d.split('.')):
            return True
    return False

PLATFORM=('cargo.site','cargocollective','wixsite','squarespace','myshopify','wordpress.com','weebly','jimdo','webnode','strikingly','sites.google','carrd.co','notion.site','framer.website','bigcartel','etsy.')
SOCIAL=('facebook.','instagram.','linkedin.','twitter.','x.com','youtube.','pinterest.','tiktok.','behance.')
VRIJ=('gmail.','hotmail.','outlook.','yahoo.','icloud.','live.','me.com','aol.','gmx.','web.de','ziggo.','kpnmail.','telenet.')

def s(v):
    if v is None: return ''
    return re.sub(r'\s+',' ',str(v)).strip()

def email(v):
    v=s(v).lower().strip('.,;:<>()[]')
    if '@' not in v: return ''
    if re.match(r'^(noreply|no-reply|donotreply|postmaster|mailer-daemon|example|test)@', v): return ''
    return v

def domein(v):
    v=s(v).lower()
    if not v: return ''
    v=re.sub(r'^https?://','',v); v=re.sub(r'^www\.','',v)
    v=v.split('/')[0].split('?')[0].split(':')[0].strip('.')
    return v if re.match(r'^[a-z0-9.-]+\.[a-z]{2,}$', v) else ''

def stam(d):
    if not d: return ''
    deel=d.split('.')
    if len(deel)>2 and deel[-2] in ('co','com','ac','org','net','gov','edu') and len(deel[-1])==2:
        return '.'.join(deel[-3:])
    return '.'.join(deel[-2:])

def telefoon(v, land=''):
    v=s(v)
    if not v: return '', ''
    if re.search(r'[,;]|/\s*\d{4,}', v): return '', 'meerdere nummers in een veld'
    v=v.lstrip("'")
    v=re.sub(r'\(\s*0\s*\)','',v)          # de nationale nul tussen haakjes hoort niet in E.164
    v=re.sub(r'[^\d+]','',v)

    if v.startswith('00'): v='+'+v[2:]
    if not v.startswith('+'):
        pre={'NL':'31','BE':'32','DE':'49','GB':'44','FR':'33','IT':'39','ES':'34','US':'1','AT':'43',
             'CH':'41','DK':'45','SE':'46','FI':'358','PT':'351','PL':'48','IE':'353','NO':'47','CZ':'420'}.get(land)
        if not pre: return '', 'geen landcode af te leiden'
        v='+'+pre+v.lstrip('0')
    v='+'+re.sub(r'\D','',v)
    # nationale nul direct na een bekende landcode hoort niet in E.164
    CC=('1','7','20','27','30','31','32','33','34','36','39','40','41','43','44','45','46','47','48',
        '49','51','52','54','55','56','57','58','60','61','62','63','64','65','66','81','82','84','86',
        '90','91','98','212','213','216','218','220','233','234','254','255','256','260','263','264',
        '351','352','353','354','355','356','357','358','359','370','371','372','373','374','375','376',
        '377','380','381','385','386','387','389','420','421','423','852','853','886','961','962','966',
        '971','972','973','974','975','976','977','992','994','995','998')
    for c in sorted(CC, key=len, reverse=True):
        if v.startswith('+'+c+'0'):
            v='+'+c+v[len(c)+2:]
            break
    return (v,'') if re.fullmatch(r'\+[1-9]\d{6,14}', v) else ('', 'onbruikbaar nummer')

def land(v):
    v=s(v)
    if re.fullmatch(r'[A-Za-z]{2}', v): return v.upper()
    return LAND.get(v.lower(),'')

def postcode(v, l=''):
    v=s(v).upper().replace('  ',' ')
    if l=='NL':
        m=re.fullmatch(r'(\d{4})\s*([A-Z]{2})', v)
        if m: return f"{m.group(1)} {m.group(2)}"
    return v

def kapitaliseer(v):
    v=s(v)
    if not v: return ''
    if v.upper()==v and len(v)>3:
        klein={'van','de','der','den','ter','te','op','aan','het','en','of','the'}
        d=[]
        for i,w in enumerate(v.lower().split()):
            d.append(w if (i and w in klein) else (w[:1].upper()+w[1:]))
        v=' '.join(d)
        v=re.sub(r"\b(s)-(\w)", lambda m: "'s-"+m.group(2).upper(), v)
    return v

RECHTS=r'\b(b\.?v\.?|n\.?v\.?|gmbh|mbh|ltd\.?|limited|inc\.?|llc|s\.?r\.?l\.?|srl|s\.?a\.?s?\.?|ag|oy|ab|a/s|aps|kg|plc|sp\.? z o\.?o\.?|bvba|vof|cv)\b'
def naamsleutel(v):
    v=s(v).lower().replace('&amp;','&')
    v=unicodedata.normalize('NFKD',v).encode('ascii','ignore').decode()
    v=re.sub(RECHTS,' ',v)
    return re.sub(r'[^a-z0-9]','',v)

def schoonnaam(v):
    v=s(v).replace('&amp;','&').replace('&nbsp;',' ')
    return re.sub(r'\s+',' ',v).strip(' ,;-')


# ---------------------------------------------------------------------------
# Regels die per ronde fout gingen en daarom hier staan
# ---------------------------------------------------------------------------

HUISNR = re.compile(r'^\d+\s*[a-zA-Z]?$')
CIJFER = re.compile(r'\d')
ROMMEL = re.compile(r"^['\"\-\.\s]+$")
LANDNAAM = set(LAND.keys()) | {'netherlands', 'nederland'}


def adres_opschonen(rec):
    """Zet de twee adresregels recht. Zes patronen, gemeten op MDU 2025 en 2026.

    Ontbrak in de 2025-ronde omdat die een eigen script had. Daarom staat hij hier.
    Geeft een lijst met wat er is veranderd, zodat het in het werkboek zichtbaar is.
    """
    log = []
    a1 = (rec.get('address_line_1') or '').strip()
    a2 = (rec.get('address_line_2') or '').strip()

    if a1.lower() in LANDNAAM and a2:
        deel = [x.strip() for x in a2.split(',')]
        rec['address_line_1'], rec['address_line_2'] = deel[0], ', '.join(deel[1:])
        log.append('bronregel verschoven: land stond in de straatregel')
        a1, a2 = rec['address_line_1'], rec['address_line_2']

    if a2:
        if a2.lower() == a1.lower() or a2.lower() in a1.lower():
            rec['address_line_2'] = ''
            log.append(f'regel 2 herhaalde regel 1 ({a2!r})')
        elif HUISNR.match(a2) and not CIJFER.search(a1):
            rec['address_line_1'] = f'{a1} {a2}'
            rec['address_line_2'] = ''
            log.append(f'huisnummer stond apart: {a1!r} + {a2!r}')
        elif a2.lower() == (rec.get('city') or '').lower():
            rec['address_line_2'] = ''
            log.append('regel 2 was de plaatsnaam')
        elif HUISNR.match(a2) and CIJFER.search(a1):
            log.append(f'regel 2 bevat een los nummer ({a2}) terwijl regel 1 al een huisnummer heeft')

    for veld in ('address_line_1', 'address_line_2', 'city', 'postcode'):
        v = (rec.get(veld) or '').strip()
        if v and ROMMEL.match(v):
            rec[veld] = ''
            log.append(f'{veld}: bronwaarde {v!r} is geen waarde')

    c = (rec.get('city') or '').strip()
    if ',' in c:
        deel = [x.strip() for x in c.split(',')]
        if deel[-1].lower() in LANDNAAM:
            rec['city'] = deel[0]
            log.append(f'land uit de plaatsnaam gehaald: {c!r}')

    return log


def verliest_detail(veld, huidig, nieuw):
    """Nieuw is korter en zit in huidig: verlies van detail, geen update.

    'Industriëlaan 97a' mag niet worden overschreven door 'Industriëlaan 97', ook niet
    als de bron sterker is. Gevonden in de 2025-ronde, 04-09-2026.
    """
    if veld not in ('address_line_1', 'address_line_2', 'city', 'postcode'):
        return False
    a = re.sub(r'[^a-z0-9]', '', (huidig or '').lower())
    b = re.sub(r'[^a-z0-9]', '', (nieuw or '').lower())
    return bool(b) and a.startswith(b) and len(a) > len(b)


def vergelijkbaar(veld, waarde, land=''):
    """De vorm waarin twee waarden met elkaar vergeleken worden."""
    v = (waarde or '').strip()
    if not v:
        return ''
    if veld == 'website':
        return domein(v)
    if veld == 'phone':
        return telefoon(v, land)[0] or re.sub(r'\D', '', v)
    if veld == 'postcode':
        return re.sub(r'[\s-]', '', v).upper()
    if veld == 'email':
        return v.lower()
    if veld in ('city', 'address_line_1', 'address_line_2'):
        return re.sub(r'[^a-z0-9]', '', v.lower())
    return v.lower().strip()


ALGEMEEN = {
    'info', 'contact', 'mail', 'office', 'sales', 'hello', 'hallo', 'service', 'post',
    'welcome', 'general', 'marketing', 'order', 'orders', 'shop', 'studio', 'kontakt',
    'verkoop', 'reception', 'press', 'team', 'export', 'samples', 'support', 'enquiries',
    'atelier', 'bureau', 'anfrage', 'infos', 'webshop', 'vente', 'ventas',
}


def is_algemeen_adres(e):
    if not e or '@' not in e:
        return False
    lokaal = re.sub(r'\d+$', '', e.split('@')[0].lower())
    return lokaal in ALGEMEEN or any(lokaal.startswith(a) for a in ALGEMEEN)


def is_persoonsgebonden(e, merknaam=''):
    """Hoort dit adres bij een mens? Dan mag het niet op een merk (poort 3)."""
    if not e or '@' not in e:
        return False
    lokaal, dom = e.lower().split('@', 1)
    if any(v in dom for v in VRIJ):
        return True
    if is_algemeen_adres(e):
        return False
    kaal = re.sub(r'\d+$', '', lokaal).replace('.', '').replace('-', '').replace('_', '')
    return kaal not in (stam(dom).split('.')[0].replace('-', ''), naamsleutel(merknaam or ''))


def domeinkern(d):
    """Het label zonder extensie: burnedwood.nl en burnedwood.com hebben dezelfde kern."""
    return stam(d).split('.')[0] if d else ''


# ---------------------------------------------------------------------------
# Schema-afspraken. Gemeten waarden, geen aannames.
#
# Afgesproken met Johan op 09-09-2026, nadat een migratie live faalde doordat er een
# hele zin in `grond` werd geschreven terwijl die kolom VARCHAR(16) is.
# ---------------------------------------------------------------------------

GROND = ('domein', 'domeinstam', 'naam', 'handmatig', 'registratie')

ROL = ('medewerker', 'contactpersoon', 'commercieel contact',
       'lead routing', 'factuurcontact', 'beheerder')

#: Kolombreedtes op wp_md_user_brand, gemeten met SHOW COLUMNS.
KOLOMBREEDTE = {
    'rol': 32,
    'rol_detail': 32,
    'grond': 16,
    'bewijs': 191,
    'bron': 191,
}


def controleer_grond(waarde):
    """De korte reden. Lange uitleg hoort in `bewijs` of `bron`."""
    if waarde not in GROND:
        raise ValueError(
            f'grond {waarde!r} staat niet in de gesloten lijst {GROND}. '
            'Een uitleg hoort in bewijs of bron, niet hier.'
        )
    return waarde


def controleer_rol(waarde):
    if waarde not in ROL:
        raise ValueError(f'rol {waarde!r} staat niet in de gesloten lijst {ROL}.')
    return waarde


def past_in_kolom(kolom, waarde):
    """Toets aan de gemeten breedte, niet aan wat het veld heet."""
    breedte = KOLOMBREEDTE.get(kolom)
    return breedte is not None and len(str(waarde or '')) <= breedte


def domein_index(merken, domein_van, is_platform_check=True):
    """Domein -> lijst merken. Nooit een enkelvoudige map.

    Op 09-09-2026 gebruikte de matcher een gewone dict. Bij twee merken op één domein
    won daardoor willekeurig de laatste: bij i-did.nl koos hij Sylvia Calvo in plaats van
    I-did, terwijl daar een besluit over lag. Een domein draagt vaker dan je denkt meer
    dan één merk — 81 domeinen in de database doen dat — dus dit is een lijst.
    """
    uit = {}
    for m in merken:
        d = domein_van(m)
        if not d:
            continue
        if is_platform_check and is_platform(d):
            continue
        uit.setdefault(d, []).append(m)
    return uit
