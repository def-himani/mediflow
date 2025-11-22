import pymysql
from flask import Blueprint, request, jsonify
from utils.db_utils import get_db_connection
from utils.auth_utils import hash_password, generate_token

patient_bp = Blueprint('patient_bp', __name__)

user_patient={
     "patient": { 
          "account_id": 6, 
          "address":  "12 Maple Ave, NY 1000", 
          "date_of_birth": "1990-03-15", 
          "emergency_contact": "Raj Rao", 
          "gender": "F", 
          "insurance_id": 1, 
          "pharmacy_id": 1
    } 
}

# -------------------
# Signup API
# -------------------
@patient_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json

    # Required fields
    required_fields = ['user_name', 'password', 'first_name', 'last_name', 'email', 'phone']
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)  # <-- Use DictCursor here
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())

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
        """, (data['user_name'], hashed_pw, 'patient', data['first_name'], data['last_name'], data['email'], data['phone']))
        account_id = cursor.lastrowid

        # Insert into Patient table (optional fields)
        cursor.execute("""
            INSERT INTO Patient (account_id, date_of_birth, gender, address, insurance_id, pharmacy_id, emergency_contact)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            account_id,
            data.get('date_of_birth'),
            data.get('gender'),
            data.get('address'),
            data.get('insurance_id'),
            data.get('pharmacy_id'),
            data.get('emergency_contact')
        ))

        conn.commit()
        token = generate_token(account_id, 'patient')
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
@patient_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)  # <-- Use DictCursor here


    try:
        hashed_pw = hash_password(data['password'])
        cursor.execute("SELECT * FROM Account WHERE user_name=%s AND password=%s AND role='patient'",
                       (data['user_name'], hashed_pw))
        account = cursor.fetchone()

        if not account:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        # Fetch patient details
        cursor.execute("SELECT * FROM Patient WHERE account_id=%s", (account['account_id'],))
        patient = cursor.fetchone()

        token = generate_token(account['account_id'], account['role'])

        return jsonify({
            "success": True,
            "token": token,
            "patient": patient
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# -------------------
# Get all insurances
# -------------------
# Get all insurances
@patient_bp.route('/insurances', methods=['GET'])
def get_insurances():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT insurance_id, provider_name FROM Insurance")
        insurances = cursor.fetchall()
        return jsonify(insurances)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Get all pharmacies
@patient_bp.route('/pharmacies', methods=['GET'])
def get_pharmacies():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT pharmacy_id, pharmacy_name FROM Pharmacy")
        pharmacies = cursor.fetchall()
        return jsonify(pharmacies)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()



# -------------------
# Patient Health Records API
# -------------------
@patient_bp.route('/healthRecord', methods=['POST'])
def healthRecords():

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())

    try:
        cursor.execute("SELECT h.record_id, h.visit_date, h.diagnosis, h.symptoms, h.lab_results, h.follow_up_required, CONCAT(a.first_name,' ', a.last_name) AS physician_name FROM HealthRecord h INNER JOIN Account a ON a.account_id=h.physician_id WHERE h.patient_id=%s",
                       (user_patient["patient"]["account_id"],))
        
        healthrecords = cursor.fetchall()
        return jsonify({"success": True, "message": "Health Records obtained successfully", "healthrecords": healthrecords})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# -------------------
# Patient Specific Health Record API
# -------------------
@patient_bp.route('/healthRecord/record/<record_id>', methods=['GET'])
def healthRecord(record_id):
    print("record_id=",record_id)
    # data = request.json
    # print(request.data)
    # record_id = data.get('record_id')
    if not record_id:
        return jsonify({"error": "record_id is required"}), 400
   
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())
    try:
        cursor.execute("SELECT h.record_id, h.patient_id, h.visit_date, h.diagnosis, h.symptoms, h.lab_results, h.follow_up_required, CONCAT(a.first_name,' ', a.last_name) AS physician_name, p.prescription_id, m.medication_id, m.dosage, m.frequency, m.duration, m.instructions, med.medication_name, med.dosage_form, med.storage_instructions, med.common_side_effects, med.description FROM Healthrecord h INNER JOIN Account a ON a.account_id=h.physician_id LEFT JOIN Prescription p ON p.record_id=h.record_id LEFT JOIN Medicine m ON m.prescription_id=p.prescription_id LEFT JOIN Medications med ON med.medication_id=m.medication_id WHERE h.patient_id=%s AND h.record_id=%s",
                       (user_patient["patient"]["account_id"],record_id))
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
# Patient Dashboard API
# -------------------
@patient_bp.route('/dashboard', methods=['POST'])
def dashboard():
    print("Fetching dashboard data")

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())

    try:
        cursor.execute("""
            SELECT 
                a.appointment_id,
                a.date,
                a.status,
                a.reason,
                a.notes,
                CONCAT(ac.first_name, ' ', ac.last_name) AS physician_name
            FROM Appointment a
            INNER JOIN Account ac ON a.physician_id = ac.account_id
            WHERE a.patient_id = %s
            ORDER BY a.date DESC
        """, (user_patient["patient"]["account_id"],))
        
        appointments = cursor.fetchall()
        print(appointments)
        return jsonify({
            "success": True, 
            "message": "Dashboard data obtained successfully", 
            "appointments": appointments
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()