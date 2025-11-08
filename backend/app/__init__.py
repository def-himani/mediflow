import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Load .env from project root so environment variables in .env are available automatically
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__, static_folder=None)
    # Load config from env
    # support full DATABASE_URL or individual MYSQL_* variables (with optional MYSQL_PORT)
    mysql_host = os.getenv('MYSQL_HOST', 'mysql')
    mysql_port = os.getenv('MYSQL_PORT', '')
    # if MYSQL_HOST already contains a colon, assume port included
    if mysql_port and ':' not in mysql_host:
        host_port = f"{mysql_host}:{mysql_port}"
    else:
        host_port = mysql_host

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or (
        f"mysql+pymysql://{os.getenv('MYSQL_USER','mediflow_user')}:{os.getenv('MYSQL_PASSWORD','mediflow_pass')}@{host_port}/{os.getenv('MYSQL_DATABASE','mediflow_db')}"
    )
    # Expose raw connection params for non-SQLAlchemy usage
    app.config['DB_PARAMS'] = {
        'host': os.getenv('MYSQL_HOST', 'mysql'),
        'port': int(os.getenv('MYSQL_PORT', '3306')) if os.getenv('MYSQL_PORT') else 3306,
        'user': os.getenv('MYSQL_USER', 'mediflow_user'),
        'password': os.getenv('MYSQL_PASSWORD', 'mediflow_pass'),
        'database': os.getenv('MYSQL_DATABASE', 'mediflow_db'),
        'charset': os.getenv('MYSQL_CHARSET', 'utf8mb4')
    }
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY','dev-secret')

    # Optionally disable SQLAlchemy initialization if NO_SQLALCHEMY is set (true/1/yes)
    no_sqla = os.getenv('NO_SQLALCHEMY', '').lower() in ('1', 'true', 'yes')
    if not no_sqla:
        db.init_app(app)
        migrate.init_app(app, db)
    CORS(app)

    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp)

    return app
