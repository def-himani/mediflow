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
# Get all insurances to be displayed on the signup page and profile update page
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

# -------------------
# Patient Profile API
# -------------------
@patient_bp.route('/profile', methods=['GET'])
def profile():
    print("Fetching profile data")
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT DATABASE();")
    print(cursor.fetchone())
    try:
        cursor.execute("""
            SELECT 
                a.account_id,
                a.first_name,
                a.last_name,
                a.email,
                a.phone,
                a.user_name,
                p.date_of_birth,
                p.gender,
                p.address,
                p.emergency_contact,
                i.insurance_id,
                i.provider_name,
                i.policy_number,
                ph.pharmacy_id,
                ph.pharmacy_name,
                ph.location AS pharmacy_location,
                ph.phone AS pharmacy_phone
            FROM Account a
            INNER JOIN Patient p ON a.account_id = p.account_id
            LEFT JOIN Insurance i ON p.insurance_id = i.insurance_id
            LEFT JOIN Pharmacy ph ON p.pharmacy_id = ph.pharmacy_id
            WHERE a.account_id = %s
        """, (user_patient["patient"]["account_id"],))
        
        profile_data = cursor.fetchone()
        
        if not profile_data:
            return jsonify({"error": "Profile not found"}), 404
        
        return jsonify({
            "success": True, 
            "message": "Profile data obtained successfully", 
            "profile": profile_data
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -------------------
# Update Patient Profile API
# -------------------
@patient_bp.route('/profile/update', methods=['PUT'])
def update_profile():
    print("Updating profile data")
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        # Update Account table
        cursor.execute("""
            UPDATE Account 
            SET first_name = %s,
                last_name = %s,
                email = %s,
                phone = %s
            WHERE account_id = %s
        """, (
            data.get('first_name'),
            data.get('last_name'),
            data.get('email'),
            data.get('phone'),
            user_patient["patient"]["account_id"]
        ))
        
        # Update Patient table
        cursor.execute("""
            UPDATE Patient 
            SET address = %s,
                emergency_contact = %s,
                insurance_id = %s,
                pharmacy_id = %s
            WHERE account_id = %s
        """, (
            data.get('address'),
            data.get('emergency_contact'),
            data.get('insurance_id'),
            data.get('pharmacy_id'),
            user_patient["patient"]["account_id"]
        ))
        
        conn.commit()
        
        return jsonify({
            "success": True, 
            "message": "Profile updated successfully"
        })
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -------------------
# Activity Log API
# -------------------
@patient_bp.route('/activitylogs', methods=['GET'])
def get_activity_logs():
    """Get all activity logs for the current patient."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
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
        """, (user_patient["patient"]["account_id"],))
        
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
@patient_bp.route('/activitylog/<int:log_id>', methods=['GET'])
def get_activity_log(log_id):
    """Get a specific activity log by log_id."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
            SELECT 
                log_id,
                log_date,
                weight,
                bp,
                calories,
                duration_of_physical_activity
            FROM ActivityLog
            WHERE log_id = %s AND patient_id = %s
        """, (log_id, user_patient["patient"]["account_id"]))
        
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
@patient_bp.route('/activitylog/new', methods=['POST'])
def create_activity_log():
    """Create a new activity log."""
    data = request.json
    
    # Validate required fields
    required_fields = ['date', 'weight', 'bp_systolic', 'bp_diastolic', 'calories', 'duration']
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Format BP as "systolic/diastolic"
        bp = f"{data['bp_systolic']}/{data['bp_diastolic']}"
        
        cursor.execute("""
            INSERT INTO ActivityLog (patient_id, log_date, weight, bp, calories, duration_of_physical_activity)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            user_patient["patient"]["account_id"],
            data['date'],
            data['weight'],
            bp,
            data['calories'],
            data['duration']
        ))
        
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
@patient_bp.route('/activitylog/<int:log_id>/edit', methods=['PUT'])
def update_activity_log(log_id):
    """Update an existing activity log."""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Verify ownership
        cursor.execute(
            "SELECT log_id FROM ActivityLog WHERE log_id = %s AND patient_id = %s",
            (log_id, user_patient["patient"]["account_id"])
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

# -------------------
# Get Available Physicians API
# -------------------
@patient_bp.route('/physicians', methods=['GET'])
def get_physicians():
    print("Fetching physicians")
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                p.account_id,
                CONCAT(a.first_name, ' ', a.last_name) AS physician_name,
                s.specialization_name,
                p.license_number
            FROM Physician p
            INNER JOIN Account a ON p.account_id = a.account_id
            INNER JOIN Specialization s ON p.specialization_id = s.specialization_id
            ORDER BY a.last_name, a.first_name
        """)
        
        physicians = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "physicians": physicians
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -------------------
# Get Specializations API
# -------------------
@patient_bp.route('/specializations', methods=['GET'])
def get_specializations():
    print("Fetching specializations")
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                specialization_id,
                specialization_name
            FROM Specialization
            ORDER BY specialization_name
        """)
        
        specializations = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "specializations": specializations
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -------------------
# Book Appointment API
# -------------------
@patient_bp.route('/appointment/book', methods=['POST'])
def book_appointment():
    print("Booking appointment")
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        # Validate required fields
        required_fields = ['physician_id', 'date', 'reason']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": f"{field} is required"}), 400
        
        # Check if physician already has an appointment at this date/time
        cursor.execute("""
            SELECT appointment_id 
            FROM Appointment 
            WHERE physician_id = %s 
            AND date = %s 
            AND status != 'Cancelled'
        """, (data.get('physician_id'), data.get('date')))
        
        existing = cursor.fetchone()
        if existing:
            return jsonify({
                "success": False, 
                "message": "This physician already has an appointment at this time. Please choose a different time."
            }), 400
        
        # Insert new appointment
        cursor.execute("""
            INSERT INTO Appointment (patient_id, physician_id, date, status, reason, notes)
            VALUES (%s, %s, %s, 'Pending', %s, %s)
        """, (
            user_patient["patient"]["account_id"],
            data.get('physician_id'),
            data.get('date'),
            data.get('reason'),
            data.get('notes', '')
        ))
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Appointment booked successfully!"
        })
    except Exception as e:
        conn.rollback()
        print("Error booking appointment:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -------------------
# Get Patient Appointments API
# -------------------
@patient_bp.route('/appointments', methods=['GET'])
def get_appointments():
    print("Fetching patient appointments")
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                a.appointment_id,
                a.date,
                a.status,
                a.reason,
                a.notes,
                CONCAT(ac.first_name, ' ', ac.last_name) AS physician_name,
                s.specialization_name
            FROM Appointment a
            INNER JOIN Account ac ON a.physician_id = ac.account_id
            INNER JOIN Physician p ON a.physician_id = p.account_id
            INNER JOIN Specialization s ON p.specialization_id = s.specialization_id
            WHERE a.patient_id = %s
            ORDER BY a.date DESC
        """, (user_patient["patient"]["account_id"],))
        
        appointments = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "appointments": appointments
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -------------------
# Cancel Appointment API
# -------------------
@patient_bp.route('/appointment/<int:appointment_id>/cancel', methods=['PUT'])
def cancel_appointment(appointment_id):
    print(f"Cancelling appointment {appointment_id}")
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        # Verify appointment belongs to patient
        cursor.execute("""
            SELECT appointment_id 
            FROM Appointment 
            WHERE appointment_id = %s AND patient_id = %s
        """, (appointment_id, user_patient["patient"]["account_id"]))
        
        appointment = cursor.fetchone()
        if not appointment:
            return jsonify({
                "success": False,
                "message": "Appointment not found or access denied"
            }), 404
        
        # Update appointment status to Cancelled
        cursor.execute("""
            UPDATE Appointment 
            SET status = 'Cancelled'
            WHERE appointment_id = %s
        """, (appointment_id,))
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Appointment cancelled successfully"
        })
    except Exception as e:
        conn.rollback()
        print("Error cancelling appointment:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()