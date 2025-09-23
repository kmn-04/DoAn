-- ===================================
-- BOOKING MODIFICATION SYSTEM SCHEMA UPDATES
-- ===================================

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
    INDEX idx_policy_priority (priority)
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

-- Create booking_modifications table
CREATE TABLE IF NOT EXISTS booking_modifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Foreign Keys
    booking_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    approved_by_user_id BIGINT NULL,
    processed_by_user_id BIGINT NULL,
    
    -- Modification Type and Status
    modification_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    
    -- Original Values
    original_start_date DATE,
    original_end_date DATE,
    original_participants INT,
    original_amount DECIMAL(10, 2),
    
    -- Requested New Values
    new_start_date DATE,
    new_end_date DATE,
    new_participants INT,
    new_amount DECIMAL(10, 2),
    
    -- Pricing Information
    price_difference DECIMAL(10, 2) DEFAULT 0.00,
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Reason and Notes
    reason VARCHAR(500),
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    -- Constraints
    CONSTRAINT chk_booking_modification_type 
        CHECK (modification_type IN (
            'DATE_CHANGE', 
            'PARTICIPANT_CHANGE', 
            'DATE_AND_PARTICIPANT_CHANGE', 
            'UPGRADE_TOUR_PACKAGE', 
            'ACCOMMODATION_CHANGE', 
            'OTHER'
        )),
    CONSTRAINT chk_booking_modification_status 
        CHECK (status IN (
            'REQUESTED', 
            'UNDER_REVIEW', 
            'APPROVED', 
            'REJECTED', 
            'PROCESSING', 
            'COMPLETED', 
            'CANCELLED'
        ))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking_id ON booking_modifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_user_id ON booking_modifications(requested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_status ON booking_modifications(status);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_type ON booking_modifications(modification_type);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_created_at ON booking_modifications(created_at);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_status_created ON booking_modifications(status, created_at);

-- Insert sample data for testing (only if table is empty)
INSERT IGNORE INTO booking_modifications (
    booking_id,
    requested_by_user_id,
    modification_type,
    status,
    original_start_date,
    original_end_date,
    original_participants,
    original_amount,
    new_start_date,
    new_end_date,
    new_participants,
    new_amount,
    price_difference,
    processing_fee,
    reason,
    customer_notes,
    created_at,
    updated_at
) VALUES 
-- Sample modification 1: Date change
(
    1, -- booking_id (assuming booking with id 1 exists)
    1, -- requested_by_user_id (assuming user with id 1 exists)
    'DATE_CHANGE',
    'REQUESTED',
    '2024-01-15',
    '2024-01-15',
    2,
    500.00,
    '2024-01-22',
    '2024-01-22',
    2,
    500.00,
    0.00,
    25.00,
    'Change travel date due to work schedule conflict',
    'Would prefer morning departure if available',
    NOW(),
    NOW()
),

-- Sample modification 2: Participant change
(
    1, -- booking_id
    1, -- requested_by_user_id
    'PARTICIPANT_CHANGE',
    'APPROVED',
    '2024-02-10',
    '2024-02-10',
    2,
    800.00,
    '2024-02-10',
    '2024-02-10',
    4,
    1000.00,
    200.00,
    25.00,
    'Adding 2 more family members',
    'Two additional adults joining the tour',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NOW()
);