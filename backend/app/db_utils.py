from pathlib import Path
from sqlalchemy import text
from . import db
from app import create_app
import pymysql
import os


def _execute_with_pymysql(db_params, statements, return_rows=False):
    results = []
    conn = pymysql.connect(
        host=db_params.get('host', '127.0.0.1'),
        port=int(db_params.get('port', 3306)),
        user=db_params.get('user'),
        password=db_params.get('password'),
        database=db_params.get('database'),
        charset=db_params.get('charset', 'utf8mb4'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )
    try:
        with conn.cursor() as cur:
            for stmt in statements:
                if return_rows and stmt.lstrip().upper().startswith('SELECT'):
                    cur.execute(stmt)
                    rows = cur.fetchall()
                    results.append([dict(r) for r in rows])
                else:
                    cur.execute(stmt)
        conn.commit()
    finally:
        conn.close()
    return results


def execute_sql_file(path: str, app=None, return_rows: bool = False):
    """
    Execute a .sql file against the configured SQLAlchemy engine.

    - path: absolute or relative path to SQL file. If relative, it is resolved from CWD.
    - app: optional Flask app instance. If not provided, a new app is created via create_app().
    - return_rows: if True, SELECT statements' results are collected and returned as a list
      (one entry per SELECT statement). For a single SELECT file, the caller will typically
      use the first element.

    Notes:
    - This naive implementation splits statements on semicolons. It works for plain DDL/DML
      SQL files that don't use custom DELIMITER blocks (stored procedures/triggers). For those
      cases prefer using the mysql CLI or a driver that supports multi-statement execution.
    - Uses SQLAlchemy Engine / connection to benefit from pooling and transactions.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"SQL file not found: {p}")

    sql = p.read_text(encoding="utf-8")

    # Ensure we have an app context and that db is initialized with the app
    if app is None:
        app = create_app()

    statements = [s.strip() for s in sql.split(';') if s.strip()]
    results = []

    with app.app_context():
        # Try to use SQLAlchemy engine if it's initialized and SQLAlchemy is enabled
        try:
            # db.engine will raise if not initialized
            engine = getattr(db, 'engine', None)
            no_sqla = app.config.get('NO_SQLALCHEMY') or os.getenv('NO_SQLALCHEMY')
            if engine is not None and not no_sqla:
                with db.engine.begin() as conn:
                    for stmt in statements:
                        if return_rows and stmt.lstrip().upper().startswith('SELECT'):
                            res = conn.execute(text(stmt))
                            rows = [dict(r) for r in res.mappings().all()]
                            results.append(rows)
                        else:
                            conn.execute(text(stmt))
                return results if return_rows else True
        except Exception:
            # fall through to PyMySQL
            pass

        # Fallback: use raw PyMySQL connection driven by app.config['DB_PARAMS']
        db_params = app.config.get('DB_PARAMS', {
            'host': os.getenv('MYSQL_HOST', '127.0.0.1'),
            'port': int(os.getenv('MYSQL_PORT', '3306')),
            'user': os.getenv('MYSQL_USER', None),
            'password': os.getenv('MYSQL_PASSWORD', None),
            'database': os.getenv('MYSQL_DATABASE', None),
            'charset': os.getenv('MYSQL_CHARSET', 'utf8mb4')
        })

        return _execute_with_pymysql(db_params, statements, return_rows=return_rows)


def run_sql_file(path: str, app=None):
    """Backward-compatible wrapper that simply executes the file and returns True on success."""
    execute_sql_file(path, app=app, return_rows=False)
    return True
