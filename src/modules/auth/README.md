# Auth Module

Authentication system với opaque tokens + httpOnly cookies.

## Flow

### Login
1. Client gửi `POST /auth/login` với `email` + `password`
2. BE xác thực, tạo JWT → lưu vào Redis
3. BE tạo opaque `access_token` + `refresh_token` (64 ký tự)
4. BE set cookies httpOnly, trả user info cho client

### Refresh Token
1. Client gọi `POST /auth/refresh` (BE tự đọc cookie)
2. BE dùng refresh_token lấy JWT từ Redis
3. BE tạo access_token + refresh_token mới
4. BE update cookies

### Logout
1. Client gọi `POST /auth/logout`
2. BE xóa tokens khỏi Redis + clear cookies

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Đăng nhập |
| POST | `/auth/register` | ❌ | Đăng ký |
| POST | `/auth/refresh` | ❌ | Refresh token |
| POST | `/auth/logout` | ✅ | Đăng xuất |
| POST | `/auth/logout-all` | ✅ | Đăng xuất mọi session |
| GET | `/auth/me` | ✅ | Lấy info user hiện tại |

## Request/Response Examples

### Login
```json
POST /auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "user_type": "GENERAL"
  }
}
// Cookies: access_token, refresh_token (httpOnly)
```

### Register
```json
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "John Doe",
  "is_login_after_registration_success": true
}

Response:
{
  "success": true,
  "user": { ... },
  "autoLoggedIn": true
}
```

## Security Notes

- Tokens là opaque strings (64 ký tự), không phải JWT
- JWT được lưu trong Redis, chỉ BE truy cập được
- Cookies httpOnly, secure (prod), sameSite=lax
- Password hash với bcrypt (salt=10)
- Audit logging cho mọi auth action
