# Makefile for birdnest-shop monorepo

.PHONY: backend frontend run test test-backend test-frontend stop clear-db clear-db-all clear-db-orders clear-db-users clear-db-products clear-db-images clear-db-reviews clear-db-help db-seed db-migrate db-reset db-generate db-studio help

backend:
	@echo "🚀 Starting backend development server"
	cd birdnest-backend && rm -rf .next && npm install && npm run start:dev

# Database Management
db-seed:
	cd birdnest-backend && npm run seed

db-setup-settings:
	@echo "⚙️  Setting up default settings"
	cd birdnest-backend && npm run setup-settings

db-migrate:
	cd birdnest-backend && npx prisma migrate dev

db-reset:
	cd birdnest-backend && npx prisma migrate reset --force

db-generate:
	cd birdnest-backend && npx prisma generate

db-studio:
	cd birdnest-backend && npx prisma studio

# Database Clear Commands
clear-db:
	@echo "🗑️  Interactive database clear (recommended)"
	cd birdnest-backend && npm run clear-db

clear-db-all:
	@echo "🗑️  Clearing all database data"
	cd birdnest-backend && npm run clear-db -- --all

clear-db-orders:
	@echo "🗑️  Clearing orders data only"
	cd birdnest-backend && npm run clear-db -- --orders

clear-db-users:
	@echo "🗑️  Clearing users data only"
	cd birdnest-backend && npm run clear-db -- --users

clear-db-products:
	@echo "🗑️  Clearing products data only"
	cd birdnest-backend && npm run clear-db -- --products

clear-db-images:
	@echo "🗑️  Clearing images data only"
	cd birdnest-backend && npm run clear-db -- --images

clear-db-reviews:
	@echo "🗑️  Clearing reviews data only"
	cd birdnest-backend && npm run clear-db -- --reviews

clear-db-help:
	@echo "📖 Showing database clear help"
	cd birdnest-backend && npm run clear-db -- --help

frontend:
	@echo "🌐 Starting frontend development server"
	cd birdnest-frontend && rm -rf .next && npm install && npm run dev

run:
	@echo "🚀 Starting both backend and frontend servers"
	(cd birdnest-backend && rm -rf .next && npm install && npm run start:dev &) && (cd birdnest-frontend && rm -rf .next && npm install && npm run dev)

test:
	@echo "🧪 Running tests for both backend and frontend"
	cd birdnest-backend && npm test && cd ../frontend && npm test

test-backend:
	@echo "🧪 Running backend tests"
	cd birdnest-backend && npm test

test-frontend:
	@echo "🧪 Running frontend tests"
	cd birdnest-frontend && npm test

stop:
	@echo "🛑 Stopping all development servers"
	pkill -f "npm run start:dev" || true
	pkill -f "npm run dev" || true

help:
	@echo "🐦 Birdnest Shop - Available Commands"
	@echo ""
	@echo "🚀 Development Servers:"
	@echo "  make backend          - Start backend development server"
	@echo "  make frontend         - Start frontend development server"
	@echo "  make run              - Start both servers"
	@echo "  make stop             - Stop all development servers"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test             - Run all tests"
	@echo "  make test-backend     - Run backend tests only"
	@echo "  make test-frontend    - Run frontend tests only"
	@echo ""
	@echo "🗄️  Database Management:"
	@echo "  make db-seed          - Seed database with initial data"
	@echo "  make db-setup-settings - Setup default settings"
	@echo "  make db-migrate       - Run database migrations"
	@echo "  make db-reset         - Reset database (WARNING: destructive)"
	@echo "  make db-generate      - Generate Prisma client"
	@echo "  make db-studio        - Open Prisma Studio"
	@echo ""
	@echo "🗑️  Database Clear Commands:"
	@echo "  make clear-db         - Interactive database clear (recommended)"
	@echo "  make clear-db-all     - Clear all database data"
	@echo "  make clear-db-orders  - Clear orders data only"
	@echo "  make clear-db-users   - Clear users data only"
	@echo "  make clear-db-products- Clear products data only"
	@echo "  make clear-db-images   - Clear images data only"
	@echo "  make clear-db-reviews - Clear reviews data only"
	@echo "  make clear-db-help    - Show database clear help"
	@echo ""
	@echo "💡 Tips:"
	@echo "  - Use 'make help' to see this message again"
	@echo "  - Database clear commands require confirmation"
	@echo "  - Use 'make db-reset' to completely reset database" 