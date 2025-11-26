import pymysql
from flask import Blueprint, request, jsonify, g
from utils.db_utils import get_db_connection
from utils.auth_utils import hash_password, generate_token, login_required

patient_bp = Blueprint("patient_bp", __name__)

# -------------------
# Signup API
# -------------------
@patient_bp.route("/signup", methods=["POST"])
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
@patient_bp.route("/login", methods=["POST"])
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
@patient_bp.route("/insurances", methods=["GET"])
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
@patient_bp.route("/pharmacies", methods=["GET"])
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
@patient_bp.route("/healthRecord", methods=["POST"])
@login_required(role="patient")
def healthRecords():
    """Return all health records for the logged-in patient."""
    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())

    try:
        cursor.execute(
            """
            SELECT h.record_id, h.visit_date, h.diagnosis, h.symptoms, h.lab_results,
                   h.follow_up_required, CONCAT(a.first_name,' ', a.last_name) AS physician_name
            FROM HealthRecord h
            INNER JOIN Account a ON a.account_id = h.physician_id
            WHERE h.patient_id = %s
            """,
            (patient_account_id,),
        )
        
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
@patient_bp.route("/healthRecord/record/<record_id>", methods=["GET"])
@login_required(role="patient")
def healthRecord(record_id):
    print("record_id=",record_id)
    # data = request.json
    # print(request.data)
    # record_id = data.get('record_id')
    if not record_id:
        return jsonify({"error": "record_id is required"}), 400
   
    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())
    try:
        cursor.execute(
            """
            SELECT h.record_id, h.patient_id, h.visit_date, h.diagnosis, h.symptoms,
                   h.lab_results, h.follow_up_required,
                   CONCAT(a.first_name,' ', a.last_name) AS physician_name,
                   p.prescription_id, m.medication_id, m.dosage, m.frequency,
                   m.duration, m.instructions,
                   med.medication_name, med.dosage_form, med.storage_instructions,
                   med.common_side_effects, med.description
            FROM Healthrecord h
            INNER JOIN Account a ON a.account_id = h.physician_id
            LEFT JOIN Prescription p ON p.record_id = h.record_id
            LEFT JOIN Medicine m ON m.prescription_id = p.prescription_id
            LEFT JOIN Medications med ON med.medication_id = m.medication_id
            WHERE h.patient_id = %s AND h.record_id = %s
            """,
            (patient_account_id, record_id),
        )
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
@patient_bp.route("/dashboard", methods=["POST"])
@login_required(role="patient")
def dashboard():
    print("Fetching dashboard data")

    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())

    try:
        cursor.execute(
            """
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
        """,
            (patient_account_id,),
        )
        
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


# -------------------
# Activity Log API
# -------------------
@patient_bp.route("/activitylogs", methods=["GET"])
@login_required(role="patient")
def get_activity_logs():
    """Get all activity logs for the current patient."""
    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute(
            """
            SELECT 
                log_id,
                log_date,
                weight,
                bp,
                calories,
                duration_of_physical_activity
            FROM ActivityLog
            WHERE patient_id = %s
            ORDER BY log_date DESC
        """,
            (patient_account_id,),
        )
        
        logs = cursor.fetchall()
        return jsonify({"success": True, "logs": logs}), 200
    except Exception as e:
        print(f"Error in get_activity_logs: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Get Specific Activity Log
# -------------------
@patient_bp.route("/activitylog/<int:log_id>", methods=["GET"])
@login_required(role="patient")
def get_activity_log(log_id):
    """Get a specific activity log by log_id."""
    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute(
            """
            SELECT 
                log_id,
                log_date,
                weight,
                bp,
                calories,
                duration_of_physical_activity
            FROM ActivityLog
            WHERE log_id = %s AND patient_id = %s
        """,
            (log_id, patient_account_id),
        )
        
        log = cursor.fetchone()
        if not log:
            return jsonify({"success": False, "message": "Activity log not found"}), 404
        
        return jsonify({"success": True, "log": log}), 200
    except Exception as e:
        print(f"Error in get_activity_log: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Create New Activity Log
# -------------------
@patient_bp.route("/activitylog/new", methods=["POST"])
@login_required(role="patient")
def create_activity_log():
    """Create a new activity log."""
    data = request.json
    
    # Validate required fields
    required_fields = ['date', 'weight', 'bp_systolic', 'bp_diastolic', 'calories', 'duration']
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400
    
    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Format BP as "systolic/diastolic"
        bp = f"{data['bp_systolic']}/{data['bp_diastolic']}"
        
        cursor.execute(
            """
            INSERT INTO ActivityLog (patient_id, log_date, weight, bp, calories, duration_of_physical_activity)
            VALUES (%s, %s, %s, %s, %s, %s)
        """,
            (
                patient_account_id,
                data["date"],
                data["weight"],
                bp,
                data["calories"],
                data["duration"],
            ),
        )
        
        conn.commit()
        return jsonify({"success": True, "message": "Activity log created successfully"}), 201
    except Exception as e:
        conn.rollback()
        print(f"Error in create_activity_log: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Update Activity Log
# -------------------
@patient_bp.route("/activitylog/<int:log_id>/edit", methods=["PUT"])
@login_required(role="patient")
def update_activity_log(log_id):
    """Update an existing activity log."""
    data = request.json
    
    patient_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Verify ownership
        cursor.execute(
            "SELECT log_id FROM ActivityLog WHERE log_id = %s AND patient_id = %s",
            (log_id, patient_account_id),
        )
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Activity log not found"}), 404
        
        # Format BP if provided
        bp = None
        if 'bp_systolic' in data and 'bp_diastolic' in data:
            bp = f"{data['bp_systolic']}/{data['bp_diastolic']}"
        
        # Build update query dynamically
        update_fields = []
        params = []
        
        if 'weight' in data:
            update_fields.append("weight = %s")
            params.append(data['weight'])
        if bp:
            update_fields.append("bp = %s")
            params.append(bp)
        if 'calories' in data:
            update_fields.append("calories = %s")
            params.append(data['calories'])
        if 'duration' in data:
            update_fields.append("duration_of_physical_activity = %s")
            params.append(data['duration'])

        
        if not update_fields:
            return jsonify({"success": False, "message": "No fields to update"}), 400
        
        params.append(log_id)
        query = f"UPDATE ActivityLog SET {', '.join(update_fields)} WHERE log_id = %s"
        
        cursor.execute(query, params)
        conn.commit()
        
        return jsonify({"success": True, "message": "Activity log updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        print(f"Error in update_activity_log: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()