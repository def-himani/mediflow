# MediFlow (mediflow)

Full-stack scaffold: Flask (backend) + React (Vite) frontend + MySQL + Bootstrap.

Quick start (macOS / zsh):

1. Copy environment file and edit values:

   cp .env.example .env
   # edit .env to set passwords

2. Run with Docker Compose (recommended)

Development (fast feedback, Vite dev server):

   docker-compose up -d --build

Production (build optimized frontend, serve with nginx):

   # builds production images and serves frontend via nginx on port 3000
   docker-compose -f docker-compose.prod.yml up -d --build

3. Backend health check:

   curl http://localhost:5004/api/health

4. Frontend dev site:

   Open http://localhost:3000

Backend local dev (without Docker):

- Create a venv and install requirements

  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r backend/requirements.txt

- Run the app

  cd backend
   python run.py

Production notes (for teams):

- Use `docker-compose.prod.yml` for production image builds. It builds the React app and serves it with nginx.
- Do not commit real secrets. Keep secrets in `.env` or use a secret manager (Vault, Docker secrets, or your cloud provider).
- Developers should use the standard `docker-compose.yml` for local dev and the `.env.example` file as a template.

Database migrations:

- Initialize migrations locally (one-time):

   cd backend
   flask db init


# MediFlow — Full setup & developer guide

This file contains the detailed step-by-step instructions for cloning, setting up environments, where to add frontend HTML/pages, how to run locally (dev and prod), and useful commands for teams.

- In CI, run `docker build` for backend and frontend and push images to your registry. Then deploy using your orchestration platform.


Frontend local dev (without Docker):

  cd frontend
  npm install
  npm run dev


Repository: https://github.com/IvanYeung0610/MediFlow.git
