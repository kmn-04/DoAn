-- ================================
-- MIGRATION: STEP 1 - SETUP
-- Date: 2024-12-12
-- Description: Initial database setup
-- ================================

-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS doan;
USE doan;

-- Log migration
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    step VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_step (step)
);

INSERT IGNORE INTO migrations (step, description) 
VALUES ('step_01_setup', 'Initial database setup');

SELECT 'STEP 1: Database setup completed' AS status;
