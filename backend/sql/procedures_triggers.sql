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

DROP TRIGGER IF EXISTS before_activity_log_delete$$
CREATE TRIGGER before_activity_log_delete
BEFORE DELETE ON ActivityLog
FOR EACH ROW
BEGIN
    INSERT INTO Activity_Log_Audit (log_id)
    VALUES (OLD.log_id);
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
        VALUES (un, pw, r, f_name, l_name, em, ph);
    END IF;
END $$