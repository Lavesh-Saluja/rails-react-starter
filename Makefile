# Convenience wrappers. Every target is a plain command you can also run by hand.
COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

.DEFAULT_GOAL := help
.PHONY: help setup hooks backend frontend db-up db-down check-config \
        test test-backend test-frontend lint lint-backend lint-frontend build check

help: ## List available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-14s %s\n", $$1, $$2}'

setup: ## Install gems and npm packages, prepare databases, install Git hooks (non-destructive)
	bin/setup

hooks: ## Install the Lefthook Git hooks
	npx lefthook install

backend: ## Start Rails on http://localhost:3000
	bin/rails server

frontend: ## Start Vite on http://localhost:5173
	npm run dev

db-up: ## OPTIONAL: start PostgreSQL in Docker (port 5434)
	$(COMPOSE) up -d db
	$(COMPOSE) ps db

db-down: ## OPTIONAL: stop the Docker PostgreSQL (data is kept)
	$(COMPOSE) down

check-config: ## Verify Ruby, database and migrations (read-only)
	bin/rails starter:check

test-backend: ## Run Rails Minitest
	bin/rails test

test-frontend: ## Run Vitest
	npm test

test: test-backend test-frontend ## Run all tests

lint-backend: ## RuboCop and Brakeman
	bin/rubocop && bin/brakeman --no-pager --quiet

lint-frontend: ## ESLint and Prettier check
	npm run lint && npm run format:check

lint: lint-backend lint-frontend ## Run all linters

build: ## Frontend production build (outputs dist/)
	npm run build

check: lint test build ## Everything CI runs
