# WP Engine — cache & bot protection (launch note)

**Datum:** 29 juli 2026  
**Doel:** wat WP Engine al dekt richting launch, en wat er nog bovenop moet — met
nadruk op API-paden die Vercel blijft aanroepen.

## Wat elk plan al heeft (Advanced Network)

Op alle WP Engine-plannen zit **Advanced Network** (Cloudflare):

| Laag | Dekking |
|------|---------|
| CDN | Statische assets (JS/CSS/images), lange TTL (~365 dagen) |
| DDoS | Layer 3 & 4 |
| Edge Full Page Cache (EFPC) | HTML/JSON aan de edge (default aan sinds voorjaar 2026) |
| Image polish | Lossless compressie via Cloudflare |
| Page cache | Varnish op origin |
| Object cache | Redis/Memcached (standaard op WPE; verifiëren in portal) |

`/wp-json` is bij WP Engine **normaal uitgesloten van page-cache** (zie ook
`rest-headless-cors.php`), maar **EFPC kan JSON wél cachen** tenzij headers /
regels dat verhinderen. Auth-responses moeten daarom `Cache-Control: private,
no-store` blijven zetten (zoals dashboard/embed al doen).

## Wat er extra bij moet: Global Edge Security (GES)

**GES is een betaalde add-on**, niet standaard op elk plan. Die brengt:

- Managed **WAF** (Cloudflare managed rulesets)
- Advanced DDoS
- **Bot management** (AI-crawlers, malicious bots, category/region rules,
  Instant Lockdown / “Under Attack”)
- Zelfde CDN-laag, met strengere security-default

Zonder GES heb je CDN + basis-DDoS, maar **geen** vergelijkbare WAF/bot-tooling
uit de doos. Voor launch-hardening: in de WP Engine-portal checken of GES al
aan staat op production; zo niet, offerte/Account Manager.

## Vercel → WordPress API: uitzonderingen

Strenge bot-challenges (Managed Challenge / JS challenge / Under Attack) mogen
**niet** de headless API blokkeren. Vercel (Frankfurt) belt o.a.:

- `/wp-json/wp/v2/*` (content)
- `/wp-json/md/v2/*` (auth, dashboard, follows, talk embed, …)
- `/wp-json/wc/store/v1/*` (cart/checkout)
- FacetWP (zolang die nog leeft): `/facetwp/v1/fetch`

**Aanbevolen vóór harde challenges aanzetten:**

1. Allowlist van Vercel egress / bekende server-IPs **of** rules die
   `Authorization: Bearer|Basic` + User-Agent van de Next-server overslaan.
2. Nooit “Under Attack” globaal zonder API-bypass — Store API + JWT-login vallen
   dan om.
3. GES-custom rules zijn beperkt (WP Engine beheert Cloudflare); uitzonderingen
   via **WP Engine Support / Account Manager**, niet zelf in Cloudflare-dashboard.
4. Smoke na elke security-wijziging: homepage ISR fetch, `/api/auth/login`,
   cart merge, dashboard profile, talk embed voor Insider.

## Wat wij zelf al doen (bovenop WPE)

- XML-RPC uit (`md-disable-xmlrpc`)
- Auth rate limits op login/register
- Gevoelige brand-meta gescrubd uit publieke REST
- Talk `vimeo_id` alleen via JWT-embed voor Insiders
- Classic CMS-registratie dicht; OAuth + `/md/v2/auth/register`

## Checklist richting launch

- [ ] Portal: Advanced Network actief op production?
- [ ] Portal: GES aan of niet? Zo nee — nodig vóór launch of acceptabel risico?
- [ ] Object cache healthy (hit rate)?
- [ ] Als bot-challenges aan: API-paden hierboven uitgezonderd + rooktest Vercel
- [ ] Geen EFPC op authenticated `/md/v2/*` (controleer response headers)
- [ ] Purge-strategie bekend (wp-admin + WPE API) na content-cutover
