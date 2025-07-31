# Makefile for birdnest-shop monorepo

.PHONY: backend frontend run test stop

backend:
	cd backend && rm -rf .next && npm install && npm run start:dev

frontend:
	cd frontend &&  rm -rf .next && npm install && npm run dev

run:
	(cd backend && rm -rf .next && npm install && npm run start:dev &) && (cd frontend &&  rm -rf .next && npm install && npm run dev)

test:
	cd backend && npm test && cd ../frontend && npm test

stop:
	pkill -f "npm run start:dev" || true
	pkill -f "npm run dev" || true 