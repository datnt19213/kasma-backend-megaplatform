# Social Trending & Hashtags

## Hashtag index

- Post **content** is scanned for `#keywords` (Unicode letters, numbers, underscore).
- Manual tags of type `HASHTAG` in `CreatePostDto.tags` are merged and deduplicated.
- Indexed rows use MongoDB `social_post_tags` with `type: HASHTAG`, `target_id` = normalized lowercase slug.
- **Group posts** with `PENDING` moderation are **not** indexed until approved.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/social/trending/topics?hours=24&limit=20` | Top hashtags by tag volume in the window |
| GET | `/api/social/trending/hashtags/search?q=kasma&hours=168&limit=15` | Suggest hashtags from that window |
| GET | `/api/social/trending/hashtags/:slug/posts?page=1&limit=20` | Posts for a hashtag (`slug` without `#`) |

JWT (or gateway `X-User-Id`) is required so tenant scope (`app_key` / `tenant_key`) can be resolved.

## WebSocket

Optional: subscribe clients to realtime hashtag updates separately (not wired by default).
