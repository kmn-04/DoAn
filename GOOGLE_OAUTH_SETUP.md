# Hướng dẫn cấu hình Google OAuth Redirect URI

## Redirect URI cần thêm trong Google Cloud Console

**Development (localhost):**
```
http://localhost:8080/login/oauth2/code/google
```

**Production (nếu có domain):**
```
https://yourdomain.com/login/oauth2/code/google
```

## Các bước cấu hình:

1. Truy cập: https://console.cloud.google.com/
2. Chọn project có Client ID: `630450799439-orkmqjnrlkcjhbmhhdv8hb263nl2ddmp`
3. Vào **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. Trong phần **Authorized redirect URIs**, thêm:
   - `http://localhost:8080/login/oauth2/code/google`
6. Click **SAVE**

## Lưu ý:

- Redirect URI phải **chính xác 100%** (không có dấu `/` thừa, không có khoảng trắng)
- Spring Security OAuth2 tự động sử dụng pattern: `{baseUrl}/login/oauth2/code/{registrationId}`
- `baseUrl` = `http://localhost:8080` (từ `server.port` trong `application.yml`)
- `registrationId` = `google` (từ `spring.security.oauth2.client.registration.google`)

## Kiểm tra sau khi thêm:

1. Restart backend
2. Thử đăng nhập lại với Google
3. Nếu vẫn lỗi, kiểm tra lại redirect URI trong Google Cloud Console có đúng chính tả không

