#!/bin/bash
set -e
echo "========================================="
echo "   Typro - Updating Server Application   "
echo "========================================="

# Navigate to project root
cd "$(dirname "$0")"

echo ">> 1. Pulling latest code from GitHub..."
git pull origin main

echo ">> 2. Building Backend..."
cd backend
npm run build
cd ..

echo ">> 3. Building Frontend..."
cd frontend
npm run build
cd ..

echo ">> 4. Restarting PM2 services..."
pm2 restart all

echo "========================================="
echo "   Typro Update Completed Successfully! "
echo "========================================="
pm2 status
