# MediFlow Database Setup Guide

This guide walks you through setting up and seeding the MediFlow MySQL database.

## Prerequisites

- MySQL 8.0+ installed and running
- WSL or Linux terminal access
- `.env` file configured with database credentials (see [`.env.example`](.env.example))

## Step 1: Create Database

```
mysql -u root -p < backend/sql/reset_database.sql
```
You will be prompted for the root password for your mysql root account

## Step 2: Configure Environment Variables

Update your [`.env`](.env) file with the database credentials:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=mediflow_user
MYSQL_PASSWORD=mediflow_pass
MYSQL_DATABASE=mediflow_db
MYSQL_CHARSET=utf8mb4
```

**For WSL + Windows MySQL:**

```env
MYSQL_HOST=172.x.x.x
MYSQL_PORT=3306
MYSQL_USER=mediflow_user
MYSQL_PASSWORD=mediflow_pass
MYSQL_DATABASE=mediflow_db
MYSQL_CHARSET=utf8mb4
```

## Step 3: Load Database Schema

Run the schema and seed file to create all tables and populate them:

Load sample data (Insurance, Pharmacy, Accounts, Patients, Appointments, etc.):

```bash
mysql -u root -p mediflow_db < backend/sql/schema.sql
mysql -u root -p mediflow_db < backend/sql/seeds.sql
```

**Expected output:** No errors (silent success).

## Step 4: Set up Database Users and their Permissions

Load sample data (Insurance, Pharmacy, Accounts, Patients, Appointments, etc.):

```bash
mysql -u root -p  < backend/sql/database_security.sql
```

## Step 5: Load Stored Procedures and Triggers

Apply stored procedures, functions, and triggers (Manually executing file):

```bash
mysql -u root -p mediflow_db < backend/sql/procedures_triggers.sql
```

## Step 6: Verify Setup

Check that tables were created:

You will be prompted for mediflow_user password: "mediflow_pass"

```bash
mysql -h 127.0.0.1 -u mediflow_user -p mediflow_db -e "SHOW TABLES;"
```

You should see:
```
Tables_in_mediflow_db
Account
ActivityLog
Activity_Log_Audit
Appointment
HealthRecord
Insurance
Medicine
Medications
Patient
Pharmacy
Physician
Prescription
Specialization
```

Check sample data:

```bash
mysql -h 127.0.0.1 -u mediflow_user -p mediflow_db -e "SELECT COUNT(*) FROM Account;"
```

Should return `20` (20 seeded accounts).

## Step 7: Start the Application

Activate virtual environment and run the backend:

```bash
source .venv/bin/activate
python backend/run.py
```

Test the health endpoint:

```bash
curl http://localhost:5004/api/health
```

Expected response: `200 OK`

## Login with Seeded Data

After database setup, you can login with any of these accounts:

### Physicians
- Username: `dr_smith` | Password: `docsmith1`
- Username: `dr_brown` | Password: `drlinda2`
- Username: `dr_wilson` | Password: `drmark3`
- Username: `dr_lee` | Password: `drgrace4`
- Username: `dr_adams` | Password: `drjames5`
- Username: `dr_khan` | Password: `drsara6`
- Username: `dr_miller` | Password: `drkevin7`
- Username: `dr_jones` | Password: `drhannah8`
- Username: `dr_ng` | Password: `drchris9`
- Username: `dr_patel` | Password: `drmeera10`

### Patients
- Username: `sheela` | Password: `sheela01`
- Username: `mike` | Password: `mike02`
- Username: `nina` | Password: `nina03`
- Username: `ethan` | Password: `ethan04`
- Username: `olivia` | Password: `olivia05`
- Username: `daniel` | Password: `daniel06`
- Username: `emma` | Password: `emma07`
- Username: `lucas` | Password: `lucas08`
- Username: `ava` | Password: `ava09`
- Username: `noah` | Password: `noah10`