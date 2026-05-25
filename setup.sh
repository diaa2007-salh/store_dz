#!/bin/bash
# setup.sh — One-command DZ Store bootstrap

set -e

echo "🚀 DZ Store — Setup Script"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ first."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d. -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check .env
if [ ! -f ".env" ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit .env and add your DATABASE_URL and Yalidine credentials!"
  echo "   Then re-run this script."
  exit 0
fi

# Check DATABASE_URL
if grep -q 'DATABASE_URL="postgresql://postgres:password' .env; then
  echo "⚠️  Warning: DATABASE_URL still has default placeholder. Update .env!"
fi

echo "📦 Installing dependencies..."
npm install

echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing schema to database..."
npx prisma db push

echo "🌱 Seeding database (58 wilayas, admin user, sample products)..."
npx tsx prisma/seed.ts

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "👤 Admin credentials:"
echo "   Email:    admin@dz-store.dz"
echo "   Password: Admin@123"
echo ""
echo "🚀 Start development server:"
echo "   npm run dev"
echo ""
echo "🌐 Open:"
echo "   Storefront: http://localhost:3000"
echo "   Admin:      http://localhost:3000/admin/dashboard"
echo "   Login:      http://localhost:3000/auth/login"
echo "================================"
