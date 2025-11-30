import pymysql
from flask import Blueprint, request, jsonify, g
from utils.db_utils import get_db_connection
from utils.auth_utils import hash_password, generate_token, login_required

physician_bp = Blueprint("physician_bp", __name__)

# -------------------
# Signup API
# -------------------
@physician_bp.route("/signup", methods=["POST"])
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
@physician_bp.route("/login", methods=["POST"])
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
@physician_bp.route("/healthRecord/record/<record_id>", methods=["GET"])
@login_required(role="physician")
def healthRecord(record_id):
    print("record_id=",record_id)
    if not record_id:
        return jsonify({"error": "record_id is required"}), 400
   
    physician_account_id = g.current_user["account_id"]
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
            WHERE h.physician_id = %s AND h.record_id = %s
            """,
            (physician_account_id, record_id),
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
# Physician Create Health Record API
# -------------------
@physician_bp.route("/healthRecord/create", methods=["POST"])
@login_required(role="physician")
def create_health_record():
    data = request.json
    patient_id = data.get("patient_id")
    visit_date = data.get("visit_date")
    diagnosis = data.get("diagnosis")
    symptoms = data.get("symptoms")
    lab_results = data.get("lab_results")
    follow_up_required = data.get("follow_up_required")
    prescriptions = data.get("prescriptions", [])

    if not all([patient_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required]):
        return jsonify({"error": "All health record fields are required"}), 400

    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.execute(
            "SELECT 1 FROM Appointment WHERE patient_id=%s AND physician_id=%s LIMIT 1",
            (patient_id, physician_account_id)
        )
        if not cursor.fetchone():
            return jsonify({"error": "You are not authorized to create a record for this patient"}), 403

        cursor.execute(
            """
            INSERT INTO HealthRecord 
            (patient_id, physician_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (patient_id, physician_account_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required)
        )
        record_id = cursor.lastrowid

        cursor.execute(
            "INSERT INTO Prescription (record_id) VALUES (%s)",
            (record_id,)
        )
        prescription_id = cursor.lastrowid

        for pres in prescriptions:
            medication_id = pres.get("medication_id")
            dosage = pres.get("dosage")
            frequency = pres.get("frequency")
            duration = pres.get("duration")
            instructions = pres.get("instructions")

            if not all([medication_id, dosage, frequency, duration, instructions]):
                conn.rollback()
                return jsonify({"error": "All prescription fields are required"}), 400

            cursor.execute(
                "SELECT 1 FROM Medications WHERE medication_id=%s",
                (medication_id,)
            )
            if not cursor.fetchone():
                conn.rollback()
                return jsonify({"error": "Invalid medication_id"}), 400

            cursor.execute(
                """
                INSERT INTO Medicine 
                (prescription_id, medication_id, dosage, frequency, duration, instructions)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (prescription_id, medication_id, dosage, frequency, duration, instructions)
            )

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Health record created successfully",
            "record_id": record_id
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

# -------------------
# Get list of medications(for physician)
# -------------------
@physician_bp.route("/medications", methods=["GET"])
@login_required(role="physician")
def get_medications():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT medication_id, medication_name FROM Medications ORDER BY medication_name")
    meds = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(meds)


# -------------------
# Physician Appointments (for physician dashboard)
# -------------------
@physician_bp.route("/appointments", methods=["GET"])
@login_required(role="physician")
def appointments():
    """Return appointments assigned to the hard-coded physician user (demo)."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute(
            """
            SELECT 
                a.appointment_id,
                a.patient_id,
                a.date,
                a.status,
                a.reason,
                a.notes,
                CONCAT(pf.first_name, ' ', pf.last_name) AS patient_name,
                CONCAT(ac.first_name, ' ', ac.last_name) AS physician_name,
                YEAR(CURDATE()) - YEAR(pa.date_of_birth) AS age
            FROM Appointment a
            INNER JOIN Account ac ON a.physician_id = ac.account_id
            LEFT JOIN Account pf ON a.patient_id = pf.account_id
            LEFT JOIN Patient pa ON a.patient_id = pa.account_id
            WHERE a.physician_id = %s
            ORDER BY a.date DESC
        """,
            (physician_account_id,),
        )
        appointments = cursor.fetchall()
        return jsonify({"success": True, "appointments": appointments}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Update appointment status (physician)
# -------------------
@physician_bp.route("/appointment/<int:appointment_id>/status", methods=["PUT"])
@login_required(role="physician")
def update_appointment_status(appointment_id):
    data = request.json or {}
    new_status = data.get('status')
    if not new_status or new_status not in ('Pending', 'Completed', 'Cancelled'):
        return jsonify({'success': False, 'message': 'Invalid or missing status'}), 400

    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Ensure the physician owns the appointment (demo uses hard-coded physician id)
        cursor.execute("SELECT physician_id FROM Appointment WHERE appointment_id=%s", (appointment_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'success': False, 'message': 'Appointment not found'}), 404
        physician_id = row[0] if isinstance(row, tuple) else row.get('physician_id')
        if int(physician_id) != int(physician_account_id):
            return jsonify({'success': False, 'message': 'Not authorized to modify this appointment'}), 403

        cursor.execute("UPDATE Appointment SET status=%s WHERE appointment_id=%s", (new_status, appointment_id))
        conn.commit()
        return jsonify({'success': True, 'message': 'Status updated'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Physician Patients (distinct patients the physician has appointments with)
# -------------------
@physician_bp.route("/patients", methods=["GET"])
@login_required(role="physician")
def get_patients():
    """Return distinct patients (with their most recent appointment info) for the physician."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Get distinct patients from appointments for this physician, with most recent appointment details
        cursor.execute(
            """
            SELECT DISTINCT
                a.patient_id,
                CONCAT(pf.first_name, ' ', pf.last_name) AS patient_name,
                YEAR(CURDATE()) - YEAR(pa.date_of_birth) AS age,
                (SELECT MAX(ap.date) FROM Appointment ap WHERE ap.patient_id = a.patient_id AND ap.physician_id = %s) AS recent_date,
                CONCAT(ac.first_name, ' ', ac.last_name) AS physician_name
            FROM Appointment a
            INNER JOIN Account pf ON a.patient_id = pf.account_id
            LEFT JOIN Patient pa ON a.patient_id = pa.account_id
            INNER JOIN Account ac ON a.physician_id = ac.account_id
            WHERE a.physician_id = %s
            ORDER BY recent_date DESC
        """,
            (physician_account_id, physician_account_id),
        )
        patients = cursor.fetchall()
        return jsonify({"success": True, "patients": patients}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Physician Patient Visits (health records for a specific patient)
# -------------------
@physician_bp.route("/patient/<int:patient_id>/visits", methods=["GET"])
@login_required(role="physician")
def get_patient_visits(patient_id):
    """Return health records (visits) for a specific patient, physician-specific."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Fetch all health records for the patient where this physician was the provider
        cursor.execute(
            """
            SELECT 
                h.record_id,
                h.visit_date,
                h.diagnosis,
                h.symptoms,
                h.lab_results,
                h.follow_up_required,
                CONCAT(ac.first_name, ' ', ac.last_name) AS physician_name
            FROM HealthRecord h
            INNER JOIN Account ac ON h.physician_id = ac.account_id
            WHERE h.patient_id = %s AND h.physician_id = %s
            ORDER BY h.visit_date DESC
        """,
            (patient_id, physician_account_id),
        )
        visits = cursor.fetchall()
        return jsonify({"success": True, "visits": visits}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Physician Dashboard Summary (activity logs and prescriptions)
# -------------------
@physician_bp.route("/dashboard-summary", methods=["GET"])
@login_required(role="physician")
def dashboard_summary():
    """Return dashboard summary: recent activity logs and prescriptions."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Get most recent activity logs from the physician's patients
        cursor.execute(
            """
            SELECT a.log_id, a.patient_id, a.log_date, a.weight, a.bp, a.calories, a.duration_of_physical_activity
            FROM ActivityLog a
            INNER JOIN Appointment ap ON a.patient_id = ap.patient_id
            WHERE ap.physician_id = %s
            ORDER BY a.log_date DESC
            LIMIT 1
        """,
            (physician_account_id,),
        )
        activity_log = cursor.fetchone()

        # Get recent prescriptions from the physician's patients
        # Join Medicine -> Prescription -> HealthRecord -> Medications
        cursor.execute(
            """
            SELECT m.dosage, m.frequency, med.medication_name
            FROM Medicine m
            INNER JOIN Prescription p ON m.Prescription_id = p.prescription_id
            INNER JOIN HealthRecord h ON p.record_id = h.record_id
            INNER JOIN Medications med ON m.Medication_id = med.medication_id
            WHERE h.physician_id = %s
            ORDER BY h.visit_date DESC
            LIMIT 2
        """,
            (physician_account_id,),
        )
        prescriptions = cursor.fetchall()

        # Get next upcoming appointment for the physician (exclude Completed/Cancelled)
        cursor.execute("""
            SELECT
                a.appointment_id,
                a.patient_id,
                a.date,
                a.status,
                a.reason,
                a.notes,
                CONCAT(pf.first_name, ' ', pf.last_name) AS patient_name
            FROM Appointment a
            LEFT JOIN Account pf ON a.patient_id = pf.account_id
            WHERE a.physician_id = %s
              AND a.status = 'Pending'
              AND a.date >= NOW()
            ORDER BY a.date ASC
            LIMIT 1
        """, (physician_account_id,))
        next_appointment = cursor.fetchone()

        return jsonify({
            "success": True,
            "activity_log": activity_log,
            "prescriptions": prescriptions,
            "next_appointment": next_appointment
        }), 200
    except Exception as e:
        print(f"Error in dashboard_summary: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Physician Profile
# -------------------
@physician_bp.route("/profile", methods=["GET"])
@login_required(role="physician")
def get_profile():
    """Return physician profile information."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute(
            """
            SELECT a.account_id, a.first_name, a.last_name, a.email, a.phone,
                   p.specialization_id, p.license_number
            FROM Account a
            LEFT JOIN Physician p ON a.account_id = p.account_id
            WHERE a.account_id = %s AND a.role = 'physician'
        """,
            (physician_account_id,),
        )
        profile = cursor.fetchone()
        
        if not profile:
            return jsonify({"success": False, "message": "Physician not found"}), 404
        
        return jsonify({"success": True, "profile": profile}), 200
    except Exception as e:
        print(f"Error in get_profile: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Physician Patient Activity Logs
# -------------------
@physician_bp.route("/patient/<int:patient_id>/activitylogs", methods=["GET"])
@login_required(role="physician")
def get_patient_activity_logs(patient_id):
    """Get all activity logs for a specific patient (for physician view)."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Verify physician has access to this patient
        cursor.execute(
            """
            SELECT patient_id FROM Appointment
            WHERE patient_id = %s AND physician_id = %s
            LIMIT 1
        """,
            (patient_id, physician_account_id),
        )
        
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Access denied"}), 403
        
        # Get activity logs
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
            (patient_id,),
        )
        
        logs = cursor.fetchall()
        return jsonify({"success": True, "logs": logs}), 200
    except Exception as e:
        print(f"Error in get_patient_activity_logs: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# -------------------
# Physician View Single Patient Activity Log
# -------------------
@physician_bp.route("/patient/<int:patient_id>/activity/<int:log_id>", methods=["GET"])
@login_required(role="physician")
def get_patient_activity_log(patient_id, log_id):
    """Get a specific activity log for a patient (for physician view)."""
    physician_account_id = g.current_user["account_id"]
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Verify physician has access to this patient
        cursor.execute(
            """
            SELECT patient_id FROM Appointment
            WHERE patient_id = %s AND physician_id = %s
            LIMIT 1
        """,
            (patient_id, physician_account_id),
        )
        
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Access denied"}), 403
        
        # Get activity log
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
            (log_id, patient_id),
        )
        
        log = cursor.fetchone()
        if not log:
            return jsonify({"success": False, "message": "Activity log not found"}), 404
        
        return jsonify({"success": True, "log": log}), 200
    except Exception as e:
        print(f"Error in get_patient_activity_log: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

