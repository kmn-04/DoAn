-- Migration: Add 4-tier cancellation policy support
-- Thêm mức hoàn tiền thứ 2: trên 20 ngày = 70%

-- Add new column for high refund tier (20 days = 70%)
ALTER TABLE `cancellation_policies` 
ADD COLUMN `hours_before_departure_high_refund` INT NULL 
COMMENT 'Trên 20 ngày (480 giờ) = 70% refund' 
AFTER `hours_before_departure_full_refund`;

ALTER TABLE `cancellation_policies`
ADD COLUMN `high_refund_percentage` DECIMAL(5,2) DEFAULT 70.00
COMMENT '70% refund for high tier'
AFTER `full_refund_percentage`;

-- Update existing policies to use new 4-tier system
-- Chính sách mới:
-- Tier 1: >= 30 days (720h) = 100%
-- Tier 2: >= 20 days (480h) = 70%
-- Tier 3: >= 10 days (240h) = 50%
-- Tier 4: < 10 days = 0%

UPDATE `cancellation_policies` 
SET 
  `hours_before_departure_full_refund` = 720,      -- 30 days
  `hours_before_departure_high_refund` = 480,      -- 20 days
  `hours_before_departure_partial_refund` = 240,   -- 10 days
  `hours_before_departure_no_refund` = 0,          -- below 10 days
  `full_refund_percentage` = 100.00,
  `high_refund_percentage` = 70.00,
  `partial_refund_percentage` = 50.00,
  `no_refund_percentage` = 0.00
WHERE `status` = 'ACTIVE';

-- Insert a new default policy with 4 tiers if no active policy exists
INSERT INTO `cancellation_policies` 
(`name`, `description`, `policy_type`, 
 `hours_before_departure_full_refund`, 
 `hours_before_departure_high_refund`,
 `hours_before_departure_partial_refund`, 
 `hours_before_departure_no_refund`,
 `full_refund_percentage`, 
 `high_refund_percentage`,
 `partial_refund_percentage`, 
 `no_refund_percentage`,
 `cancellation_fee`, 
 `processing_fee`,
 `minimum_notice_hours`,
 `status`, 
 `priority`, 
 `is_active`,
 `effective_from`)
SELECT 
  'Chính sách hủy tour 4 mức' as name,
  'Chính sách hủy tour với 4 mức hoàn tiền: >30 ngày=100%, >20 ngày=70%, >10 ngày=50%, <10 ngày=0%' as description,
  'STANDARD' as policy_type,
  720 as hours_before_departure_full_refund,      -- 30 days
  480 as hours_before_departure_high_refund,      -- 20 days
  240 as hours_before_departure_partial_refund,   -- 10 days
  0 as hours_before_departure_no_refund,          -- below 10 days
  100.00 as full_refund_percentage,
  70.00 as high_refund_percentage,
  50.00 as partial_refund_percentage,
  0.00 as no_refund_percentage,
  100000.00 as cancellation_fee,   -- 100k VND
  50000.00 as processing_fee,      -- 50k VND
  1 as minimum_notice_hours,
  'ACTIVE' as status,
  1 as priority,
  b'1' as is_active,
  NOW() as effective_from
WHERE NOT EXISTS (
  SELECT 1 FROM `cancellation_policies` WHERE `status` = 'ACTIVE' LIMIT 1
);

