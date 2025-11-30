#!/usr/bin/env python3
"""Small CLI to run SQL files for quick bootstrap or seeding.

Usage (from the backend/ directory or repo root):

# from backend/
python manage.py schema    # run backend/sql/schema.sql
python manage.py seed      # run backend/sql/seeds.sql
python manage.py all       # run schema, seeds, and procedures/triggers

# from repo root
python backend/manage.py all
"""
import os
import sys
from pathlib import Path

from app import create_app
from app.db_utils import run_sql_file

BASE_DIR = Path(__file__).resolve().parent


def _sql_path(name: str) -> str:
    return str((BASE_DIR / 'sql' / name).resolve())


def main():
    if len(sys.argv) < 2:
        print("Usage: python manage.py [schema|seed|all]")
        sys.exit(1)

    cmd = sys.argv[1]
    app = create_app()

    if cmd == 'schema':
        run_sql_file(_sql_path('schema.sql'), app)
        print('schema.sql executed')
    elif cmd == 'seed':
        run_sql_file(_sql_path('seeds.sql'), app)
        print('seeds.sql executed')
    elif cmd == 'all':
        run_sql_file(_sql_path('schema.sql'), app)
        print('schema.sql executed')
        run_sql_file(_sql_path('seeds.sql'), app)
        print('seeds.sql executed')
    else:
        print('Unknown command:', cmd)
        print('Usage: python manage.py [schema|seed|all]')


if __name__ == '__main__':
    main()