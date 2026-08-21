# Claude REST-hardening zip (29-07) — verwerkt

Bron: `rest-hardening-29-07.zip` (mu-plugin + LEESMIJ bij Claude’s mail).

## Wat we overnamen

| Idee | Waar |
|------|------|
| Lead CPT uit publieke REST / geen publieke permalinks | `cpt-lead.php` (`public`/`publicly_queryable`/`show_in_rest` = false) |
| Belt-and-braces: `/wp/v2/lead*` endpoints unsetten | `includes/md-rest-hardening.php` |
| ACF-video-keys scrubben op talk-responses | zelfde file |
| `meta.has_video` zonder ID prijs te geven | zelfde file |

## Wat we bewust níet overnamen

De mu-plugin `md-rest-hardening.php` als drop-in:

1. **Viewer-based `rest_prepare_talk`** — zou Insiders via JWT wél het ID in `/wp/v2/talk` geven, maar Next.js SSR belt met application-password (vaak editor). Dan lekken ID’s weer in page source/JSON-LD. Onze fix: publieke REST null’t `vimeo_id` altijd bij `insider_only`; playback via `GET /md/v2/talks/{id}/embed` (JWT + bestaande `md_insider_get_user_membership_payload`).
2. **Open filter `md_user_is_insider`** — membershipmodel stond al in de plugin; geen TODO meer.
3. **Taxonomie/testrecord-commando’s in LEESMIJ** — op CMS al uitgevoerd (rename + descriptions; drafts 133915/137173/137213 weg).

## Vimeo-account (nog ops)

Privacy “alleen embedden op materialdistrict.com” blijft een handmatige accountstap — zie Claude’s LEESMIJ punt 2a.
