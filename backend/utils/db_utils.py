import pymysql
from flask import current_app

def get_db_connection():
    """
    Opens a raw PyMySQL DB connection using DB_PARAMS configured in create_app()
    """
    db_params = current_app.config['DB_PARAMS']

    return pymysql.connect(
        host=db_params['host'],
        port=db_params['port'],
        user=db_params['user'],
        password=db_params['password'],
        database=db_params['database'],
        charset=db_params['charset'],
        cursorclass=pymysql.cursors.DictCursor
    )
