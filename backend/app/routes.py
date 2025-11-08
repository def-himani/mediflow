from flask import Blueprint, jsonify, request
from pathlib import Path
from .db_utils import execute_sql_file

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/health')
def health():
    return jsonify({"status": "ok", "service": "backend"}), 200


@api_bp.route('/users')
def users():
    # sample static data for scaffold
    sample = [
        {"id": 1, "name": "Alice", "email": "alice@example.com"},
        {"id": 2, "name": "Bob", "email": "bob@example.com"},
    ]
    return jsonify(sample), 200


@api_bp.route('/query_file')
def query_file():
    """Execute a SQL file (from backend/sql) and return SELECT results as JSON.

    Query param: file - relative path under backend/sql, e.g. "queries/get_users.sql" or "schema/v001__create_users.sql"

    Security: only files inside the repository's `backend/sql` directory are allowed. Files must be plain
    SQL without DELIMITER/procedure blocks (see README). SELECT results are returned as JSON arrays.
    """
    name = request.args.get('file')
    if not name:
        return jsonify({"error": "missing 'file' query parameter"}), 400

    # compute the sql root directory: backend/sql
    sql_root = Path(__file__).resolve().parents[1] / 'sql'
    target = (sql_root / name).resolve()

    # Ensure path traversal is not allowed and file exists
    try:
        if not str(target).startswith(str(sql_root.resolve())):
            return jsonify({"error": "invalid file path"}), 400
    except Exception:
        return jsonify({"error": "invalid file path"}), 400

    if not target.exists():
        return jsonify({"error": "file not found"}), 404

    try:
        results = execute_sql_file(str(target), app=None, return_rows=True)
    except Exception as e:
        return jsonify({"error": "execution failed", "detail": str(e)}), 500

    # If there is a single SELECT in the file, return that array directly for convenience
    if isinstance(results, list) and len(results) == 1:
        payload = results[0]
    else:
        payload = results

    return jsonify({"file": name, "results": payload}), 200
