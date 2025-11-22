import pymysql
from flask import Blueprint, request, jsonify
from utils.db_utils import get_db_connection
from utils.auth_utils import hash_password, generate_token

physician_bp = Blueprint('physician_bp', __name__)

user_physician={
    "physician": {
        "account_id": 2,
        "license_number": None,
        "specialization_id": None
    }
}

# -------------------
# Signup API
# -------------------
@physician_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json

    # Required fields
    required_fields = ['user_name', 'password', 'first_name', 'last_name', 'email', 'phone']
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # Check if username/email exists
        cursor.execute("SELECT account_id FROM Account WHERE user_name=%s OR email=%s",
                       (data['user_name'], data['email']))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Username/email already exists"}), 400

        # Insert into Account table
        hashed_pw = hash_password(data['password'])
        cursor.execute("""
            INSERT INTO Account (user_name, password, role, first_name, last_name, email, phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data['user_name'], hashed_pw, 'physician', data['first_name'], data['last_name'], data['email'], data['phone']))
        account_id = cursor.lastrowid

        # Insert into Physician table (optional fields)
        cursor.execute("""
            INSERT INTO Physician (account_id, specialization_id, license_number)
            VALUES (%s, %s, %s)
        """, (
            account_id,
            data.get('specialization_id'),
            data.get('license_number')
        ))

        conn.commit()
        token = generate_token(account_id, 'physician')
        return jsonify({"success": True, "message": "Account created successfully", "token": token})

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# -------------------
# Login API
# -------------------
@physician_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        hashed_pw = hash_password(data['password'])
        cursor.execute("SELECT * FROM Account WHERE user_name=%s AND password=%s AND role='physician'",
                       (data['user_name'], hashed_pw))
        account = cursor.fetchone()

        if not account:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        # Fetch physician details
        cursor.execute("SELECT * FROM Physician WHERE account_id=%s", (account['account_id'],))
        physician = cursor.fetchone()

        token = generate_token(account['account_id'], account['role'])

        return jsonify({
            "success": True,
            "token": token,
            "physician": physician
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# -------------------
# Physician Specific Health Record API
# -------------------
@physician_bp.route('/healthRecord/record/<record_id>', methods=['GET'])
def healthRecord(record_id):
    print("record_id=",record_id)
    if not record_id:
        return jsonify({"error": "record_id is required"}), 400
   
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())
    try:
        cursor.execute("SELECT h.record_id, h.patient_id, h.visit_date, h.diagnosis, h.symptoms, h.lab_results, h.follow_up_required, CONCAT(a.first_name,' ', a.last_name) AS physician_name, p.prescription_id, m.medication_id, m.dosage, m.frequency, m.duration, m.instructions, med.medication_name, med.dosage_form, med.storage_instructions, med.common_side_effects, med.description FROM healthrecord h INNER JOIN account a ON a.account_id=h.physician_id LEFT JOIN prescription p ON p.record_id=h.record_id LEFT JOIN medicine m ON m.prescription_id=p.prescription_id LEFT JOIN medications med ON med.medication_id=m.medication_id WHERE h.physician_id=%s AND h.record_id=%s",
                       (user_physician["physician"]["account_id"],record_id))
        healthrecord = cursor.fetchall()
        if not healthrecord:
            return jsonify({"error": "You do not have access to the health record!"}), 400
        
        return jsonify({"success": True, "message": "Health Record obtained successfully", "healthrecord": healthrecord})
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
