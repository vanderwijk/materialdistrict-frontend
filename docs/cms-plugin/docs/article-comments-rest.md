# Article comments REST

## Status (10-06-2026)

WordPress **core** also exposes comments at `/wp-json/wp/v2/comments`:

| Action | Endpoint | Auth |
|--------|----------|------|
| List approved | `GET /wp/v2/comments?post={articleId}` | Public |
| Create | `POST /wp/v2/comments` `{ post, content }` | Logged-in |

**Use the MD routes below for POST.** On production (2026-06-10), Bearer JWT on
core `POST /wp/v2/comments` still returns `rest_comment_login_required`; the MD
handler validates the token explicitly and works.

JWT auth for POST is handled by existing `md_auth_determine_current_user` in
`rest-auth.php` when the frontend sends `Authorization: Bearer <jwt>` (same as
dashboard routes). The HttpOnly cookie alone is **not** read by WP — the Next.js
API proxy must forward the token as Bearer.

## MD routes (preferred for frontend)

Added in `rest-article-comments.php`:

### `GET /wp-json/md/v2/articles/{slug}/comments`

Public. Returns **approved** comments only.

```json
{
  "commentsOpen": true,
  "total": 12,
  "page": 1,
  "perPage": 50,
  "comments": [
    {
      "id": 42,
      "parent": 0,
      "date": "2026-06-01T10:00:00+00:00",
      "contentHtml": "<p>…</p>",
      "author": { "id": 7, "name": "Jane", "avatarUrl": "…" },
      "isOwn": false
    }
  ]
}
```

Query: `page`, `per_page` (max 100).

### `POST /wp-json/md/v2/articles/{slug}/comments`

Requires `Authorization: Bearer <jwt>`.

Body:

```json
{ "content": "My comment", "parent": 0 }
```

Response:

```json
{
  "ok": true,
  "status": "hold",
  "pending": true,
  "message": "Your comment is awaiting moderation.",
  "comment": null
}
```

When auto-approved, `comment` contains the same shape as GET items.

Moderation follows normal WP settings (Settings → Discussion). Only
**approved** comments appear on GET.

## Frontend follow-up (Claude)

1. Server-side proxy route (e.g. `/api/articles/[slug]/comments`) that reads
   the auth cookie and forwards Bearer to WP — mirror `/api/dashboard/*`.
2. UI: comment list + form on article detail; gate form on `commentsOpen` +
   logged-in state.
3. Optional: expose `comment_status` on the article detail payload (already on
   `/wp/v2/article/{id}` as `comment_status`).

## Not in scope

- Comments on materials/talks/events (article only for now).
- Anonymous comments (login required by design).
