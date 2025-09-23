# 🚀 TourBooking Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Copy `frontend/env.production.example` to `frontend/.env.production`
- [ ] Update all environment variables with production values
- [ ] Verify API endpoints are accessible
- [ ] Configure external services (Stripe, Google Maps, etc.)

### ✅ Backend Preparation
- [ ] Backend is running on production server
- [ ] Database is set up with production data
- [ ] SSL certificates are configured
- [ ] API endpoints are secured

### ✅ Frontend Build
- [ ] Run production build: `npm run build:prod`
- [ ] Verify build completes without errors
- [ ] Check bundle size analysis
- [ ] Test production build locally: `npm run preview:prod`

---

## 🏗️ Build Commands

```bash
# Development
npm run dev

# Production build with full checks
npm run build:prod

# Analyze bundle size
npm run build:analyze

# Test production build locally
npm run test:prod

# Clean build artifacts
npm run clean
```

---

## 🌐 Deployment Options

### Option 1: Static Hosting (Recommended)
**Platforms:** Vercel, Netlify, Firebase Hosting, GitHub Pages

1. **Build the project:**
   ```bash
   npm run build:prod
   ```

2. **Deploy the `dist/` folder**

3. **Configure redirects for SPA:**
   - **Vercel:** Create `vercel.json`
   - **Netlify:** Create `_redirects` file
   - **Apache:** Configure `.htaccess`
   - **Nginx:** Configure server block

### Option 2: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM nginx:alpine
   COPY dist/ /usr/share/nginx/html/
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run:**
   ```bash
   docker build -t tourbooking-frontend .
   docker run -p 80:80 tourbooking-frontend
   ```

### Option 3: Traditional Web Server

1. **Build the project:**
   ```bash
   npm run build:prod
   ```

2. **Copy `dist/` to web server directory**

3. **Configure server for SPA routing**

---

## ⚙️ Server Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/tourbooking/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Apache Configuration (.htaccess)
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache static assets
<filesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive on
    ExpiresDefault "access plus 1 year"
</filesMatch>

# Security headers
Header always set X-Frame-Options SAMEORIGIN
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "no-referrer-when-downgrade"
```

---

## 🔒 Security Configuration

### Environment Variables (.env.production)
```bash
# API Configuration
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_APP_ENV=production

# Disable development features
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_DEBUG_LOGGING=false

# Enable production features
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_CSP=true
VITE_ENABLE_HTTPS_ONLY=true

# External services
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

### Content Security Policy (CSP)
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  img-src 'self' data: https:; 
  connect-src 'self' https://api.your-domain.com;
```

---

## 📊 Performance Optimization

### Bundle Size Targets
- **Initial Bundle:** < 500KB (gzipped)
- **Vendor Chunks:** < 200KB each
- **Route Chunks:** < 100KB each

### Performance Checklist
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Image optimization
- [ ] Tree shaking enabled
- [ ] Compression enabled (gzip/brotli)
- [ ] CDN configured for static assets

---

## 🧪 Production Testing

### Pre-Deployment Tests
```bash
# Build and test locally
npm run test:prod

# Check for console errors
# Verify all features work
# Test on different devices/browsers
# Performance testing with Lighthouse
```

### Post-Deployment Verification
- [ ] All pages load correctly
- [ ] API calls work properly
- [ ] Authentication flow works
- [ ] Payment processing works
- [ ] Mobile responsiveness
- [ ] SEO meta tags
- [ ] Analytics tracking

---

## 📱 PWA Configuration (Optional)

### Service Worker
```javascript
// Enable in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Web App Manifest
```json
{
  "name": "TourBooking",
  "short_name": "TourBooking",
  "description": "Khám phá và đặt tour du lịch",
  "theme_color": "#ea580c",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

---

## 🔍 Monitoring & Analytics

### Error Tracking (Sentry)
```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production"
  });
}
```

### Analytics (Google Analytics)
```typescript
import { gtag } from 'ga-gtag';

if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
  gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
}
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Fails:**
- Check TypeScript errors: `npm run type-check`
- Check linting errors: `npm run lint`
- Clear cache: `npm run clean`

**Routing Issues:**
- Verify server configuration for SPA
- Check base URL in vite.config.ts

**API Connection Issues:**
- Verify VITE_API_BASE_URL
- Check CORS configuration
- Verify SSL certificates

**Performance Issues:**
- Run bundle analysis: `npm run build:analyze`
- Check for large dependencies
- Verify code splitting

---

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review build logs
3. Test locally with production build
4. Contact development team

---

## 🔄 CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build:prod
      - name: Deploy to hosting
        # Add your deployment step here
```

---

**🎉 Happy Deploying!**
