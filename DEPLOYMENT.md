# Deployment Guide

## APIU Cafeteria Operation System Deployment

This guide covers deploying the Laravel backend and React frontend to production.

### Prerequisites

- **Server Requirements:**
  - PHP 8.2+
  - Composer
  - Node.js 18+
  - MySQL/PostgreSQL database
  - Web server (Apache/Nginx)

### Backend Deployment (Laravel)

#### 1. Server Setup

```bash
# Clone repository
git clone <repository-url>
cd cafeteria-backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Set up environment
cp .env.example .env
php artisan key:generate
```

#### 2. Environment Configuration

Edit `.env` file:

```env
APP_NAME="APIU Cafeteria System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cafeteria_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
SPA_URL=https://your-frontend-domain.com
```

#### 3. Database Setup

```bash
# Run migrations and seeders
php artisan migrate --force
php artisan db:seed --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 4. File Permissions

```bash
# Set proper permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 5. Web Server Configuration

**Apache (.htaccess)**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

**Nginx**
```nginx
server {
    listen 80;
    server_name your-api-domain.com;
    root /path/to/cafeteria-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Frontend Deployment (React)

#### 1. Build Process

```bash
cd cafeteria-frontend

# Install dependencies
npm install

# Update API base URL for production
# Edit src/services/api.ts
const api = axios.create({
  baseURL: 'https://your-api-domain.com/api',
  // ...
});

# Build for production
npm run build
```

#### 2. Static Hosting Options

**Option A: Netlify**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables if needed

**Option B: Vercel**
1. Import project from GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

**Option C: Traditional Web Server**
```bash
# Copy build files to web server
cp -r dist/* /var/www/html/

# Configure web server for SPA
```

**Nginx SPA Configuration:**
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://your-api-domain.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/HTTPS Setup

#### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Database Backup

#### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DB_NAME="cafeteria_db"
DB_USER="your_username"
DB_PASS="your_password"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/cafeteria_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "cafeteria_backup_*.sql" -mtime +7 -delete
```

### Monitoring & Logging

#### Laravel Logs
```bash
# Monitor application logs
tail -f storage/logs/laravel.log

# Log rotation
sudo logrotate -f /etc/logrotate.d/laravel
```

#### Performance Monitoring
- Use Laravel Telescope for debugging (development only)
- Implement application monitoring (New Relic, Sentry)
- Set up server monitoring (Uptime Robot, Pingdom)

### Security Checklist

#### Backend Security
- [ ] Environment variables properly set
- [ ] Debug mode disabled in production
- [ ] HTTPS enforced
- [ ] Database credentials secured
- [ ] File permissions set correctly
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled

#### Frontend Security
- [ ] API endpoints use HTTPS
- [ ] Sensitive data not exposed in client
- [ ] Content Security Policy configured
- [ ] Authentication tokens secured
- [ ] Input sanitization implemented

### Performance Optimization

#### Backend Optimization
```bash
# Enable OPcache
echo "opcache.enable=1" >> /etc/php/8.2/fpm/php.ini

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Database optimization
php artisan migrate --force
```

#### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images
- Minify CSS/JS (handled by Vite)

### Scaling Considerations

#### Database Scaling
- Read replicas for heavy read workloads
- Database connection pooling
- Query optimization and indexing

#### Application Scaling
- Load balancer setup
- Horizontal scaling with multiple app servers
- Redis for session storage and caching
- Queue workers for background jobs

### Maintenance

#### Regular Tasks
- [ ] Database backups
- [ ] Log rotation
- [ ] Security updates
- [ ] Performance monitoring
- [ ] SSL certificate renewal

#### Update Process
```bash
# Backend updates
git pull origin main
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Frontend updates
npm install
npm run build
# Deploy new build files
```

### Troubleshooting

#### Common Issues

**500 Internal Server Error**
- Check Laravel logs: `storage/logs/laravel.log`
- Verify file permissions
- Check database connection

**CORS Issues**
- Verify SANCTUM_STATEFUL_DOMAINS in .env
- Check frontend API base URL
- Ensure proper headers are set

**Database Connection Failed**
- Verify database credentials
- Check database server status
- Ensure database exists

**Frontend Not Loading**
- Check build process completed successfully
- Verify web server configuration
- Check browser console for errors

### Support & Maintenance

For ongoing support and maintenance:
1. Monitor application logs regularly
2. Keep dependencies updated
3. Perform regular security audits
4. Monitor performance metrics
5. Maintain regular backups

### Contact Information

**Developer:** Niu Boen  
**Course:** IT 341/IT367 Web Applications Development  
**Institution:** Asia-Pacific International University