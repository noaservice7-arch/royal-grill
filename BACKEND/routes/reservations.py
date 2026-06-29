from flask import Blueprint, request, jsonify
from flask_mysqldb import MySQL

reservations_bp = Blueprint('reservations', __name__)
mysql = MySQL()

# Créer une réservation
@reservations_bp.route('/creer', methods=['POST'])
def creer_reservation():
    data = request.get_json()

    client_id       = data.get('client_id')
    table_id        = data.get('table_id')
    nom             = data.get('nom')
    email           = data.get('email')
    whatsapp        = data.get('whatsapp')
    date_reservation = data.get('date_reservation')
    formule         = data.get('formule')
    occasion        = data.get('occasion')
    boisson_accueil = data.get('boisson_accueil', None)
    decor_table     = data.get('decor_table', None)
    ambiance        = data.get('ambiance', None)
    surprise_fin    = data.get('surprise_fin', None)

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO reservations 
            (client_id, table_id, nom, email, whatsapp, date_reservation, 
             formule, occasion, boisson_accueil, decor_table, ambiance, surprise_fin)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (client_id, table_id, nom, email, whatsapp, date_reservation,
              formule, occasion, boisson_accueil, decor_table, ambiance, surprise_fin))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Réservation créée avec succès'}), 201
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Récupérer toutes les réservations
@reservations_bp.route('/', methods=['GET'])
def get_reservations():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM reservations ORDER BY created_at DESC")
        reservations = cur.fetchall()
        cur.close()
        return jsonify({'reservations': reservations}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Modifier le statut d'une réservation
@reservations_bp.route('/statut/<int:id>', methods=['PUT'])
def modifier_statut(id):
    data   = request.get_json()
    statut = data.get('statut')

    try:
        cur = mysql.connection.cursor()
        cur.execute("UPDATE reservations SET statut=%s WHERE id=%s", (statut, id))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Statut mis à jour'}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Supprimer une réservation
@reservations_bp.route('/supprimer/<int:id>', methods=['DELETE'])
def supprimer_reservation(id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM reservations WHERE id=%s", (id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Réservation supprimée'}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500