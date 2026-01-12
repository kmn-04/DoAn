# Hướng dẫn cấu hình Environment Variables

## Các biến môi trường cần thiết

### OpenAI / OpenRouter API
```bash
OPENAI_API_KEY=your_openai_api_key_here
# hoặc
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Google OAuth2
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database
```bash
DATABASE_URL=jdbc:mysql://localhost:3306/doan
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_database_password
```

### JWT
```bash
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000
```

### Email
```bash
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
```

### Weather API
```bash
WEATHER_API_KEY=your_weather_api_key
```

### VNPay
```bash
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
```

### Application
```bash
APP_NAME=Tour Booking System
APP_URL=http://localhost:5173
FILE_UPLOAD_DIR=uploads
```

### OpenAI Model (optional)
```bash
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT=60
```

## Cách sử dụng

### Windows (PowerShell)
Tạo file `.env` trong thư mục gốc dự án và thêm các biến môi trường:
```powershell
$env:OPENAI_API_KEY="your_key_here"
```

Hoặc tạo file `.env` và load bằng script.

### Linux/Mac
```bash
export OPENAI_API_KEY="your_key_here"
```

Hoặc tạo file `.env` và sử dụng `source .env`

## Lưu ý
- **KHÔNG** commit file `.env` vào git
- File `.env` đã được thêm vào `.gitignore`
- Sử dụng `.env.example` (nếu có) làm template
