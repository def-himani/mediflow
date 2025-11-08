# MediFlow — Full setup, SQL placement and developer guide

This file documents where to put raw MySQL files, how the backend executes them, and how to consume SELECT results from the frontend.

## SQL folder structure (create these under `backend/sql/`)

- `backend/sql/schema/` — versioned DDL migration files (use `v001__...` naming to order files).
- `backend/sql/seeds/` — idempotent seed files.
- `backend/sql/queries/` — read-only SELECT files intended for frontend consumption. Follow single-query-per-file rule.
- `backend/sql/mutations/` — DML files (INSERT/UPDATE/DELETE). Run these from admin/CI only.
- `backend/sql/procs/` — stored procedures/triggers/functions. These may contain `DELIMITER` blocks and must be applied with the `mysql` CLI or a connector that supports multi-statement execution.
- `backend/sql/transactions/` — multi-statement transactional workflows (multiple statements that must run atomically).

> NOTE: You can create these directories now; example query and mutation files are already included in the repo under `backend/sql/queries` and `backend/sql/mutations`.

## Single-query-per-file rule (recommended)

- Keep exactly one SELECT in each file under `queries/`. This makes it trivial for the frontend to parse results and avoids ambiguity.
- Parameterize queries using named binds, e.g. `:user_id`, and bind values from Python to avoid SQL injection.
- Example file name: `backend/sql/queries/get_user_by_email.sql`.

## Connecting to your local MySQL (exact steps)

Follow these exact steps so the backend connects to your local MySQL server using a local `.env` file.

1) Create a `.env` file in the project root (do NOT commit this file). You can copy the example:

```bash
cp .env.example .env
```

2) Put your MySQL connection details into `.env`. You have two options — full URL or individual vars.

- Option A (recommended): full SQLAlchemy URL.

```bash
# .env (repo root)
DATABASE_URL='mysql+pymysql://<DB_USER>:<DB_PASS>@127.0.0.1:3306/<DB_NAME>?charset=utf8mb4'
VITE_API_BASE=http://localhost:5004
FLASK_ENV=development
SECRET_KEY=replace-me
NO_SQLALCHEMY=true   # optional: set to true if you do not want SQLAlchemy initialized
```

- Option B: individual MySQL fields (used by the project if `DATABASE_URL` is absent).

```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=mediflow_user
MYSQL_PASSWORD=mediflow_pass
MYSQL_DATABASE=mediflow_db
VITE_API_BASE=http://localhost:5004
FLASK_ENV=development
SECRET_KEY=replace-me
NO_SQLALCHEMY=true
```

Notes about the variables:
- `DATABASE_URL` overrides the other MYSQL_* values when present.
- `MYSQL_PORT` is supported by the app; if you omit it the default 3306 is used.
- `NO_SQLALCHEMY=true` tells the app not to initialize Flask-SQLAlchemy; the SQL runner will fall back to a raw PyMySQL connection.

3) The app will automatically load `.env` (dev convenience). If you prefer not to rely on that, export variables into your shell instead:

```bash
set -a
source .env
set +a
```

4) Ensure your MySQL server is running and the database exists. Example SQL (run in the mysql client):

```sql
CREATE DATABASE IF NOT EXISTS mediflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mediflow_user'@'localhost' IDENTIFIED BY 'mediflow_pass';
GRANT ALL PRIVILEGES ON mediflow_db.* TO 'mediflow_user'@'localhost';
FLUSH PRIVILEGES;
```

5) Run schema/seeds (if provided) and start the backend:

```bash
# from repo root
python backend/manage.py schema
python backend/manage.py seed
python backend/run.py
```

6) Quick API smoke-tests

```bash
# health
curl http://localhost:5004/api/health
# run a read-only query file (queries/get_users.sql)
curl "http://localhost:5004/api/query_file?file=queries/get_users.sql"
```

Security reminder: never commit your `.env` or real credentials. Use `.env.example` for placeholders and a secret manager in production.

## How the backend executes SQL files

- Use the helper functions in `backend/app/db_utils.py`:
  - `execute_sql_file(path, return_rows=True)` — reads a file, splits top-level statements (ignoring semicolons inside strings/comments), executes statements via SQLAlchemy engine, and returns SELECT results as lists of dicts when `return_rows=True`.
  - `run_sql_file(path)` — simple wrapper for executing files that don't need results returned.

- The demo endpoint (developer convenience) is:
  - `GET /api/query_file?file=queries/get_users.sql`
  - This only allows files residing under `backend/sql/` and returns JSON like `{ "file": "queries/get_users.sql", "results": [ { ... }, ... ] }` for the single-SELECT case.

## Frontend usage

- The frontend demo page `/queries` fetches `GET /api/query_file?file=queries/get_users.sql` and displays results in a table.
- Example fetch (frontend calls `API_BASE + '/api/query_file'` with `file=queries/get_users.sql`).
- For production, prefer mapping specific query files to dedicated API endpoints and enforcing auth/authorization and read-only DB credentials.

## Stored procedures and DELIMITER

- Files in `procs/` often use `DELIMITER` and cannot be safely split by simple semicolon-based parsers. Apply them using one of:
  - `mysql` CLI: `mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < backend/sql/procs/create_user_proc.sql` (prefer `--defaults-extra-file` for credentials)
  - `mysql-connector-python` with `cursor.execute(sql, multi=True)`

## Security best practices

- Only expose read-only query files to untrusted clients. Use DB users with `SELECT` only for frontend-facing queries.
- Keep mutation files out of public endpoints; run them from CI/ops with proper checks.
- Never commit credentials. Use `.env` for local dev and a secret manager for production.

## Example: parameterized SELECT and Python execution

File: `backend/sql/queries/get_user_by_email.sql`

```sql
-- queries/get_user_by_email.sql
SELECT id, email, is_active, created_at
FROM users
WHERE email = :email;
```

Python usage:

```python
from sqlalchemy import text
from backend.app import db

sql = open('backend/sql/queries/get_user_by_email.sql').read()
with db.engine.connect() as conn:
    res = conn.execute(text(sql), {"email": "alice@example.com"})
    rows = [dict(r) for r in res.mappings().all()]
```

## Demo and developer commands

- Demo endpoint: `GET /api/query_file?file=queries/get_users.sql` (returns JSON). The frontend demo page is at `/queries`.
- Use `python backend/manage.py seed` and `python backend/manage.py schema` to run seed and schema files locally (convenience CLI).

If you'd like, I can add a lightweight `schema_migrations` table and a runner so schema files under `schema/` are applied exactly once and recorded in the DB.

