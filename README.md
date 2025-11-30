# MediFlow

MediFlow is a secure, integrated healthcare management platform designed to connect patients and physicians in a streamlined digital environment. The system supports appointment scheduling, electronic health records access, prescription management, and daily activity logging to give physicians deeper insight into patient well-being. Both patients and physicians share a unified interface with role-specific functionality: patients can view records, prescriptions, and log health activities, while physicians can manage schedules, review patient data, author health records, and prescribe medications. MediFlow’s design emphasizes accessibility, security, and efficiency, providing a comprehensive solution for modern electronic healthcare workflows.


## Project Setup & Deployment Guide

Follow the steps below to clone, configure, and run the MediFlow application (backend + frontend).


### 1. Clone the Project

```bash
git clone https://github.com/def-himani/mediflow
cd mediflow
```


### 2. Create Environment File

```bash
cp .env.example .env
```

Then **update the `MYSQL_ROOT_PASSWORD`** field in `.env` with the correct value for your system.


### 3. Set Up the MySQL Database

Use the database setup instructions from `README_db.md`. Run the following commands **in order**:

```bash
mysql -u root -p < backend/sql/reset_database.sql
mysql -u root -p mediflow_db < backend/sql/schema.sql
mysql -u root -p mediflow_db < backend/sql/seeds.sql
mysql -u root -p mediflow_db < backend/sql/procedures_triggers.sql
mysql -u root -p < backend/sql/database_security.sql
```

### 4. Create & Activate Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```


### 5. Run the Backend

```bash
python backend/run.py
```

The backend should now be running on its configured port (typically `5004`).


### 6. Set Up & Run the Frontend

Open a **new terminal** and run:

```bash
cd mediflow/frontend
npm install
npm run build
npm start
```


### 7. Access the Application

Visit:

```
http://localhost:4173/
```

The frontend will be connected to the running backend.

# Group members
- Ivan Yeung
- Advait Jishnani
- Eshaan Amin
- Himanika Muthukumar
- Tilak Bhansali

