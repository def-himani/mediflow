# Makefile for mediflow
.PHONY: help setup venv install-backend run-backend run-frontend build-prod up-prod down-prod test lint seed schema bootstrap

help:
	@echo "Available targets: setup venv install-backend run-backend run-frontend build-prod up-prod down-prod test lint"

setup:
	python3 -m venv .venv
	@echo "Run 'source .venv/bin/activate' to activate the venv, then run 'make install-backend'"

install-backend:
	python -m pip install --upgrade pip
	pip install -r backend/requirements.txt

run-backend:
	# Run backend in local dev mode
	cd backend && python run.py

run-frontend:
	# Run frontend dev server
	cd frontend && npm install && npm run dev

build-prod:
	docker-compose -f docker-compose.prod.yml build --no-cache

up-prod:
	docker-compose -f docker-compose.prod.yml up -d --build

down-prod:
	docker-compose -f docker-compose.prod.yml down

test:
	# Run backend tests locally
	pytest -q

lint:
	# placeholder for linting commands
	@echo "Add linters (flake8, eslint) as needed"

# Database SQL helpers (use backend/manage.py)
seed:
	@echo "Running seed SQL (backend/sql/seeds.sql)"
	python backend/manage.py seed

schema:
	@echo "Running schema SQL (backend/sql/schema.sql)"
	python backend/manage.py schema

bootstrap:
	@echo "Running schema then seeds"
	python backend/manage.py all
