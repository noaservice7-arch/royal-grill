from flask import Blueprint, request, jsonify
from flask_mysqldb import MySQL

tables_bp = Blueprint('tables', __name__)
mysql = MySQL()

# Récupérer toutes les tables
@tables_bp.route('/', methods=['GET'])
def get_tables():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM tables_restaurant")
        tables = cur.fetchall()
        cur.close()
        return jsonify({'tables': tables}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Ajouter une table
@tables_bp.route('/ajouter', methods=['POST'])
def ajouter_table():
    data     = request.get_json()
    nom      = data.get('nom')
    capacite = data.get('capacite')
    formule  = data.get('formule')

    try:
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO tables_restaurant (nom, capacite, formule) VALUES (%s, %s, %s)",
                    (nom, capacite, formule))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Table ajoutée avec succès'}), 201
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Modifier le statut d'une table
@tables_bp.route('/statut/<int:id>', methods=['PUT'])
def modifier_statut(id):
    data   = request.get_json()
    statut = data.get('statut')

    try:
        cur = mysql.connection.cursor()
        cur.execute("UPDATE tables_restaurant SET statut=%s WHERE id=%s", (statut, id))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Statut mis à jour'}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500

# Supprimer une table
@tables_bp.route('/supprimer/<int:id>', methods=['DELETE'])
def supprimer_table(id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM tables_restaurant WHERE id=%s", (id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Table supprimée'}), 200
    except Exception as e:
        return jsonify({'erreur': str(e)}), 500