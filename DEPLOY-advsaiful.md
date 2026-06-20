# Deploy lawyer-app-saiful to advsaiful.com (Contabo VPS 5.189.152.125)

Dedicated repo: [github.com/hfazlul/lawyer-app-saiful](https://github.com/hfazlul/lawyer-app-saiful) (separate from [lawyer-app](https://github.com/hfazlul/lawyer-app) used for advmusa.com).

Same application codebase; admin panel lives at `/saifulAdv/` instead of `/musaAdv/`.
Set `NEXT_PUBLIC_ADMIN_PATH_PREFIX=saifulAdv` before `npm run build`.

---

## 1. DNS (at your domain registrar)

| Type | Name | Value        | TTL |
|------|------|--------------|-----|
| A    | @    | 5.189.152.125 | 300 |
| A    | www  | 5.189.152.125 | 300 |

Wait until `dig advsaiful.com +short` returns `5.189.152.125`.

---

## 2. Initial VPS setup (run as root on 5.189.152.125)

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx postgresql postgresql-contrib

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# PostgreSQL database
sudo -u postgres psql -c "CREATE USER lawyer WITH PASSWORD 'STRONG_PASSWORD_HERE';"
sudo -u postgres psql -c "CREATE DATABASE lawyer_db OWNER lawyer;"
```

---

## 3. Clone repo and configure environment

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/hfazlul/lawyer-app-saiful.git lawyer-app-saiful
cd lawyer-app-saiful
```

Create `/var/www/lawyer-app-saiful/.env.local`:

```env
DATABASE_URL="postgresql://lawyer:STRONG_PASSWORD_HERE@localhost:5432/lawyer_db?schema=public"
AUTH_SECRET="paste-output-of-openssl-rand-base64-32"
AUTH_URL="https://advsaiful.com"
NEXT_PUBLIC_ADMIN_PATH_PREFIX="saifulAdv"
CRON_SECRET="another-random-secret"
NODE_ENV="production"
```

Generate secrets:

```bash
openssl rand -base64 32
```

---

## 4. Build and start with PM2

```bash
cd /var/www/lawyer-app-saiful
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start ecosystem.saiful.config.js
pm2 save
pm2 startup   # follow the printed command
```

Verify locally on the VPS:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/saifulAdv/login
```

Both should return `200`.

---

## 5. nginx

```bash
cp /var/www/lawyer-app-saiful/nginx-advsaiful.conf /etc/nginx/sites-available/advsaiful.com
ln -sf /etc/nginx/sites-available/advsaiful.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 6. SSL (Let's Encrypt)

```bash
mkdir -p /var/www/certbot
certbot --nginx -d advsaiful.com -d www.advsaiful.com
```

Certbot updates nginx for HTTPS. Confirm `.env.local` has `AUTH_URL="https://advsaiful.com"`, then:

```bash
cd /var/www/lawyer-app-saiful && npm run build && pm2 restart lawyer-app-saiful
```

---

## 7. First-time admin setup

Open in a private/incognito window:

**https://advsaiful.com/saifulAdv/signup**

Create the admin account, save the recovery code, then log in at:

**https://advsaiful.com/saifulAdv/login**

---

## 8. Future deploys (`deploy.sh`)

Copy and adjust `deploy.sh` on the server, or run manually:

```bash
cd /var/www/lawyer-app-saiful
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart lawyer-app-saiful
```

Ensure `.env.local` keeps `NEXT_PUBLIC_ADMIN_PATH_PREFIX=saifulAdv` — the prefix is baked in at build time.

---

## 9. Optional: archive purge cron

```bash
crontab -e
```

Add (daily at 3 AM):

```
0 3 * * * curl -s -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://advsaiful.com/api/archives/purge
```

---

## Route structure (how `/saifulAdv` works)

- App Router pages stay in `src/app/(admin)/musaAdv/` (internal segment name is fixed).
- `NEXT_PUBLIC_ADMIN_PATH_PREFIX=saifulAdv` sets the public URL prefix.
- `next.config.ts` rewrites `/saifulAdv/*` → `/musaAdv/*` so the same pages serve both deployments.
- All links, middleware, and auth use `ADMIN_BASE` / `adminPath()` from `src/lib/constants.ts`.
- **advmusa.com**: omit the env var (defaults to `musaAdv`, no rewrites).
- **advsaiful.com**: set `saifulAdv` before build.

---

## Backward compatibility (advmusa.com)

No changes required on the existing VPS. Do **not** set `NEXT_PUBLIC_ADMIN_PATH_PREFIX` (or set it to `musaAdv`). Pull the updated code and redeploy as usual — `/musaAdv/*` continues to work.
