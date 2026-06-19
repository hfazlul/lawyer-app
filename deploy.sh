#!/bin/bash
cd /var/www/lawyer-app
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart lawyer-app
