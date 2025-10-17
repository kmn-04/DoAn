-- Check promotion NEWUSER50 details
SELECT 
    id,
    code,
    description,
    type,
    value,
    min_order_amount,
    max_discount,
    start_date,
    end_date,
    usage_limit,
    used_count,
    status
FROM promotions
WHERE code = 'NEWUSER50';

-- Also check enum values
SHOW COLUMNS FROM promotions LIKE 'type';

