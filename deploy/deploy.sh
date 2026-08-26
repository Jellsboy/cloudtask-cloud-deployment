#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/cloudtask}"
cd "$APP_DIR"

echo "[1/5] Installing dependencies..."
npm install

echo "[2/5] Building frontend..."
npm run build

echo "[3/5] Restarting application..."
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

echo "[4/5] Running local health check..."
sleep 2
curl --fail --silent http://127.0.0.1:3000/api/health

echo
echo "[5/5] Deployment completed successfully."
