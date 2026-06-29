from flask import Flask
from flask_cors import CORS
from flask_mysqldb import MySQL
from config import DB_CONFIG

app = Flask(__name__)
CORS(app)

# Configuration base de données
app.config['MYSQL_HOST']     = DB_CONFIG['host']
app.config['MYSQL_USER']     = DB_CONFIG['user']
app.config['MYSQL_PASSWORD'] = DB_CONFIG['password']
app.config['MYSQL_DB']       = DB_CONFIG['database']
app.config['MYSQL_PORT']     = DB_CONFIG['port']

mysql = MySQL(app)

# Importer et enregistrer les routes
from routes.clients      import clients_bp
from routes.reservations import reservations_bp
from routes.tables       import tables_bp
from routes.avis         import avis_bp

app.register_blueprint(clients_bp,      url_prefix='/api/clients')
app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
app.register_blueprint(tables_bp,       url_prefix='/api/tables')
app.register_blueprint(avis_bp,         url_prefix='/api/avis')

if __name__ == '__main__':
    app.run(debug=True, port=5000)