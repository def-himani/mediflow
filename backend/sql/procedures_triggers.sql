-- ================================================================
-- MediFlow Stored Procedures and Triggers
-- ================================================================

DELIMITER $$

-- ==============================
-- Triggers
-- ==============================

DROP TRIGGER IF EXISTS prevent_double_booking$$
CREATE TRIGGER prevent_double_booking
BEFORE INSERT ON Appointment FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM Appointment
        WHERE physician_id = NEW.physician_id AND date = NEW.date AND status <> 'Cancelled'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Physician already has an appointment at this date!';
    END IF;
END $$

DROP TRIGGER IF EXISTS auto_followup_appointment$$
CREATE TRIGGER auto_followup_appointment
AFTER INSERT ON HealthRecord FOR EACH ROW
BEGIN
    IF NEW.follow_up_required = 'Yes' THEN
        INSERT INTO Appointment (patient_id, physician_id, date, status, reason)
        VALUES (NEW.patient_id, NEW.physician_id, DATE_ADD(NEW.visit_date, INTERVAL 30 DAY), 'Pending', 'Follow-up from health record');
    END IF;
END $$

DROP TRIGGER IF EXISTS before_prescription_delete$$
CREATE TRIGGER before_prescription_delete
BEFORE DELETE ON Prescription
FOR EACH ROW
BEGIN
    INSERT INTO Prescription_Audit (prescription_id, record_id)
    VALUES (OLD.prescription_id, OLD.record_id);
END $$

DROP TRIGGER IF EXISTS before_medicine_insert$$
CREATE TRIGGER before_medicine_insert
BEFORE INSERT ON Medicine
FOR EACH ROW
BEGIN
    IF NEW.dosage IS NULL OR NEW.dosage = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Dosage cannot be empty!';
    END IF;
    IF NEW.duration IS NULL OR NEW.duration = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duration cannot be empty!';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_validate_activity_data$$
CREATE TRIGGER trg_validate_activity_data
BEFORE INSERT ON ActivityLog
FOR EACH ROW
BEGIN
    IF NEW.weight <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Weight must be positive.';
    END IF;
    IF NEW.bp NOT LIKE '%/%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Blood pressure must be in format 120/80.';
    END IF;
END $$

-- ==============================
-- Stored Procedures
-- ==============================

DROP PROCEDURE IF EXISTS register_account$$
CREATE PROCEDURE register_account (
    IN un VARCHAR(50), IN pw VARCHAR(100), IN r ENUM('patient', 'physician', 'admin'),
    IN f_name VARCHAR(50), IN l_name VARCHAR(50), IN em VARCHAR(100), IN ph VARCHAR(20))
BEGIN
    DECLARE existing_email_count INT;
    SELECT COUNT(*) INTO existing_email_count FROM Account WHERE email = em;
    IF existing_email_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email address already registered.';
    ELSE
        INSERT INTO Account (user_name, password, role, first_name, last_name, email, phone)
        VALUES (un, SHA2(pw, 256), r, f_name, l_name, em, ph);
    END IF;
END $$

DROP PROCEDURE IF EXISTS cancel_future_appointments$$
CREATE PROCEDURE cancel_future_appointments(IN patient INT)
BEGIN
    UPDATE Appointment SET status = 'Cancelled'
    WHERE patient_id = patient AND status = 'Pending' AND date > CURRENT_DATE();
END $$

DROP PROCEDURE IF EXISTS get_patient_health_summary$$
CREATE PROCEDURE get_patient_health_summary(IN p_id INT)
BEGIN
    SELECT record_id, visit_date, diagnosis, follow_up_required
    FROM HealthRecord
    WHERE patient_id = p_id
    ORDER BY visit_date DESC;
END $$

DROP PROCEDURE IF EXISTS add_insurance_provider$$
CREATE PROCEDURE add_insurance_provider(
    IN p_id INT, IN p_name VARCHAR(100), IN p_policy VARCHAR(50)
)
BEGIN
    DECLARE policy_exists INT;
    SELECT COUNT(*) INTO policy_exists FROM Insurance WHERE policy_number = p_policy;
    IF policy_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Policy number already exists!';
    ELSE
        INSERT INTO Insurance VALUES (p_id, p_name, p_policy);
    END IF;
END $$

DROP PROCEDURE IF EXISTS search_pharmacy$$
CREATE PROCEDURE search_pharmacy(IN p_keyword VARCHAR(50))
BEGIN
    SELECT pharmacy_name, location, phone FROM Pharmacy WHERE location LIKE CONCAT('%', p_keyword, '%');
END $$

DROP PROCEDURE IF EXISTS add_specialization$$
CREATE PROCEDURE add_specialization(
    IN p_id INT, IN p_name VARCHAR(100)
)
BEGIN
    DECLARE name_exists INT;
    SELECT COUNT(*) INTO name_exists FROM Specialization WHERE LOWER(specialization_name) = LOWER(p_name);
    IF name_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Specialization already exists!';
    ELSE
        INSERT INTO Specialization VALUES (p_id, p_name);
    END IF;
END $$

DROP PROCEDURE IF EXISTS add_prescription$$
CREATE PROCEDURE add_prescription(IN presc_id INT, IN rec_id INT)
BEGIN
    DECLARE recordExists INT;
    SELECT COUNT(*) INTO recordExists FROM HealthRecord WHERE record_id = rec_id;
    IF recordExists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'HealthRecord ID does not exist!';
    ELSE
        INSERT INTO Prescription (prescription_id, record_id) VALUES (presc_id, rec_id);
    END IF;
END $$

-- ==============================
-- Functions
-- ==============================

DROP FUNCTION IF EXISTS get_medicine_count$$
CREATE FUNCTION get_medicine_count(prescriptionId INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM Medicine WHERE Prescription_id = prescriptionId;
    RETURN total;
END $$

DROP FUNCTION IF EXISTS get_medication_description$$
CREATE FUNCTION get_medication_description(med_name VARCHAR(100))
RETURNS TEXT
DETERMINISTIC
BEGIN
    DECLARE desc_text TEXT;
    SELECT description INTO desc_text FROM Medications WHERE medication_name = med_name LIMIT 1;
    RETURN desc_text;
END $$

DELIMITER ;