.PHONY: setup dev dev-frontend dev-backend lint

# ── Setup ────────────────────────────────────────────────────────────────

setup:
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "🐍 Setting up Python backend..."
	cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
	@echo "✅ Setup complete. Copy backend/.env.example to backend/.env and fill in your keys."

# ── Development ──────────────────────────────────────────────────────────

dev:
	@echo "🚀 Starting Coral Copilot..."
	$(MAKE) dev-frontend & $(MAKE) dev-backend & wait

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && ./venv/bin/uvicorn main:app --reload --port 8000

# ── Linting ──────────────────────────────────────────────────────────────

lint:
	@echo "🔍 Linting frontend..."
	cd frontend && npx eslint . --ext .ts,.tsx
	@echo "🔍 Linting backend..."
	cd backend && ./venv/bin/ruff check .
