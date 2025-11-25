-- ================================================================
-- MediFlow Healthcare Management System SQL Schema
-- ================================================================

-- ==============================
-- Insurance Table
-- ==============================
CREATE TABLE IF NOT EXISTS Insurance (
    insurance_id INT PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) UNIQUE NOT NULL
);

-- ==============================
-- Pharmacy Table
-- ==============================
CREATE TABLE IF NOT EXISTS Pharmacy (
    pharmacy_id INT PRIMARY KEY,
    pharmacy_name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    phone VARCHAR(20)
);

-- ==============================
-- Specialization Table
-- ==============================
CREATE TABLE IF NOT EXISTS Specialization (
    specialization_id INT PRIMARY KEY,
    specialization_name VARCHAR(100) NOT NULL
);

-- ==============================
-- Account Table
-- ==============================
CREATE TABLE IF NOT EXISTS Account (
    account_id INT AUTO_INCREMENT,
    user_name VARCHAR(50),
    password VARCHAR(100),
    role ENUM('patient', 'physician', 'admin'),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    CONSTRAINT account_pk PRIMARY KEY (account_id),
    CONSTRAINT email_unique UNIQUE (email)
);

-- ==============================
-- Physician Table
-- ==============================
CREATE TABLE IF NOT EXISTS Physician (
    account_id INT,
    specialization_id INT,
    license_number VARCHAR(50),
    CONSTRAINT physician_pk PRIMARY KEY (account_id),
    CONSTRAINT physician_account_id_fk FOREIGN KEY (account_id) REFERENCES Account(account_id) ON DELETE CASCADE,
    CONSTRAINT physician_specialization_fk FOREIGN KEY (specialization_id) REFERENCES Specialization(specialization_id)
);

-- ==============================
-- Patient Table
-- ==============================
CREATE TABLE IF NOT EXISTS Patient (
    account_id INT,
    date_of_birth DATE,
    gender ENUM('M', 'F', 'O'),
    address VARCHAR(100),
    insurance_id INT,
    pharmacy_id INT,
    emergency_contact VARCHAR(100),
    CONSTRAINT patient_pk PRIMARY KEY (account_id),
    CONSTRAINT patient_account_id_fk FOREIGN KEY (account_id) REFERENCES Account(account_id) ON DELETE CASCADE,
    CONSTRAINT patient_insurance_fk FOREIGN KEY (insurance_id) REFERENCES Insurance(insurance_id),
    CONSTRAINT patient_pharmacy_fk FOREIGN KEY (pharmacy_id) REFERENCES Pharmacy(pharmacy_id)
);

-- ==============================
-- Appointment Table
-- ==============================
CREATE TABLE IF NOT EXISTS Appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    physician_id INT NOT NULL,
    date DATETIME NOT NULL,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    reason VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES Patient(account_id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES Physician(account_id) ON DELETE CASCADE
);

-- ==============================
-- HealthRecord Table
-- ==============================
CREATE TABLE IF NOT EXISTS HealthRecord (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    physician_id INT NOT NULL,
    visit_date DATE NOT NULL,
    diagnosis VARCHAR(255),
    symptoms TEXT,
    lab_results TEXT,
    follow_up_required ENUM('Yes', 'No') DEFAULT 'No',
    FOREIGN KEY (patient_id) REFERENCES Patient(account_id) ON DELETE CASCADE,
    FOREIGN KEY (physician_id) REFERENCES Physician(account_id) ON DELETE CASCADE
);

-- ==============================
-- Prescription Table
-- ==============================
CREATE TABLE IF NOT EXISTS Prescription (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,
    FOREIGN KEY (record_id) REFERENCES HealthRecord(record_id) ON DELETE CASCADE
);

-- ==============================
-- Prescription Audit Table
-- ==============================
CREATE TABLE IF NOT EXISTS Prescription_Audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT,
    record_id INT,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Medications Table
-- ==============================
CREATE TABLE IF NOT EXISTS Medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    medication_name VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50),
    storage_instructions VARCHAR(255),
    common_side_effects VARCHAR(255),
    description TEXT,
    CONSTRAINT chk_medication_name CHECK (LENGTH(medication_name) > 0)
);

-- ==============================
-- Medicine Table
-- ==============================
CREATE TABLE IF NOT EXISTS Medicine (
    Medication_id INT,
    Prescription_id INT,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    instructions VARCHAR(255),
    PRIMARY KEY (Medication_id, Prescription_id),
    FOREIGN KEY (Medication_id) REFERENCES Medications(medication_id) ON DELETE CASCADE,
    FOREIGN KEY (Prescription_id) REFERENCES Prescription(prescription_id) ON DELETE CASCADE
);

-- ==============================
-- ActivityLog Table
-- ==============================
CREATE TABLE IF NOT EXISTS ActivityLog (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    log_date DATE NOT NULL,
    weight DECIMAL(5,2),
    bp VARCHAR(20),
    calories INT,
    duration_of_physical_activity INT,
    FOREIGN KEY (patient_id) REFERENCES Patient(account_id) ON DELETE CASCADE
);