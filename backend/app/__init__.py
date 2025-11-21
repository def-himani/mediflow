import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Load .env file
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__, static_folder=None)

    # -----------------------
    # CORS Configuration
    # -----------------------
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # -----------------------
    # Database Configuration
    # -----------------------
    mysql_host = os.getenv('MYSQL_HOST', '127.0.0.1')
    mysql_port = os.getenv('MYSQL_PORT', '3306')
    mysql_user = os.getenv('MYSQL_USER', 'mediflow_admin')
    mysql_password = os.getenv('MYSQL_PASSWORD', 'password123')
    mysql_db = os.getenv('MYSQL_DATABASE', 'mediflow')
    mysql_charset = os.getenv('MYSQL_CHARSET', 'utf8mb4')

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or (
        f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}"
    )

    app.config['DB_PARAMS'] = {
        'host': mysql_host,
        'port': int(mysql_port),
        'user': mysql_user,
        'password': mysql_password,
        'database': mysql_db,
        'charset': mysql_charset
    }

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')

    # -----------------------
    # Initialize DB & Migrate
    # -----------------------
    no_sqla = os.getenv('NO_SQLALCHEMY', '').lower() in ('1', 'true', 'yes')
    if not no_sqla:
        db.init_app(app)
        migrate.init_app(app, db)

    # -----------------------
    # Register Blueprints
    # -----------------------
    from .routes import api_bp
    from routes.patient_routes import patient_bp
    from routes.physician_routes import physician_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(patient_bp, url_prefix='/api/patient')
    app.register_blueprint(physician_bp, url_prefix='/api/physician')

    return app
