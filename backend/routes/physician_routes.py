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
        cursor.execute("SELECT h.record_id, h.patient_id, h.visit_date, h.diagnosis, h.symptoms, h.lab_results, h.follow_up_required, CONCAT(a.first_name,' ', a.last_name) AS physician_name, p.prescription_id, m.medication_id, m.dosage, m.frequency, m.duration, m.instructions, med.medication_name, med.dosage_form, med.storage_instructions, med.common_side_effects, med.description FROM Healthrecord h INNER JOIN Account a ON a.account_id=h.physician_id LEFT JOIN Prescription p ON p.record_id=h.record_id LEFT JOIN Medicine m ON m.prescription_id=p.prescription_id LEFT JOIN Medications med ON med.medication_id=m.medication_id WHERE h.physician_id=%s AND h.record_id=%s",
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

# -------------------
# Physician Create Health Record API
# -------------------
@physician_bp.route('/healthRecord/create', methods=['POST'])
def create_health_record():
    data = request.json
    patient_id = data.get("patient_id")
    visit_date = data.get("visit_date")
    diagnosis = data.get("diagnosis")
    symptoms = data.get("symptoms")
    lab_results = data.get("lab_results")
    follow_up_required = data.get("follow_up_required")
    prescriptions = data.get("prescriptions", [])
    print("hI")

    if not all([patient_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required]):
        return jsonify({"error": "All health record fields are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:

        cursor.execute(
            "SELECT 1 FROM Appointment WHERE patient_id=%s AND physician_id=%s LIMIT 1",
            (patient_id, user_physician["physician"]["account_id"])
        )
        if not cursor.fetchone():
            return jsonify({"error": "You are not authorized to create a record for this patient"}), 403
        
        cursor.execute(
            "INSERT INTO Healthrecord (patient_id, physician_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (patient_id, user_physician["physician"]["account_id"], visit_date, diagnosis, symptoms, lab_results, follow_up_required)
        )
        record_id = cursor.lastrowid

        for pres in prescriptions:
            med_name = pres.get("medication_name")
            dosage = pres.get("dosage")
            frequency = pres.get("frequency")
            duration = pres.get("duration")
            instructions = pres.get("instructions")

            if not all([med_name, dosage, frequency, duration, instructions]):
                conn.rollback()
                return jsonify({"error": "All prescription fields are required"}), 400

            cursor.execute("SELECT medication_id FROM Medications WHERE medication_name=%s", (med_name,))
            med_row = cursor.fetchone()
            if med_row:
                medication_id = med_row["medication_id"]
            else:
                cursor.execute(
                    "INSERT INTO Medications (medication_name, dosage_form, storage_instructions, common_side_effects, description) "
                    "VALUES (%s, 'N/A', 'N/A', 'N/A', 'N/A')",
                    (med_name,)
                )
                medication_id = cursor.lastrowid

            cursor.execute(
                "INSERT INTO Prescription (record_id) VALUES (%s)",
                (record_id,)
            )
            prescription_id = cursor.lastrowid

            cursor.execute(
                "INSERT INTO Medicine (prescription_id, medication_id, dosage, frequency, duration, instructions) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (prescription_id, medication_id, dosage, frequency, duration, instructions)
            )

        conn.commit()
        return jsonify({"success": True, "message": "Health record created successfully", "record_id": record_id})

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()



