-- ================================================================
-- MediFlow Database Reset Script
-- Drops and recreates the database with original credentials
-- ================================================================

-- Drop database if it exists
DROP DATABASE IF EXISTS mediflow_db;

-- Drop user if exists
DROP USER IF EXISTS 'mediflow_user'@'localhost';

-- Create database
CREATE DATABASE mediflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'mediflow_user'@'localhost' IDENTIFIED BY 'mediflow_pass';

-- Grant all privileges
GRANT ALL PRIVILEGES ON mediflow_db.* TO 'mediflow_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Select the database for subsequent operations
USE mediflow_db;

-- Confirmation message
SELECT 'Database mediflow_db has been reset successfully!' AS Status;