# Johan-spec — Brand company-film + brand downloads

> **Status: ✅ geïmplementeerd (29 mei 2026).** Beide velden zijn live in de
> WP-REST-response van het brand-CPT:
> - `meta.video_url` — string, `""` als leeg. Registratie + exposure in
>   `rest-post-meta.php` (`md_register_post_meta_for_rest` +
>   `md_extend_brand_rest_meta`).
> - `meta.downloads` — array van `{ type, url, title, file_size, insider_only }`,
>   altijd aanwezig (`[]` als leeg), genormaliseerd via
>   `md_normalize_rest_downloads()`. `type` is de 5-waarden-ENUM met `other` als
>   vangnet; `file_size` is integer (bytes) of `null`; `insider_only` boolean
>   (default `false`).
>
> Geen admin-UI (komt via het brand-dashboard); test-content vullen kan via
> WP-CLI (`wp post meta update <id> downloads '[…]' --format=json`).
> Deploy-status: zie `deploy-checklist-johan-brands.md` S5.2 + S5.3.

---

> Frontend-zijde Brands (sessie 5) is af. De velden bestaan al in de DB
> (afspraak: admin-UI komt later via brand-dashboard). Dit document
> specificeert wat de frontend nodig heeft in de REST-response zodra het
> tijd is om de velden te ontsluiten, zodat de blokken op de brand-detail-
> pagina automatisch verschijnen zodra er content is.
>
> Opzet sluit 1-op-1 aan op de bestaande, werkende patronen:
> - `brand.video_url` volgt `material.video_url`
> - `brand.downloads[]` volgt `material.brochures[]` (zie
>   `database-uitbreidingen-instructie-johan.md` §C4)

---

## 1. Brand company-film

### Wat de frontend nodig heeft

Eén veld in `brand.meta` met de URL van de company-film. Vrije URL —
zowel Vimeo als YouTube (en eventueel andere providers later) moeten
ondersteund worden, dus géén losse ID-velden per provider.

```json
{
  "id": 123,
  "slug": "obro-bv",
  "title": { "rendered": "OBRO B.V." },
  "meta": {
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

### Specificatie

| Veld | Type | Verplicht | Default |
|---|---|---|---|
| `video_url` | string (URL) | nee | `null` of `""` |

- **Veldnaam:** `video_url` (kale string, geen `_brand_video_*`-prefix in de output — consistent met `material.video_url`).
- **Vorm:** volledige URL naar de video-pagina bij de provider. De frontend detecteert provider en bouwt de juiste embed-URL.
- **Ondersteunde providers (frontend-zijde):** YouTube (`youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/embed/…`) en Vimeo (`vimeo.com/123456`, `player.vimeo.com/video/123456`). Andere providers tonen niets — graceful fallback.
- **Leeg/onbekend:** lege string `""` of `null`. De frontend behandelt beide hetzelfde.
- **Exposure:** `register_post_meta('brand', 'video_url', [...])` met `show_in_rest => true` en `auth_callback => __return_true` (zodat publieke leesbaarheid gegarandeerd is). Single, niet array.

### Waarom een vrije URL, niet `vimeo_id` (zoals talks)

Talks gebruiken `vimeo_id` omdat talks altijd via Vimeo lopen (MaterialDistrict-Vimeo-account). Brands publiceren hun eigen content en mogen hun eigen provider kiezen — meestal YouTube vanaf hun corporate channel. Een vrije URL houdt die keuze open.

### Frontend-gedrag

- Toont een video-blok op `/brands/[slug]` zodra `video_url` gevuld is én herkend wordt als YouTube/Vimeo.
- Toont niets als het veld leeg/null/ontbreekt of de URL niet herkend wordt — geen lege blokken of placeholders.
- Embed via de juiste provider-iframe (YouTube `youtube.com/embed/{id}` of Vimeo `player.vimeo.com/video/{id}`).

---

## 2. Brand downloads

### Wat de frontend nodig heeft

Een array van download-items in `brand.meta.downloads`:

```json
{
  "id": 123,
  "slug": "obro-bv",
  "meta": {
    "downloads": [
      {
        "type": "brochure",
        "url": "https://materialdistrict.com/wp-content/uploads/2026/01/obro-brochure.pdf",
        "title": "Company brochure 2026",
        "file_size": 2456789,
        "insider_only": false
      },
      {
        "type": "catalogue",
        "url": "https://materialdistrict.com/wp-content/uploads/2026/01/obro-catalogue.pdf",
        "title": "Material catalogue",
        "file_size": 4892013,
        "insider_only": true
      }
    ]
  }
}
```

### Specificatie per item

| Veld | Type | Verplicht | Toegestane waarden / opmerking |
|---|---|---|---|
| `type` | string (ENUM) | ja | `"brochure"`, `"catalogue"`, `"sustainability_report"`, `"price_list"`, `"other"` |
| `url` | string (URL) | ja | Absolute URL naar het bestand |
| `title` | string | nee | Vrije weergave-naam. Leeg → frontend gebruikt het `type`-label |
| `file_size` | integer (bytes) | nee | Voor UI-weergave (bv. "2.4 MB"). Leeg → frontend toont geen size |
| `insider_only` | boolean | ja | Default `false`. Sluit aan op W11 (per-download insider-gating) |

### Specificatie op array-niveau

- **Veldnaam:** `downloads` (kaal, geen `_brand_downloads`-prefix in de output).
- **Leeg/geen downloads:** leeg array `[]`. Niet `null`, niet ontbrekend — voorspelbaarder voor de mapper.
- **Volgorde:** zoals ingevoerd in de admin (geen alfabetische sortering aan WP-kant — frontend bepaalt eventuele volgorde).
- **Exposure:** `register_post_meta('brand', 'downloads', [...])` met `show_in_rest` schema dat de bovenstaande shape afdwingt (zie `material.brochures[]` als template — exact dezelfde shape, alleen op brand i.p.v. material).

### Frontend-gedrag

- Toont een Downloads-blok op `/brands/[slug]` als `downloads.length > 0`.
- Toont niets als het array leeg of ontbrekend is — geen lege blokken.
- Bij `insider_only: true` + niet-Insider-user: download-rij is gegated (zelfde patroon als `material.brochures[].insider_only`, zie W11).
- Bij `file_size`: weergegeven als "2.4 MB" via standaard formatter.
- Bij ontbrekende `title`: weergave-naam wordt afgeleid uit `type` (`brochure` → "Brochure", `sustainability_report` → "Sustainability report", etc.).

### Type-ENUM toelichting

De vijf types dekken de mockup-content:
- `brochure` — algemene company-brochure
- `catalogue` — materiaalcatalogus
- `sustainability_report` — duurzaamheidsverslag
- `price_list` — prijslijst (Insider-gated in praktijk)
- `other` — vangnet

Mocht je behoefte hebben aan een extra type, laat het weten — dan voeg ik 'm aan onze kant toe.

---

## 3. Snelle samenvatting voor de PHP-zijde

```php
// In je brand-CPT register_post_meta-block, naast de bestaande velden:

register_post_meta('brand', 'video_url', [
  'type' => 'string',
  'single' => true,
  'show_in_rest' => true,
  'auth_callback' => '__return_true',
]);

register_post_meta('brand', 'downloads', [
  'type' => 'array',
  'single' => true,
  'show_in_rest' => [
    'schema' => [
      'type' => 'array',
      'items' => [
        'type' => 'object',
        'properties' => [
          'type'          => ['type' => 'string'],
          'url'           => ['type' => 'string', 'format' => 'uri'],
          'title'         => ['type' => 'string'],
          'file_size'     => ['type' => 'integer'],
          'insider_only'  => ['type' => 'boolean'],
        ],
      ],
    ],
  ],
  'auth_callback' => '__return_true',
]);
```

---

## 4. Testbaarheid aan onze kant

Als je één brand in de DB met gevulde `video_url` + één of twee `downloads`-
items kunt aanleveren (of de SQL/admin-snippet om er één te maken), dan
kunnen wij meteen valideren dat de mapper correct werkt voordat het
dashboard er is. Hoeft geen mooie content te zijn — placeholder-URLs
zijn prima.

---

## 5. Wat we aan onze kant doen zodra dit live is

- Types `BrandMeta` uitbreiden met `video_url?` en `downloads?[]`.
- Mapper-uitbreiding in `mapBrand()` om beide door te zetten naar het
  `Brand`-domain-object.
- Conditionele blokken op `/brands/[slug]`: video-section bij `video_url`
  (met provider-detectie YouTube/Vimeo), downloads-card bij
  `downloads.length > 0`.
- Per-download Insider-gating (zelfde component als materials).

Eén korte frontend-sessie, schat ik. Hangt af van of er nog meer brand-
velden tegelijk komen — als ja, in één keer meenemen.
