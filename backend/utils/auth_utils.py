import hashlib
import jwt
import datetime
from functools import wraps
from flask import current_app, request, jsonify, g


# Hash password (SHA256)
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# Generate JWT token using Flask SECRET_KEY
def generate_token(account_id, role):
    payload = {
        "account_id": account_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12),
    }
    secret = current_app.config["SECRET_KEY"]
    return jwt.encode(payload, secret, algorithm="HS256")


# Verify JWT token
def verify_token(token):
    secret = current_app.config["SECRET_KEY"]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def login_required(role=None):
    """
    Decorator to enforce that a valid JWT is present in the Authorization header.

    - Expects header: Authorization: Bearer <token>
    - Optionally enforces a specific role ("patient" / "physician")
    - On success, stores the decoded payload on flask.g.current_user
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                return (
                    jsonify({"success": False, "message": "Authorization header missing or invalid"}),
                    401,
                )

            token = parts[1]
            payload = verify_token(token)
            if not payload:
                return jsonify({"success": False, "message": "Invalid or expired token"}), 401

            if role and payload.get("role") != role:
                return jsonify({"success": False, "message": "Forbidden"}), 403

            # Attach user info to the request context
            g.current_user = payload
            return fn(*args, **kwargs)

        return wrapper

    return decorator

