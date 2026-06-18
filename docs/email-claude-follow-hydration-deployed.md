Onderwerp: Follow-hydration fix gedeployed

Hoi Claude,

De follow-knop onthoudt nu persisted state na refresh. Staat op main na push (zie commit-hash hieronder).

---

## Probleem

Backend (`GET/POST/DELETE /md/v2/follows` → `wp_md_follows`) werkte al. De UI startte altijd op `initialFollowing = false` — geen hydration bij pageload.

---

## Fix (frontend only, geen plugin-wijziging)

| Bestand | Wijziging |
|---------|-----------|
| `src/lib/api/follows.ts` | Gedeelde in-memory cache + `loadFollows()` (één GET per pageload) |
| `src/lib/hooks/useFollow.tsx` | Hydrateert `following` + `types` bij mount; nieuwe `useMailFrequency()` |
| `FollowToggle.tsx`, `DetailChannelPill.tsx` | Sync checklist + frequentie met gehydrateerde state |
| `FollowDigestBlock.tsx` | Pre-selecteert reeds gevolgde channels uit cache |
| `AuthContext.tsx` | Leegt follows-cache bij login/logout (andere user) |

Build groen vóór push.

---

## Rooktest

1. Inloggen → channel volgen → pagina verversen → toggle blijft op "Following"
2. Footer digest → gevolgde channels staan aangevinkt
3. Uitloggen → toggles terug naar uit

Plugin-deploy niet nodig — endpoints stonden al live.

---

Groet,  
Johan
