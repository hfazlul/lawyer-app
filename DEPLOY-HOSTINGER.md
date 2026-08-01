# Hostinger VPS — Production Deploy Guide

Deploy **lawyer-app** (public site + `/musaAdv` admin) on a Hostinger VPS running Ubuntu.

---

## 1. DNS (Hostinger hPanel → Domains → DNS)

| Type | Name | Value (your VPS IP) |
|------|------|---------------------|
| A    | @    | `YOUR_VPS_IP`       |
| A    | www  | `YOUR_VPS_IP`       |

Wait until `ping yourdomain.com` resolves to the VPS IP.

---

## 2. VPS initial setup (SSH as root)

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx postgresql postgresql-contrib ufw

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# PostgreSQL
sudo -u postgres psql -c "CREATE USER lawyer WITH PASSWORD 'STRONG_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE lawyer_db OWNER lawyer;"
```

---

## 3. Clone app

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USER/lawyer-app.git lawyer-app
cd lawyer-app
```

Create `/var/www/lawyer-app/.env.local`:

```env
DATABASE_URL="postgresql://lawyer:STRONG_PASSWORD@localhost:5432/lawyer_db?schema=public"
AUTH_SECRET="output-of-openssl-rand-base64-32"
AUTH_URL="https://yourdomain.com"
NODE_ENV="production"
CRON_SECRET="another-random-secret"
# Optional custom admin prefix (default musaAdv):
# NEXT_PUBLIC_ADMIN_PATH_PREFIX="musaAdv"
```

Generate secrets:

```bash
openssl rand -base64 32
```

---

## 4. Build & start (PM2)

```bash
cd /var/www/lawyer-app
npm ci
npx prisma generate
npx prisma db push
npm run db:seed   # first deploy only
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # run the command it prints
```

Verify locally:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/musaAdv/login
```

Both should return `200`.

---

## 5. nginx

Edit `server_name` in `nginx.conf`, then:

```bash
cp /var/www/lawyer-app/nginx.conf /etc/nginx/sites-available/yourdomain.com
ln -sf /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 6. SSL (Let's Encrypt)

```bash
mkdir -p /var/www/certbot
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Update `.env.local`:

```env
AUTH_URL="https://yourdomain.com"
```

Rebuild and restart:

```bash
cd /var/www/lawyer-app && npm run build && pm2 restart lawyer-app
```

---

## 7. First admin account

Open in incognito:

- **Signup:** `https://yourdomain.com/musaAdv/signup`
- **Login:** `https://yourdomain.com/musaAdv/login`

Save the recovery code shown at signup.

---

## 8. Future deploys

```bash
chmod +x /var/www/lawyer-app/deploy.sh
APP_DIR=/var/www/lawyer-app PM2_NAME=lawyer-app /var/www/lawyer-app/deploy.sh
```

---

## 9. Archive purge cron (optional)

```bash
crontab -e
```

```
0 3 * * * curl -s -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/archives/purge
```

---

## Production optimizations included

- **Next.js:** SWC minification, `compress`, `optimizePackageImports`, static asset cache headers
- **Images:** AVIF/WebP formats, long cache for uploads
- **nginx:** gzip, `client_max_body_size 260M` (backups), keepalive upstream
- **Mobile:** responsive dashboard tables, viewport meta, touch-friendly dialogs

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 502 Bad Gateway | `pm2 status`, `pm2 logs lawyer-app` |
| Auth redirect loop | `AUTH_URL` must match browser URL exactly (https + domain) |
| Upload/backup fails | Check nginx `client_max_body_size` and disk space |
| Build fails on VPS | Ensure Node 20+, run `npm ci` then `npm run build` |

---

## File uploads persistence

Uploaded files live in `/var/www/lawyer-app/public/uploads`. Back them up with the admin **Backup & Restore** feature or include this folder in VPS snapshots.
