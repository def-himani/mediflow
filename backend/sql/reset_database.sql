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



-- MediFlow Database Setup with Original User
DROP DATABASE IF EXISTS mediflow_db;
DROP USER IF EXISTS 'mediflow_user'@'localhost'; -- application user (restricted access)
DROP USER IF EXISTS 'mediflow_dev'@'localhost'; -- developer user (full access)

-- Create database
CREATE DATABASE mediflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mediflow_db;

-- Confirmation message
SELECT 'Database mediflow_db has been reset successfully!' AS Status;