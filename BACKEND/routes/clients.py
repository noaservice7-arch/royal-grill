from flask import Blueprint, request, jsonify
from flask_mysqldb import MySQL

clients_bp = Blueprint('clients', __name__)
mysql = MySQL()

# Créer un compte client
@clients_bp.route('/creer', methods=['POST'])
def creer_client():
    data  = request.get_json()
    nom   = data.get('nom')
    email = data.get('email')
    code  = data.get('code')

    if not nom or not email or not code:
        return jsonify({'erreur': 'Tous les champs sont obligatoires'}), 400

    if len(code) != 4 or not code.isdigit():
        return jsonify({'erreur': 'Le code doit contenir exactement 4 chiffres'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO clients (nom, email, code) VALUES (%s, %s, %s)", (nom, email, code))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Compte créé avec succès'}), 201
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Récupérer tous les clients
@clients_bp.route('/', methods=['GET'])
def get_clients():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM clients ORDER BY created_at DESC")
        clients = cur.fetchall()
        cur.close()
        return jsonify({'clients': clients}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Supprimer un client
@clients_bp.route('/supprimer/<int:id>', methods=['DELETE'])
def supprimer_client(id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM clients WHERE id=%s", (id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Client supprimé'}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Vérifier un client
@clients_bp.route('/verifier', methods=['POST'])
def verifier_client():
    data  = request.get_json()
    email = data.get('email')
    code  = data.get('code')

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM clients WHERE email=%s AND code=%s", (email, code))
        client = cur.fetchone()
        cur.close()
        if client:
            return jsonify({'message': 'Connexion réussie', 'client': client}), 200
        else:
            return jsonify({'erreur': 'Email ou code incorrect'}), 401
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500