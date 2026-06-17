# MANIFEST — Dashboard polish (volledig) — 16-06-2026

18 frontend-punten in één levering. Eén centrale `globals.css`, geen losse CSS,
complete bestanden. Alleen frontend; backend-punten staan apart in de Johan-mail.

## Gewijzigde bestanden (24)

### Gedeelde veld-laag
- `src/components/ui/form/Input.tsx`           — .filled volgt validatie-state; showFilledState = no-op
- `src/components/ui/form/Select.tsx`          — idem voor dropdowns
- `src/styles/globals.css`                     — zie CSS-noot hieronder

### Nieuw
- `src/components/dashboard/fields/ChannelPicker.tsx`  — gedeelde kanaal-kiezer (toggle, ×, max-melding)
- `src/components/dashboard/fields/index.ts`           — export ChannelPicker

### Dashboard-panels & velden
- `src/components/dashboard/DashboardSidebar.tsx`            — Brand account-label, witte kaart, naam-wrap
- `src/components/dashboard/panels/ProfileForm.tsx`         — verplichte velden + invoice wit + btw gedeeld
- `src/components/dashboard/panels/BrandProfileForm.tsx`    — verplicht + logo + btw gedeeld + ChannelPicker + sectie-volgorde + gate→section
- `src/components/dashboard/panels/MaterialForm.tsx`        — verplicht (hard) + zachte filter-confirm + ChannelPicker + add-knop
- `src/components/dashboard/panels/LeadRoutingPanel.tsx`    — per-rij verplicht + groene add-knop + delete rood
- `src/components/dashboard/panels/AddBrandPanel.tsx`       — nieuw-merk: naam + contact-e-mail verplicht
- `src/components/dashboard/panels/BoardsPanel.tsx`         — "Add board" (plus, groen) + delete-bevestiging
- `src/components/dashboard/panels/BoardDetailPanel.tsx`    — boardnaam in pagina + terug-link linksboven
- `src/components/dashboard/panels/SavedSearchesPanel.tsx`  — catalogus + thumbnailstrip + filter-chips
- `src/components/dashboard/panels/InsightsPanel.tsx`       — catalogus-kaarten + groene download
- `src/components/dashboard/fields/VideoLinksField.tsx`     — × → prullenbak + is-delete
- `src/components/dashboard/fields/DownloadsField.tsx`      — delete is-delete
- `src/components/dashboard/fields/GalleryField.tsx`        — delete is-delete

### Pagina's & overig
- `src/app/dashboard/membership/page.tsx`                  — ?billing=unavailable-melding
- `src/app/dashboard/boards/[id]/page.tsx`                 — titel blijft "Boards"
- `src/app/checkout/_components/CheckoutForm.tsx`          — e-mail → gedeelde Input
- `src/app/checkout/_components/CheckoutSignInPanel.tsx`   — wachtwoord → gedeelde Input
- `src/app/material/[slug]/_components/GetInTouchModal.tsx`— sample-adrespoort
- `src/types/shared.ts`                                    — optioneel User.hasShippingAddress

## globals.css — noot voor Johan
Basis = de book-detail-globals.css (laatste versie, incl. §BOOKS-DETAIL-SHEET). De edits:
veld-status (.field-wrap.filled via component, .field-wrap.error grijs, .field-label
sentence-case, .g2/.g3 18px), groene dashboard-CTA's, blauw→zwart (tab/cart), sidebar witte
kaart + .sb-scope-text, gelockte gate (max-height + overlay 0.58), .chip.is-on cursor,
.asset-row groene tint, .ip-bg wit, plus het append-only §DASH-POLISH-blok (board-detail,
.icon-btn.is-delete, saved-search-catalogus, insights-catalogus). Het book-blok zit erin —
als je main inmiddels verder is, neem dan deze regels in-place over i.p.v. te overschrijven.

## Verificatie
- esbuild-transpile groen: alle 23 gewijzigde TS/TSX
- globals.css brace-balans: 0; §BOOKS-DETAIL-SHEET intact
- Gedeelde Input/Select alleen in echte formulieren; search/newsletter ongemoeid
