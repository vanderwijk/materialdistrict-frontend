# Dode CSS-inventaris — 31-07-2026

> **Status: niet verwijderd.** Deze klassen komen niet voor in de
> frontend-broncode (`src/**/*.tsx|ts`), maar het is van hieruit niet te
> verifiëren of WordPress-content, plugin-templates of gerenderde HTML uit
> de CMS ze gebruikt. Verwijderen vlak voor een launch levert een risico op
> dat pas zichtbaar wordt op een pagina die niemand test.
>
> Zie `docs/vormgeving-regelboek.md` §11.

## Methode

Een klasse geldt als dood wanneer:

1. de volledige naam nergens in de broncode voorkomt, én
2. de naam niet begint met een prefix die dynamisch wordt samengesteld.

Die tweede voorwaarde is nodig: de code bouwt klassenamen op 35 plekken op
met een sjabloon (`ct-${...}`, `btn-${...}`, `is-${...}`). Zonder die
controle zou de eerste meting 263 klassen als dood aanmerken; met de
controle blijven er 211 over.

## Voor het opruimen

Controleer per familie eerst of de klasse in WordPress voorkomt — in
artikelinhoud, in plugin-templates of in e-mailsjablonen. De boeken- en
insider-modal-families zijn het meest waarschijnlijk echt dood: die zijn
vervangen door een nieuwer ontwerp en `globals.css` noemt ze zelf al
achterhaald.

## 211 klassen, gegroepeerd

### `book-card-*` — 18

`.book-card`, `.book-card-`, `.book-card-add`, `.book-card-author`, `.book-card-badge`, `.book-card-cover`, `.book-card-cover-empty`, `.book-card-foot`, `.book-card-insider`, `.book-card-link`, `.book-card-meta`, `.book-card-price`, `.book-card-price-was`, `.book-card-prices`, `.book-card-publisher`, `.book-card-sep`, `.book-card-soldout`, `.book-card-title`

### `insider-modal-*` — 14

`.insider-modal`, `.insider-modal-body`, `.insider-modal-close`, `.insider-modal-cta`, `.insider-modal-dontshow`, `.insider-modal-eyebrow`, `.insider-modal-footnote`, `.insider-modal-icon`, `.insider-modal-list-label`, `.insider-modal-overlay`, `.insider-modal-secondary`, `.insider-modal-sub`, `.insider-modal-title`, `.insider-modal-top`

### `mat-sample-*` — 8

`.mat-sample-cta`, `.mat-sample-cta-button`, `.mat-sample-cta-header`, `.mat-sample-cta-note`, `.mat-sample-cta-row`, `.mat-sample-cta-subtitle`, `.mat-sample-cta-title`, `.mat-sample-section`

### `article-side-*` — 7

`.article-side-newsletter`, `.article-side-newsletter-body`, `.article-side-newsletter-eyebrow`, `.article-side-newsletter-input`, `.article-side-newsletter-row`, `.article-side-newsletter-title`, `.article-side-progress-label`

### `book-detail-*` — 7

`.book-detail-body`, `.book-detail-head`, `.book-detail-hero`, `.book-detail-hero-buy`, `.book-detail-hero-cover`, `.book-detail-shortdesc`, `.book-detail-title`

### `insight-row-*` — 6

`.insight-row`, `.insight-row-action`, `.insight-row-body`, `.insight-row-lijst`, `.insight-row-meta`, `.insight-row-title`

### `sg-block-*` — 5

`.sg-block`, `.sg-block-demo`, `.sg-block-header`, `.sg-block-meta`, `.sg-block-title`

### `talks-filter-*` — 5

`.talks-filter-clear`, `.talks-filter-count`, `.talks-filter-group`, `.talks-filter-label`, `.talks-filter-select`

### `checkout-vat-*` — 4

`.checkout-vat-error`, `.checkout-vat-indicator`, `.checkout-vat-input`, `.checkout-vat-input-wrap`

### `hp-hero-*` — 4

`.hp-hero-article-badge`, `.hp-hero-article-img`, `.hp-hero-article-meta`, `.hp-hero-article-thumb`

### `mat-brand-*` — 4

`.mat-brand-block`, `.mat-brand-block-eyebrow`, `.mat-brand-block-link`, `.mat-brand-block-name`

### `mat-info-*` — 4

`.mat-info-brand`, `.mat-info-meta`, `.mat-info-meta-item`, `.mat-info-title`

### `t-req-*` — 4

`.t-req-detail`, `.t-req-detail-message`, `.t-req-detail-meta`, `.t-req-group`

### `book-meta-*` — 3

`.book-meta-row`, `.book-meta-row-key`, `.book-meta-row-value`

### `events-segment-*` — 3

`.events-segment`, `.events-segment-btn`, `.events-segment-count`

### `mat-download-*` — 3

`.mat-download-link`, `.mat-download-link-label`, `.mat-download-link-meta`

### `sg-variant-*` — 3

`.sg-variant`, `.sg-variant-grid`, `.sg-variant-label`

### Losse klassen — 109

`.active-channel-links`, `.ad-300`, `.ad-728`, `.ad-970`, `.ad-dismiss`, `.ad-slot`, `.addr-field`, `.addr-field-wide`, `.article-detail-body`, `.article-related-date`, `.article-related-excerpt`, `.articles-type-dot`, `.book-about-eyebrow`, `.book-buy-regels`, `.book-grid`, `.book-more-head`, `.book-spec-row`, `.book-spec-table`, `.books-toolbar`, `.books-toolbar-controls`, `.card-insider-pill`, `.cart-checkout-note`, `.cart-item-remove`, `.cart-item-unit`, `.cart-totals-vat`, `.channel-intro`, `.channel-tag-overlay`, `.chip-check`, `.col2`, `.col3`, `.content-card-header`, `.detail-header-channel`, `.ed-featured-title`, `.ed-featured-title-typografie`, `.event-card-band-fallback`, `.event-card-img`, `.fade-up`, `.feature-band-actions`, `.field-error`, `.field-row`, `.follow-catch-lock`, `.follow-pop-shell`, `.follow-switch-track-regel`, `.form-field`, `.g2-rijen`, `.hero-eyebrow-muted`, `.hero-right`, `.hero-right-title`, `.hp-channel-materials`, `.hp-eb-cta`, `.hp-partner-row`, `.hp-partner-tile`, `.insider-cta-card-icon`, `.insider-feature-grid`, `.insider-feature-item`, `.insight-list`, `.insight-thumb`, `.js-default`, `.lbl`, `.login-eyebrow`, `.login-eyebrow-regel`, `.login-form-title`, `.login-title`, `.mat-detail-tags-row`, `.mat-downloads-title`, `.mat-related`, `.mat-related-title`, `.material-card-eyebrow-code`, `.materials-search-styling`, `.ov-grid-2`, `.ov-page-header-aside`, `.partner-card`, `.partner-grid`, `.profile-avatar-lg`, `.profile-avatar-row`, `.pub-layout-klassen`, `.pub-layout-shell`, `.sample-request-form`, `.sample-request-form-actions`, `.sb-back-btn`, `.sb-back-btn-opmaak`, `.sb-footer`, `.sb-section-hd`, `.sb-section-hd--brands`, `.sb-signout`, `.sg-anchor`, `.sg-header`, `.sg-section-title`, `.sg-spacing-label`, `.sg-swatch-info`, `.sg-swatch-value`, `.sg-toc`, `.sg-variants`, `.shortcuts-label`, `.srch-thumb-brand`, `.ss-actions`, `.ss-list`, `.ss-row`, `.ss-row-lijstweergave`, `.t-row-caret`, `.talks-filterbar`, `.u-full-width`, `.u-gap-2`, `.u-gap-3`, `.u-py-2`, `.u-section`, `.upload-box`, `.upload-icon`, `.upload-name`
