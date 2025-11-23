import pymysql
from flask import Blueprint, request, jsonify
from utils.db_utils import get_db_connection

activity_log_bp = Blueprint('activity_log_bp', __name__)

# Hardcoded user contexts (matching your existing pattern)
user_physician = {
    "physician": {
        "account_id": 4,
        "license_number": None,
        "specialization_id": None
    }
}

user_patient = {
    "patient": {
        "account_id": 6,
        "address": "12 Maple Ave, NY 1000",
        "date_of_birth": "1990-03-15",
        "emergency_contact": "Raj Rao",
        "gender": "F",
        "insurance_id": 1,
        "pharmacy_id": 1
    }
}

# ==========================================
# PHYSICIAN ROUTES - View Patient Activity Logs
# ==========================================

@activity_log_bp.route('/physician/activity-log', methods=['GET'])
def get_all_activity_logs():
    """Get all activity logs from all patients (for physician overview)"""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        query = """
            SELECT al.*, 
                   CONCAT(a.first_name, ' ', a.last_name) as patient_name
            FROM ActivityLog al
            JOIN Patient p ON al.patient_id = p.account_id
            JOIN Account a ON p.account_id = a.account_id
            ORDER BY al.log_date DESC
        """
        
        cursor.execute(query)
        logs = cursor.fetchall()
        
        return jsonify({'success': True, 'activity_logs': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@activity_log_bp.route('/physician/activity-log/<int:log_id>', methods=['GET'])
def get_activity_log_by_id(log_id):
    """Get specific activity log by ID"""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        query = """
            SELECT al.*, 
                   CONCAT(a.first_name, ' ', a.last_name) as patient_name,
                   a.email as patient_email
            FROM ActivityLog al
            JOIN Patient p ON al.patient_id = p.account_id
            JOIN Account a ON p.account_id = a.account_id
            WHERE al.log_id = %s
        """
        
        cursor.execute(query, (log_id,))
        log = cursor.fetchone()
        
        if log:
            return jsonify({'success': True, 'activity_log': log})
        else:
            return jsonify({'success': False, 'message': 'Activity log not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@activity_log_bp.route('/physician/activity-log/patient/<int:patient_id>', methods=['GET'])
def get_activity_logs_by_patient(patient_id):
    """Get all activity logs for a specific patient"""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        query = """
            SELECT al.*, 
                   CONCAT(a.first_name, ' ', a.last_name) as patient_name
            FROM ActivityLog al
            JOIN Patient p ON al.patient_id = p.account_id
            JOIN Account a ON p.account_id = a.account_id
            WHERE al.patient_id = %s
            ORDER BY al.log_date DESC
        """
        
        cursor.execute(query, (patient_id,))
        logs = cursor.fetchall()
        
        return jsonify({'success': True, 'activity_logs': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@activity_log_bp.route('/physician/activity-log/create', methods=['POST'])
def create_activity_log():
    """Create a new activity log (physician creating for patient)"""
    data = request.json
    
    required_fields = ['patient_id', 'log_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing {field}'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
            INSERT INTO ActivityLog 
            (patient_id, log_date, weight, bp, calories, duration_of_physical_activity)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            data['patient_id'],
            data['log_date'],
            data.get('weight'),
            data.get('bp'),
            data.get('calories'),
            data.get('duration_of_physical_activity')
        ))
        
        conn.commit()
        log_id = cursor.lastrowid
        
        return jsonify({'success': True, 'message': 'Activity log created', 'activity_id': log_id})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@activity_log_bp.route('/physician/activity-log/update/<int:log_id>', methods=['PUT'])
def update_activity_log(log_id):
    """Update an existing activity log"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if log exists
        cursor.execute("SELECT log_id FROM ActivityLog WHERE log_id = %s", (log_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'success': False, 'message': 'Activity log not found'}), 404
        
        query = """
            UPDATE ActivityLog 
            SET log_date = %s, 
                weight = %s, 
                bp = %s, 
                calories = %s,
                duration_of_physical_activity = %s
            WHERE log_id = %s
        """
        
        cursor.execute(query, (
            data.get('log_date'),
            data.get('weight'),
            data.get('bp'),
            data.get('calories'),
            data.get('duration_of_physical_activity'),
            log_id
        ))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Activity log updated'})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# PATIENT ROUTES
# ==========================================

@activity_log_bp.route('/patient/activity-log', methods=['GET'])
def get_patient_activity_logs():
    """Get all activity logs for logged-in patient"""
    patient_id = user_patient["patient"]["account_id"]
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        query = """
            SELECT * FROM ActivityLog
            WHERE patient_id = %s
            ORDER BY log_date DESC
        """
        
        cursor.execute(query, (patient_id,))
        logs = cursor.fetchall()
        
        return jsonify({'success': True, 'activity_logs': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@activity_log_bp.route('/patient/activity-log/<int:log_id>', methods=['GET'])
def get_patient_activity_log_detail(log_id):
    """Get specific activity log detail for patient"""
    patient_id = user_patient["patient"]["account_id"]
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        query = """
            SELECT * FROM ActivityLog
            WHERE log_id = %s AND patient_id = %s
        """
        
        cursor.execute(query, (log_id, patient_id))
        log = cursor.fetchone()
        
        if log:
            return jsonify({'success': True, 'activity_log': log})
        else:
            return jsonify({'success': False, 'message': 'Activity log not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@activity_log_bp.route('/patient/activity-log/create', methods=['POST'])
def create_patient_activity_log():
    """Create a new activity log for patient (self-logging)"""
    # Get logged-in patient's ID from session or auth token
    # For now, using hardcoded value - replace with real auth
    patient_id = user_patient["patient"]["account_id"]
    
    # ← REMOVE patient_id from request data requirements
    data = request.json
    
    required_fields = ['log_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing {field}'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
            INSERT INTO ActivityLog 
            (patient_id, log_date, weight, bp, calories, duration_of_physical_activity)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            patient_id,  # Auto-populated from session
            data['log_date'],
            data.get('weight'),
            data.get('bp'),
            data.get('calories'),
            data.get('duration_of_physical_activity')
        ))
        
        conn.commit()
        log_id = cursor.lastrowid
        
        return jsonify({'success': True, 'message': 'Activity log created', 'log_id': log_id})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()



@activity_log_bp.route('/patient/activity-log/update/<int:log_id>', methods=['PUT'])
def update_patient_activity_log(log_id):
    """Update patient's own activity log"""
    patient_id = user_patient["patient"]["account_id"]
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verify ownership
        cursor.execute("SELECT patient_id FROM ActivityLog WHERE log_id = %s", (log_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'success': False, 'message': 'Activity log not found'}), 404
        
        if result[0] != patient_id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
        query = """
            UPDATE ActivityLog 
            SET log_date = %s, 
                weight = %s, 
                bp = %s, 
                calories = %s,
                duration_of_physical_activity = %s
            WHERE log_id = %s
        """
        
        cursor.execute(query, (
            data.get('log_date'),
            data.get('weight'),
            data.get('bp'),
            data.get('calories'),
            data.get('duration_of_physical_activity'),
            log_id
        ))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Activity log updated'})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

