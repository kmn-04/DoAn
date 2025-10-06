-- Migration: Remove PartiallyPaid payment status
-- Step 1: Update existing bookings with PartiallyPaid to Unpaid
UPDATE bookings 
SET payment_status = 'Unpaid' 
WHERE payment_status = 'PartiallyPaid';

-- Step 2: Alter ENUM to remove PartiallyPaid
ALTER TABLE bookings 
MODIFY COLUMN payment_status ENUM('Paid','Refunded','Refunding','Unpaid') 
COLLATE utf8mb4_unicode_ci NOT NULL;

