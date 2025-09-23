-- ================================
-- BOOKING CANCELLATION SYSTEM SCHEMA
-- ================================

-- Create cancellation_policies table
CREATE TABLE IF NOT EXISTS cancellation_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    policy_type ENUM('STANDARD', 'FLEXIBLE', 'STRICT', 'CUSTOM') NOT NULL,
    
    -- Time-based refund rules (in hours)
    hours_before_departure_full_refund INT,
    hours_before_departure_partial_refund INT,
    hours_before_departure_no_refund INT,
    
    -- Refund percentages
    full_refund_percentage DECIMAL(5,2) DEFAULT 100.00,
    partial_refund_percentage DECIMAL(5,2) DEFAULT 50.00,
    no_refund_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Fixed fees
    cancellation_fee DECIMAL(10,2) DEFAULT 0.00,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Special conditions
    allows_medical_emergency_exception BOOLEAN DEFAULT FALSE,
    allows_weather_exception BOOLEAN DEFAULT FALSE,
    allows_force_majeure_exception BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    minimum_notice_hours INT DEFAULT 1,
    
    -- Policy management
    status ENUM('ACTIVE', 'INACTIVE', 'DEPRECATED') NOT NULL DEFAULT 'ACTIVE',
    category_id BIGINT,
    priority INT NOT NULL DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (category_id) REFERENCES categories(id),
    
    -- Indexes
    INDEX idx_policy_status (status),
    INDEX idx_policy_type (policy_type),
    INDEX idx_policy_category (category_id),
    INDEX idx_policy_priority (priority),
    
    -- Constraints
    UNIQUE KEY unique_policy_name (name)
);

-- Create booking_cancellations table
CREATE TABLE IF NOT EXISTS booking_cancellations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- References
    booking_id BIGINT NOT NULL,
    cancelled_by_user_id BIGINT NOT NULL,
    cancellation_policy_id BIGINT NOT NULL,
    
    -- Cancellation details
    reason TEXT NOT NULL,
    reason_category ENUM(
        'PERSONAL_EMERGENCY', 'MEDICAL_EMERGENCY', 'WEATHER_CONDITIONS', 
        'FORCE_MAJEURE', 'TRAVEL_RESTRICTIONS', 'SCHEDULE_CONFLICT',
        'FINANCIAL_DIFFICULTY', 'DISSATISFACTION', 'DUPLICATE_BOOKING',
        'TECHNICAL_ERROR', 'OTHER'
    ) NOT NULL,
    additional_notes TEXT,
    
    -- Financial calculations
    original_amount DECIMAL(10,2) NOT NULL,
    refund_percentage DECIMAL(5,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    cancellation_fee DECIMAL(10,2) DEFAULT 0.00,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    final_refund_amount DECIMAL(10,2) NOT NULL,
    
    -- Timing information
    hours_before_departure INT NOT NULL,
    departure_date DATETIME NOT NULL,
    cancelled_at DATETIME NOT NULL,
    
    -- Status tracking
    status ENUM('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'REQUESTED',
    refund_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NOT_APPLICABLE') NOT NULL DEFAULT 'PENDING',
    
    -- Admin processing
    processed_by_user_id BIGINT,
    processed_at DATETIME,
    admin_notes TEXT,
    
    -- Special circumstances
    is_medical_emergency BOOLEAN DEFAULT FALSE,
    is_weather_related BOOLEAN DEFAULT FALSE,
    is_force_majeure BOOLEAN DEFAULT FALSE,
    supporting_documents TEXT, -- JSON array of document URLs
    
    -- Refund tracking
    refund_transaction_id VARCHAR(255),
    refund_method VARCHAR(100),
    refund_processed_at DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    FOREIGN KEY (cancellation_policy_id) REFERENCES cancellation_policies(id),
    FOREIGN KEY (processed_by_user_id) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_cancellation_booking (booking_id),
    INDEX idx_cancellation_user (cancelled_by_user_id),
    INDEX idx_cancellation_status (status),
    INDEX idx_cancellation_refund_status (refund_status),
    INDEX idx_cancellation_reason (reason_category),
    INDEX idx_cancellation_date (cancelled_at),
    INDEX idx_cancellation_emergency (is_medical_emergency, is_weather_related, is_force_majeure),
    INDEX idx_cancellation_processed (processed_at),
    
    -- Constraints
    UNIQUE KEY unique_booking_cancellation (booking_id),
    CHECK (final_refund_amount >= 0),
    CHECK (hours_before_departure >= 0)
);

-- Add CancellationRequested status to bookings table if not exists
ALTER TABLE bookings 
MODIFY COLUMN status ENUM('Pending', 'Confirmed', 'Paid', 'Cancelled', 'Completed', 'CancellationRequested') NOT NULL DEFAULT 'Pending';
