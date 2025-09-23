-- Simple test data for debugging
INSERT INTO users (id, username, email, password, full_name, phone, role, status, created_at, updated_at) VALUES
(1, 'testuser', 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', '0123456789', 'CUSTOMER', 'Active', NOW(), NOW()),
(2, 'admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', '0987654321', 'ADMIN', 'Active', NOW(), NOW());

INSERT INTO categories (id, name, slug, description, status, created_at, updated_at) VALUES
(1, 'Test Category', 'test-category', 'Test category for debugging', 'Active', NOW(), NOW());

INSERT INTO tours (id, name, slug, short_description, full_description, price, duration, max_participants, category_id, status, created_at, updated_at) VALUES
(1, 'Test Tour', 'test-tour', 'A test tour for debugging', 'Full description of test tour', 1000000, 3, 20, 1, 'Active', NOW(), NOW());

INSERT INTO bookings (id, user_id, tour_id, booking_date, start_date, end_date, number_of_participants, total_amount, status, created_at, updated_at) VALUES
(1, 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 2, 2000000, 'Confirmed', NOW(), NOW());
