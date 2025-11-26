-- ================================================================
-- MediFlow Seed Data
-- ================================================================

-- Insurance Data
INSERT IGNORE INTO Insurance (insurance_id, provider_name, policy_number) VALUES
(1, 'BlueCross', 'BCP101'),
(2, 'Aetna', 'AET202'),
(3, 'Cigna', 'CGN303'),
(4, 'UnitedHealth', 'UHC404'),
(5, 'Humana', 'HMA505'),
(6, 'Oscar', 'OSC606'),
(7, 'Empire', 'EMP707'),
(8, 'HealthFirst', 'HFR808'),
(9, 'Molina', 'MLN909'),
(10, 'WellCare', 'WLC010'),
(11, 'MetroPlus', 'MTP111'),
(12, 'FidelisCare', 'FDC212'),
(13, 'Guardian', 'GRD313'),
(14, 'Liberty Health', 'LBH414'),
(15, 'CareConnect', 'CRC515');

-- Pharmacy Data
INSERT IGNORE INTO Pharmacy (pharmacy_id, pharmacy_name, location, phone) VALUES
(1, 'GoodHealth Pharmacy', '123 Main St, NY 10001', '212-555-1001'),
(2, 'WellCare Pharmacy', '55 Broadway, NY 10004', '212-555-1002'),
(3, 'CityMeds', '89 West Ave, NY 10009', '212-555-1003'),
(4, 'CarePlus Pharmacy', '300 Lexington Ave, NY 10016', '212-555-1004'),
(5, 'QuickMeds', '12 Park St, NY 10018', '212-555-1005'),
(6, 'PrimePharma', '200 Hudson St, NY 10013', '212-555-1006'),
(7, 'MediStore', '77 East Ave, NY 10014', '212-555-1007'),
(8, 'RxExpress', '60 Wall St, NY 10005', '212-555-1008'),
(9, 'HealthMart', '500 Madison Ave, NY 10022', '212-555-1009'),
(10, 'CareChoice', '250 Broadway, NY 10007', '212-555-1010'),
(11, 'PharmaHub', '88 King St, NY 10011', '212-555-1011'),
(12, 'WellTrust Pharmacy', '142 5th Ave, NY 10010', '212-555-1012'),
(13, 'MedAccess', '29 Canal St, NY 10002', '212-555-1013'),
(14, 'RxCorner', '310 West End Ave, NY 10023', '212-555-1014'),
(15, 'CareFirst Pharmacy', '75 Pine St, NY 10005', '212-555-1015');

-- Specialization Data
INSERT IGNORE INTO Specialization (specialization_id, specialization_name) VALUES
(1, 'Cardiology'),
(2, 'Dermatology'),
(3, 'Neurology'),
(4, 'Orthopedics'),
(5, 'Pediatrics'),
(6, 'Gastroenterology'),
(7, 'Endocrinology'),
(8, 'Ophthalmology'),
(9, 'Oncology'),
(10, 'Psychiatry'),
(11, 'Radiology'),
(12, 'Nephrology'),
(13, 'Rheumatology'),
(14, 'Urology'),
(15, 'Hematology');

-- Login credentials for Accounts
    -- dr_smith: docsmith1
    -- dr_brown: drlinda2
    -- dr_wilson: drmark3
    -- dr_lee: drgrace4
    -- dr_adams: drjames5
    -- sheela: sheela01
    -- mike: mike02
    -- nina: nina03
    -- ethan: ethan04
    -- olivia: olivia05
    -- daniel: daniel06
    -- emma: emma07
    -- lucas: lucas08
    -- ava: ava09
    -- noah: noah10
    -- dr_khan: drsara6
    -- dr_miller: drkevin7
    -- dr_jones: drhannah8
    -- dr_ng: drchris9
    -- dr_patel: drmeera10
-- Account Data (passwords hashed with SHA256)
INSERT IGNORE INTO Account (account_id, user_name, password, role, first_name, last_name, email, phone) VALUES
(1, 'dr_smith', 'b14d327e06c59d1ebd7e771cc71373a9bb09f6cc987fbe6795f2b2b6a61631a4', 'physician', 'John', 'Smith', 'john.smith@mediflow.com', '+1-212-555-1010'),
(2, 'dr_brown', 'bf303d76f91bce5813cbbe1c062095ee694d1d02ba5aa716f6ed5461685c76a4', 'physician', 'Linda', 'Brown', 'linda.brown@mediflow.com', '+1-718-555-2020'),
(3, 'dr_wilson', 'd33721532a7610af75cf12169e03327ec59f2dd4766d475f2da6c849af335dc3', 'physician', 'Mark', 'Wilson', 'mark.wilson@mediflow.com', '+1-646-555-3030'),
(4, 'dr_lee', 'e18bd3995b12c06e732dbc27e18a79d52f04c0d3aeff7a6a8f2bf99fd05d96c4', 'physician', 'Grace', 'Lee', 'grace.lee@mediflow.com', '+1-917-555-4040'),
(5, 'dr_adams', '195f7679d3ccbbb4e38885c066168c44a78f08a0e67a5aa77d1d765bfcb4115a', 'physician', 'James', 'Adams', 'james.adams@mediflow.com', '+1-347-555-5050'),
(6, 'sheela', '6ef5e6bacbf820221c2bf94b16da5928a66c8ad3aadc1eabe17ed252cca156e7', 'patient', 'Sheela', 'Rao', 'sheela.rao@gmail.com', '+1-212-555-6010'),
(7, 'mike', '6219a87b95ae5b68674432c653eddbec392ca7cbac280c5ab79d438f0004a50d', 'patient', 'Mike', 'Taylor', 'mike.taylor@gmail.com', '+1-718-555-6020'),
(8, 'nina', '86e7d12b72b4e430ac87885b622fcb2cd3343959a05eda37a36fdef69a78ed3d', 'patient', 'Nina', 'Patel', 'nina.patel@gmail.com', '+1-646-555-6030'),
(9, 'ethan', 'e5d482fb045346143c703974194ce6aae58cae4a062881be912ad9d239655eaf', 'patient', 'Ethan', 'Clark', 'ethan.clark@gmail.com', '+1-917-555-6040'),
(10, 'olivia', 'b3744b33b7a8047b47aeeb1a7c5f47da5d6bde7277d950994ccef302792e6996', 'patient', 'Olivia', 'White', 'olivia.white@gmail.com', '+1-347-555-6050'),
(11, 'daniel', '12c65a34095310cd2d34b4d188c0c2cc988103a43a0218aa95496c887ef3d8a0', 'patient', 'Daniel', 'Nguyen', 'daniel.nguyen@gmail.com', '+1-212-555-6060'),
(12, 'emma', 'f94cf5be5c1f7944450889eacfa96fcd05b0e5bb2a49884d06dd3216f12304d6', 'patient', 'Emma', 'Lopez', 'emma.lopez@gmail.com', '+1-718-555-6070'),
(13, 'lucas', 'de9a1b678eb6b75cfc2a4b506b8c4033598ddda018eeecb603fd2fcaadbce406', 'patient', 'Lucas', 'Green', 'lucas.green@gmail.com', '+1-646-555-6080'),
(14, 'ava', '012a1ddae158a7eec048a9833c5aa4aef486255c7e68534fd5d3ae18550a158f', 'patient', 'Ava', 'Brown', 'ava.brown@gmail.com', '+1-917-555-6090'),
(15, 'noah', '941e298fed32b8d66ebdbb60dc6962ad4b7da8d090b89f0c2bb93a1825fadd77', 'patient', 'Noah', 'Allen', 'noah.allen@gmail.com', '+1-347-555-6100'),
(16, 'dr_khan', 'eedbd91c4a47a34a4e00c00a3b61b7bb14680f1ad70d629ae3947c75bbba8cc1', 'physician', 'Sara', 'Khan', 'sara.khan@mediflow.com', '+1-212-555-6061'),
(17, 'dr_miller', '42a89bb0edf064ca4692f8c98207f14be00bacf3b7dab303f89f2bfd2960a3f9', 'physician', 'Kevin', 'Miller', 'kevin.miller@mediflow.com', '+1-718-555-7071'),
(18, 'dr_jones', 'da306e5d2f0786bd03d9700d4438fd32813982ff5963b7ffe9fdb6fd63bf8884', 'physician', 'Hannah', 'Jones', 'hannah.jones@mediflow.com', '+1-646-555-8081'),
(19, 'dr_ng', 'acb5d5cebecf25f5cfd36fce7c292af88a9f3d4c96ced2eefe34de5d776ce371', 'physician', 'Chris', 'Ng', 'chris.ng@mediflow.com', '+1-917-555-9091'),
(20, 'dr_patel', 'e3c93130949cbc9dd8a69cd7ae62e64364602d8ced2b9b9b4689ba387bd20c44', 'physician', 'Meera', 'Patel', 'meera.patel@mediflow.com', '+1-347-555-1001');

-- Physician Data
INSERT IGNORE INTO Physician (account_id, specialization_id, license_number) VALUES
(1, 1, 'LIC-NY-45239A'),
(2, 2, 'LIC-NY-58201Q'),
(3, 3, 'LIC-NY-67315Z'),
(4, 4, 'LIC-NY-79482F'),
(5, 5, 'LIC-NY-90567T'),
(16, 6, 'LIC-NY-22345M'),
(17, 7, 'LIC-NY-33456B'),
(18, 8, 'LIC-NY-44567R'),
(19, 9, 'LIC-NY-55678L'),
(20, 10, 'LIC-NY-66789E');

-- Patient Data
INSERT IGNORE INTO Patient (account_id, date_of_birth, gender, address, insurance_id, pharmacy_id, emergency_contact) VALUES
(6, '1990-03-15', 'F', '12 Maple Ave, NY 10002', 1, 1, 'Raj Rao'),
(7, '1985-06-10', 'M', '25 Oak St, NY 10003', 2, 2, 'Laura Taylor'),
(8, '1992-09-05', 'F', '89 Pine Rd, NY 10004', 3, 3, 'Sanjay Patel'),
(9, '1988-11-20', 'M', '67 Elm Blvd, NY 10005', 4, 4, 'Maria Clark'),
(10, '1995-04-12', 'F', '45 Cedar Dr, NY 10006', 5, 5, 'Liam White'),
(11, '1991-07-08', 'M', '22 Birch Pl, NY 10007', 6, 6, 'Ella Nguyen'),
(12, '1993-08-25', 'F', '10 Spruce Ln, NY 10008', 7, 7, 'Jose Lopez'),
(13, '1998-02-19', 'M', '200 Park Ave, NY 10009', 8, 8, 'Kate Green'),
(14, '1987-12-30', 'F', '300 Hudson St, NY 10010', 9, 9, 'Eric Brown'),
(15, '1994-05-02', 'M', '400 Lexington Ave, NY 10011', 10, 10, 'Nora Allen');

-- Medications Data
INSERT IGNORE INTO Medications (medication_id, medication_name, dosage_form, storage_instructions, common_side_effects, description) VALUES
(1, 'Atorvastatin', 'Tablet', 'Room temperature', 'Muscle pain', 'Used for cholesterol control'),
(2, 'Paracetamol', 'Tablet', 'Below 25°C', 'Nausea', 'Pain and fever reducer'),
(3, 'Cetirizine', 'Tablet', 'Cool dry place', 'Drowsiness', 'Allergy relief'),
(4, 'Ibuprofen', 'Capsule', 'Room temperature', 'Stomach upset', 'Pain reliever'),
(5, 'Amoxicillin', 'Capsule', 'Below 25°C', 'Diarrhea', 'Antibiotic'),
(6, 'Losartan', 'Tablet', 'Dry place', 'Dizziness', 'Blood pressure control'),
(7, 'Omeprazole', 'Capsule', 'Below 30°C', 'Headache', 'Acidity treatment'),
(8, 'Metformin', 'Tablet', 'Room temperature', 'Nausea', 'Diabetes control'),
(9, 'Azithromycin', 'Tablet', 'Cool place', 'Diarrhea', 'Antibiotic for infections'),
(10, 'Vitamin D3', 'Capsule', 'Cool dry place', 'None', 'Bone health supplement');

-- Appointment Data
INSERT IGNORE INTO Appointment (appointment_id, patient_id, physician_id, date, status, reason, notes) VALUES
(1, 6, 1, '2025-10-10 09:30:00', 'Completed', 'Chest pain', 'Recommended ECG'),
(2, 7, 2, '2025-10-11 10:15:00', 'Pending', 'Skin allergy', 'Patch test planned'),
(3, 8, 3, '2025-09-25 14:00:00', 'Completed', 'Migraine', 'Follow-up after 2 weeks'),
(4, 9, 4, '2025-08-20 11:45:00', 'Completed', 'Back pain', 'Prescribed physiotherapy'),
(5, 10, 5, '2025-08-15 16:20:00', 'Cancelled', 'Fever', 'Reschedule in 3 days'),
(6, 11, 1, '2025-07-18 09:00:00', 'Completed', 'High BP', 'Lifestyle changes suggested'),
(7, 12, 2, '2025-07-10 13:30:00', 'Pending', 'Rash', 'Ointment prescribed'),
(8, 13, 3, '2025-06-25 15:10:00', 'Completed', 'Headache', 'MRI normal'),
(9, 14, 4, '2025-06-05 10:00:00', 'Completed', 'Knee pain', 'Rehabilitation therapy ongoing'),
(10, 15, 5, '2025-05-29 11:25:00', 'Completed', 'Cold', 'Recovered, no meds');

-- HealthRecord Data
INSERT IGNORE INTO HealthRecord (record_id, patient_id, physician_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required) VALUES
(1, 6, 1, '2025-10-10', 'Angina', 'Chest pain, dizziness', 'ECG: minor irregularities', 'Yes'),
(2, 6, 1, '2025-08-10', 'High Cholesterol', 'Fatigue', 'Lipid panel: LDL high', 'Yes'),
(3, 7, 2, '2025-10-11', 'Eczema', 'Rash, itching', 'Skin test positive', 'Yes'),
(4, 8, 3, '2025-09-25', 'Migraine', 'Severe headache, nausea', 'CT scan normal', 'Yes'),
(5, 9, 4, '2025-08-20', 'Lumbar strain', 'Lower back pain', 'MRI shows strain', 'No'),
(6, 10, 5, '2025-08-15', 'Viral infection', 'Fever, cough', 'CBC normal', 'No'),
(7, 11, 1, '2025-07-18', 'Hypertension', 'High BP', 'BP: 145/90', 'Yes'),
(8, 12, 2, '2025-07-10', 'Allergic dermatitis', 'Red rash', 'IgE high', 'Yes'),
(9, 13, 3, '2025-06-25', 'Tension headache', 'Mild pain', 'MRI normal', 'No'),
(10, 14, 4, '2025-06-05', 'Osteoarthritis', 'Joint stiffness', 'X-ray mild wear', 'Yes'),
(11, 15, 5, '2025-05-29', 'Common cold', 'Sneezing', 'Normal CBC', 'No'),
(12, 6, 1, '2025-04-12', 'Heart checkup', 'Normal', 'ECG fine', 'No');

-- Prescription Data
INSERT IGNORE INTO Prescription (prescription_id, record_id) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10),(11,11),(12,12);

-- Medicine Data
INSERT IGNORE INTO Medicine (Medication_id, Prescription_id, dosage, frequency, duration, instructions) VALUES
(1,1,'10mg','Once daily','30 days','After breakfast'),
(2,2,'500mg','Twice daily','5 days','After food'),
(3,2,'10mg','Once daily','10 days','Before sleep'),
(4,3,'400mg','Twice daily','14 days','With meals'),
(3,3,'10mg','Once daily','7 days','Bedtime dose'),
(5,4,'500mg','Thrice daily','7 days','Full course'),
(4,5,'400mg','Twice daily','10 days','After meals'),
(2,6,'500mg','Twice daily','5 days','After meals'),
(6,7,'50mg','Once daily','60 days','Morning before food'),
(3,8,'10mg','Once daily','15 days','Night dose'),
(8,9,'500mg','Twice daily','30 days','After meals'),
(4,10,'400mg','Twice daily','15 days','After meals'),
(10,10,'1000IU','Once daily','60 days','Morning'),
(9,11,'500mg','Once daily','3 days','Before meal'),
(1,12,'10mg','Once daily','30 days','Continue for 1 month');

-- ActivityLog Data
INSERT IGNORE INTO ActivityLog (log_id, patient_id, log_date, weight, bp, calories, duration_of_physical_activity) VALUES
(1,6,'2025-10-01',65.4,'120/80',2100,40),
(2,6,'2025-10-08',65.0,'118/78',2200,45),
(3,6,'2025-10-15',64.8,'119/79',2150,50),
(4,7,'2025-09-30',80.2,'125/85',2000,30),
(5,7,'2025-10-07',79.8,'124/84',2100,35),
(6,8,'2025-09-25',58.7,'118/78',1800,50),
(7,8,'2025-10-02',58.5,'117/77',1850,55),
(8,9,'2025-09-20',90.0,'135/90',2500,25),
(9,9,'2025-09-27',89.5,'134/88',2450,30),
(10,10,'2025-09-18',62.5,'110/70',1700,60),
(11,10,'2025-09-25',62.0,'109/68',1750,65),
(12,11,'2025-09-10',85.3,'140/88',2300,35),
(13,11,'2025-09-17',85.0,'138/86',2350,40),
(14,12,'2025-09-05',55.0,'115/75',1900,45),
(15,12,'2025-09-12',54.8,'114/74',1950,50),
(16,13,'2025-09-01',78.5,'130/82',2200,40),
(17,13,'2025-09-08',78.0,'129/80',2250,45),
(18,14,'2025-08-28',68.2,'120/80',2000,30),
(19,14,'2025-09-04',68.0,'119/79',2050,35),
(20,15,'2025-08-25',72.0,'118/78',2100,35),
(21,15,'2025-09-01',71.8,'117/77',2150,40);
