-- Schema updates for international tours feature
-- Run these commands to update existing database

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE,
    continent ENUM('ASIA', 'EUROPE', 'AMERICA', 'AFRICA', 'OCEANIA') NOT NULL,
    currency VARCHAR(10),
    visa_required BOOLEAN NOT NULL DEFAULT FALSE,
    flag_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add international tour fields to tours table
ALTER TABLE tours 
ADD COLUMN tour_type ENUM('DOMESTIC', 'INTERNATIONAL') NOT NULL DEFAULT 'DOMESTIC',
ADD COLUMN country_id BIGINT,
ADD COLUMN visa_info TEXT,
ADD COLUMN flight_included BOOLEAN NOT NULL DEFAULT FALSE;

-- Add foreign key constraint
ALTER TABLE tours 
ADD CONSTRAINT fk_tours_country 
FOREIGN KEY (country_id) REFERENCES countries(id);

-- Add indexes for better performance
CREATE INDEX idx_tours_tour_type ON tours(tour_type);
CREATE INDEX idx_tours_country ON tours(country_id);
CREATE INDEX idx_countries_continent ON countries(continent);
CREATE INDEX idx_countries_visa_required ON countries(visa_required);
