-- Migration: Fix role names to match security configuration
-- Date: 2025-10-18
-- Description: Update role names from 'Admin', 'Staff', 'Customer' to 'ADMIN', 'STAFF', 'USER'
-- This ensures compatibility with Spring Security's role checking

-- Update Customer to USER (the main user role)
UPDATE roles 
SET name = 'USER', 
    description = 'Regular user/customer'
WHERE name = 'Customer' OR name = 'CUSTOMER' OR name = 'customer';

-- Update Admin to ADMIN (capitalized for consistency)
UPDATE roles 
SET name = 'ADMIN',
    description = 'System administrator'
WHERE name = 'Admin' OR name = 'admin';

-- Update Staff to STAFF (if needed in future)
UPDATE roles 
SET name = 'STAFF',
    description = 'Staff member'
WHERE name = 'Staff' OR name = 'staff';

-- Verify the changes
SELECT * FROM roles;

