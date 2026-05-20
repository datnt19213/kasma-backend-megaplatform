# Social Groups Module

Community and fanpage management under `api/social/groups`.

## Group Types

| Type | Description |
|------|-------------|
| `COMMUNITY` | Interest-based private or public groups with optional post approval |
| `FANPAGE` | Organization, celebrity, or business pages |

## Member Roles

`OWNER` → `ADMIN` → `MODERATOR` → `MEMBER`

Private communities set new joiners to `PENDING` until a moderator approves.

## Post Moderation

When `requires_post_approval` is enabled, new group posts start as `PENDING` until approved or rejected by a moderator.
