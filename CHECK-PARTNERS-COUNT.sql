-- Kiểm tra số lượng partners trong database
USE doan;

-- Đếm tổng số partners
SELECT 
    'TOTAL PARTNERS' as Category,
    COUNT(*) as Count
FROM partners;

-- Đếm theo type
SELECT 
    type as Category,
    COUNT(*) as Count
FROM partners
GROUP BY type;

-- Đếm theo location
SELECT 
    CASE 
        WHEN address LIKE '%Hà Nội%' THEN 'Hà Nội'
        WHEN address LIKE '%TP.HCM%' OR address LIKE '%Hồ Chí Minh%' THEN 'TP.HCM'
        WHEN address LIKE '%Đà Nẵng%' THEN 'Đà Nẵng'
        WHEN address LIKE '%Phú Quốc%' THEN 'Phú Quốc'
        ELSE 'Khác'
    END as Location,
    COUNT(*) as Count
FROM partners
GROUP BY Location;

-- Hiển thị tất cả partners
SELECT id, name, type, address, status
FROM partners
ORDER BY id;

