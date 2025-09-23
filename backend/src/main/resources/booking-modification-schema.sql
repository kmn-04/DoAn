-- ===================================
-- BOOKING MODIFICATION SYSTEM SCHEMA
-- ===================================

-- Create booking_modifications table
CREATE TABLE IF NOT EXISTS booking_modifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Foreign Keys
    booking_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    approved_by_user_id BIGINT,
    processed_by_user_id BIGINT,
    
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
    CONSTRAINT fk_booking_modification_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_modification_user 
        FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_modification_approved_by 
        FOREIGN KEY (approved_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_modification_processed_by 
        FOREIGN KEY (processed_by_user_id) REFERENCES users(id),
        
    -- Check constraints
    CONSTRAINT chk_modification_type 
        CHECK (modification_type IN (
            'DATE_CHANGE', 
            'PARTICIPANT_CHANGE', 
            'DATE_AND_PARTICIPANT_CHANGE', 
            'UPGRADE_TOUR_PACKAGE', 
            'ACCOMMODATION_CHANGE', 
            'OTHER'
        )),
    CONSTRAINT chk_modification_status 
        CHECK (status IN (
            'REQUESTED', 
            'UNDER_REVIEW', 
            'APPROVED', 
            'REJECTED', 
            'PROCESSING', 
            'COMPLETED', 
            'CANCELLED'
        )),
    CONSTRAINT chk_participants_positive 
        CHECK (original_participants > 0 AND (new_participants IS NULL OR new_participants > 0)),
    CONSTRAINT chk_amounts_positive 
        CHECK (original_amount >= 0 AND (new_amount IS NULL OR new_amount >= 0))
);

-- Create indexes for better performance
CREATE INDEX idx_booking_modifications_booking_id ON booking_modifications(booking_id);
CREATE INDEX idx_booking_modifications_user_id ON booking_modifications(requested_by_user_id);
CREATE INDEX idx_booking_modifications_status ON booking_modifications(status);
CREATE INDEX idx_booking_modifications_type ON booking_modifications(modification_type);
CREATE INDEX idx_booking_modifications_created_at ON booking_modifications(created_at);
CREATE INDEX idx_booking_modifications_status_created ON booking_modifications(status, created_at);

-- Insert sample data for testing
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
    1, -- booking_id
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
    2, -- booking_id
    2, -- requested_by_user_id (assuming user with id 2 exists)
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
),

-- Sample modification 3: Date and participant change
(
    3, -- booking_id
    3, -- requested_by_user_id (assuming user with id 3 exists)
    'DATE_AND_PARTICIPANT_CHANGE',
    'COMPLETED',
    '2024-03-05',
    '2024-03-05',
    3,
    750.00,
    '2024-03-12',
    '2024-03-12',
    2,
    650.00,
    -100.00,
    25.00,
    'Date conflict and one person cannot join',
    'Please refund the difference to original payment method',
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
),

-- Sample modification 4: Rejected modification
(
    1, -- booking_id
    1, -- requested_by_user_id
    'DATE_CHANGE',
    'REJECTED',
    '2024-01-15',
    '2024-01-15',
    2,
    500.00,
    '2024-01-08',
    '2024-01-08',
    2,
    500.00,
    0.00,
    25.00,
    'Emergency - need to travel earlier',
    'Family emergency requires immediate travel',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    NOW()
);

-- ===================================
-- VIEWS FOR REPORTING AND ANALYTICS
-- ===================================

-- View for modification summary
CREATE OR REPLACE VIEW modification_summary AS
SELECT 
    bm.id,
    bm.booking_id,
    b.booking_code,
    bm.modification_type,
    bm.status,
    u.name as requested_by_name,
    u.email as requested_by_email,
    bm.reason,
    bm.price_difference,
    bm.processing_fee,
    bm.created_at,
    bm.updated_at,
    CASE 
        WHEN bm.status = 'COMPLETED' THEN TIMESTAMPDIFF(HOUR, bm.created_at, bm.completed_at)
        WHEN bm.status IN ('PROCESSING', 'APPROVED') THEN TIMESTAMPDIFF(HOUR, bm.created_at, NOW())
        ELSE NULL
    END as processing_hours
FROM booking_modifications bm
JOIN bookings b ON bm.booking_id = b.id
JOIN users u ON bm.requested_by_user_id = u.id;

-- View for pending modifications requiring action
CREATE OR REPLACE VIEW pending_modifications AS
SELECT 
    bm.*,
    b.booking_code,
    b.start_date as tour_start_date,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    DATEDIFF(b.start_date, CURDATE()) as days_until_tour
FROM booking_modifications bm
JOIN bookings b ON bm.booking_id = b.id
JOIN users u ON bm.requested_by_user_id = u.id
WHERE bm.status IN ('REQUESTED', 'UNDER_REVIEW', 'APPROVED')
ORDER BY b.start_date ASC, bm.created_at ASC;

-- View for modification statistics
CREATE OR REPLACE VIEW modification_statistics AS
SELECT 
    COUNT(*) as total_modifications,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_modifications,
    COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_modifications,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_modifications,
    COUNT(CASE WHEN status IN ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING') THEN 1 END) as pending_modifications,
    AVG(CASE WHEN status = 'COMPLETED' AND completed_at IS NOT NULL 
        THEN TIMESTAMPDIFF(HOUR, created_at, completed_at) END) as avg_processing_hours,
    SUM(CASE WHEN status = 'COMPLETED' THEN ABS(price_difference) ELSE 0 END) as total_price_adjustments,
    SUM(CASE WHEN status = 'COMPLETED' THEN processing_fee ELSE 0 END) as total_processing_fees
FROM booking_modifications;

-- ===================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ===================================

DELIMITER //

-- Procedure to auto-expire old pending modifications
CREATE PROCEDURE ExpireOldModifications()
BEGIN
    UPDATE booking_modifications 
    SET status = 'CANCELLED',
        admin_notes = CONCAT(IFNULL(admin_notes, ''), '\nAuto-cancelled: Request expired after 7 days'),
        updated_at = NOW()
    WHERE status IN ('REQUESTED', 'UNDER_REVIEW')
    AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    SELECT ROW_COUNT() as expired_count;
END //

-- Procedure to get modification dashboard data
CREATE PROCEDURE GetModificationDashboard()
BEGIN
    -- Get statistics
    SELECT * FROM modification_statistics;
    
    -- Get pending modifications count by type
    SELECT 
        modification_type,
        COUNT(*) as count
    FROM booking_modifications 
    WHERE status IN ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING')
    GROUP BY modification_type;
    
    -- Get modifications requiring urgent attention (tour starts within 48 hours)
    SELECT COUNT(*) as urgent_modifications
    FROM booking_modifications bm
    JOIN bookings b ON bm.booking_id = b.id
    WHERE bm.status IN ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING')
    AND b.start_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY);
END //

DELIMITER ;

-- ===================================
-- TRIGGERS FOR AUDIT AND VALIDATION
-- ===================================

DELIMITER //

-- Trigger to validate modification before insert
CREATE TRIGGER before_modification_insert
BEFORE INSERT ON booking_modifications
FOR EACH ROW
BEGIN
    -- Validate that booking exists and is in valid status
    DECLARE booking_status VARCHAR(20);
    DECLARE tour_start_date DATE;
    
    SELECT status, start_date 
    INTO booking_status, tour_start_date
    FROM bookings 
    WHERE id = NEW.booking_id;
    
    -- Check if booking exists
    IF booking_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
    END IF;
    
    -- Check if booking is in valid status for modification
    IF booking_status NOT IN ('Confirmed', 'Paid') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking is not in a valid status for modification';
    END IF;
    
    -- Check if tour hasn't started yet
    IF tour_start_date <= CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot modify booking for tour that has already started';
    END IF;
    
    -- Check if modification is requested at least 48 hours before tour start
    IF tour_start_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Modification must be requested at least 48 hours before tour start date';
    END IF;
END //

-- Trigger to update booking when modification is completed
CREATE TRIGGER after_modification_update
AFTER UPDATE ON booking_modifications
FOR EACH ROW
BEGIN
    -- If modification is completed, update the booking
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        UPDATE bookings 
        SET 
            start_date = IFNULL(NEW.new_start_date, start_date),
            num_adults = CASE 
                WHEN NEW.new_participants IS NOT NULL THEN NEW.new_participants 
                ELSE num_adults 
            END,
            total_price = IFNULL(NEW.new_amount, total_price),
            updated_at = NOW()
        WHERE id = NEW.booking_id;
    END IF;
END //

DELIMITER ;

-- ===================================
-- SAMPLE QUERIES FOR TESTING
-- ===================================

/*
-- Get all pending modifications
SELECT * FROM pending_modifications;

-- Get modification statistics
SELECT * FROM modification_statistics;

-- Get recent modifications for a user
SELECT * FROM modification_summary 
WHERE requested_by_email = 'customer@example.com' 
ORDER BY created_at DESC 
LIMIT 10;

-- Get modifications requiring processing
SELECT * FROM booking_modifications 
WHERE status = 'APPROVED' 
ORDER BY created_at ASC;

-- Get modification trends by month
SELECT 
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    COUNT(*) as total_modifications,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
    AVG(ABS(price_difference)) as avg_price_change
FROM booking_modifications 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;
*/
