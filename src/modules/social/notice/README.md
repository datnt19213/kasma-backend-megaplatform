# Social Notice Module

In-app notification inbox and realtime push for social interactions.

## Delivery Channels

1. **In-app list** — `GET /api/social/notices` (Postgres `social_notices`)
2. **Realtime push** — kasma-socket channel `notice:user:{userId}`, event `notice.new`
3. **kasma-noti** — `IN_APP` and `PUSH` types via internal API

## Auto Triggers

| Event | Source |
|-------|--------|
| `LIKE` | Reaction added on post/comment |
| `COMMENT` | New comment on a post |
| `TAG` | User mention in post or comment |
| `GROUP_*` | Join requests, post moderation |

## WebSocket Subscribe

```json
{"type":"subscribe","channel":"notice:user:<your_user_id>"}
```
