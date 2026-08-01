#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/lawyer-app}"
PM2_NAME="${PM2_NAME:-lawyer-app}"

cd "$APP_DIR"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies..."
npm ci

echo "==> Prisma generate + schema sync..."
npx prisma generate
npx prisma db push

echo "==> Production build..."
export NODE_ENV=production
npm run build

echo "==> Restarting PM2..."
pm2 restart "$PM2_NAME" --update-env
pm2 save

echo "==> Health check..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
  echo "WARNING: Home page returned HTTP $HTTP_CODE"
  pm2 logs "$PM2_NAME" --lines 30 --nostream
  exit 1
fi

echo "Deploy complete. HTTP $HTTP_CODE"
