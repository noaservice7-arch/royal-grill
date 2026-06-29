from flask import Blueprint, request, jsonify
from flask_mysqldb import MySQL

avis_bp = Blueprint('avis', __name__)
mysql = MySQL()

# Ajouter un avis
@avis_bp.route('/ajouter', methods=['POST'])
def ajouter_avis():
    data       = request.get_json()
    client_id  = data.get('client_id')
    note       = data.get('note')
    commentaire = data.get('commentaire')

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO avis (client_id, note, commentaire)
            VALUES (%s, %s, %s)
        """, (client_id, note, commentaire))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Avis ajouté avec succès'}), 201
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Récupérer tous les avis
@avis_bp.route('/', methods=['GET'])
def get_avis():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT a.*, c.nom FROM avis a
            JOIN clients c ON a.client_id = c.id
            ORDER BY a.created_at DESC
        """)
        avis = cur.fetchall()
        cur.close()
        return jsonify({'avis': avis}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500