-- Set up database users and their privileges for the Mediflow application

-- Developer User (Full Access)
CREATE USER 'mediflow_dev'@'localhost' IDENTIFIED BY 'dev_password_2024';
GRANT ALL PRIVILEGES ON mediflow_db.* TO 'mediflow_dev'@'localhost';
GRANT CREATE USER ON *.* TO 'mediflow_dev'@'localhost';
GRANT RELOAD ON *.* TO 'mediflow_dev'@'localhost';

-- Application User (Restricted Access)
CREATE USER 'mediflow_user'@'localhost' IDENTIFIED BY 'mediflow_pass';

-- Grant SELECT on all tables
GRANT SELECT ON mediflow_db.Account TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Patient TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Physician TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Appointment TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.HealthRecord TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Prescription TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Medicine TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Medications TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Insurance TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Pharmacy TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Specialization TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.ActivityLog TO 'mediflow_user'@'localhost';
GRANT SELECT ON mediflow_db.Activity_Log_Audit TO 'mediflow_user'@'localhost';

-- Grant INSERT privileges
GRANT INSERT ON mediflow_db.Account TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Patient TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Physician TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Appointment TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.HealthRecord TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Prescription TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Medicine TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.ActivityLog TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Prescription_Audit TO 'mediflow_user'@'localhost';
GRANT INSERT ON mediflow_db.Activity_Log_Audit TO 'mediflow_user'@'localhost';

-- Grant UPDATE privileges
GRANT UPDATE ON mediflow_db.Account TO 'mediflow_user'@'localhost';
GRANT UPDATE ON mediflow_db.Patient TO 'mediflow_user'@'localhost';
GRANT UPDATE ON mediflow_db.Appointment TO 'mediflow_user'@'localhost';
GRANT UPDATE ON mediflow_db.ActivityLog TO 'mediflow_user'@'localhost';

-- Grant DELETE privileges (limited)
GRANT DELETE ON mediflow_db.ActivityLog TO 'mediflow_user'@'localhost';


-- Apply changes
FLUSH PRIVILEGES;

-- Select the database for subsequent operations
USE mediflow_db;