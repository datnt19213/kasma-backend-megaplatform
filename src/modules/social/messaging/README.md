# Social Messaging Module

Realtime messaging for the Kasma Social platform: direct chat, group chat with admin roles, at-rest message encryption, and **kasma-socket** event delivery.

## Features

| Feature | Description |
|---------|-------------|
| **Direct chat** | One-to-one conversations with block checks |
| **Group chat** | Groups up to 256 members with `OWNER`, `ADMIN`, `MEMBER` roles |
| **Encryption** | AES-256-GCM at rest in MongoDB (`MESSAGE_ENCRYPTION_KEY`) |
| **Realtime** | Publishes to `chat:conversation:{id}` via kasma-socket |

## API Base Path

`api/social/messaging`

## WebSocket (Client)

1. Connect to kasma-socket: `ws://<socket-host>/ws?tenant_key=...&app_key=...` with JWT
2. Subscribe: `{"type":"subscribe","channel":"chat:conversation:<conversation_id>"}`
3. Listen for events: `message.new`, `message.deleted`, `member.joined`, `member.left`, `conversation.created`

## Environment (Backend)

| Variable | Purpose |
|----------|---------|
| `SOCKET_SERVICE_URL` | kasma-socket HTTP base URL (default `http://localhost:5010`) |
| `SOCKET_INTERNAL_API_KEY` | Internal publish key (must match kasma-socket) |
| `MESSAGE_ENCRYPTION_KEY` | Secret for AES-256-GCM message encryption |

## Postman

See `postman_collection.txt` → **8. SOCIAL MEDIA** → **Messaging (Realtime)**.
