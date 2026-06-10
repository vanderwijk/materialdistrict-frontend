## §F2.7 — Overzicht-finetuning (10-06-2026)

Gefinetuned: alle overzicht-/cataloguspagina's en hun gedeelde chrome. Gebouwd
in vier deelbatches (A chrome/filterblok, B bookmarks/meldingen, B2 board-
popover, C/D per-overzicht + recently-viewed-generalisatie) en hier samengevoegd
tot één eindstand-zip.

Kernpunten: channelbar-witregel, filterblok plat op de paper, ×/Save alleen bij
actief filter, entity-decode op channel-labels, recently-viewed verwijderbaar
(materials) + uitgerold naar stories/brands/events/talks met detail-tracking,
witregel onder paginering, bookmark op alle kaarten, melding i.p.v. login-
redirect, board-popover (hybride: instant save + "Add to board"), brands country
op aantal + inklapbaar, events Upcoming/Past + cap-20-paginering. Channel-
filtering bleek al gewired (1.3) en actief paginanummer al ink (3.1).

globals.css: drie additieve §F2.7-blokken op de huidige main; regels 1–12.228
byte-identiek. Verificatie: esbuild 24/24, globals additief.

Apart: talks-filter (losse vervolgstap) en stories-tellingen (Johan-onderzoek).
