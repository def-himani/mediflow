import hashlib
import jwt
import datetime
from flask import current_app

# Hash password (SHA256)
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Generate JWT token using Flask SECRET_KEY
def generate_token(account_id, role):
    payload = {
        "account_id": account_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }
    secret = current_app.config['SECRET_KEY']
    return jwt.encode(payload, secret, algorithm="HS256")

# Verify JWT token
def verify_token(token):
    secret = current_app.config['SECRET_KEY']
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
