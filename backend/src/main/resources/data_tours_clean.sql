-- Insert sample tours với format mới
INSERT IGNORE INTO tours (
    id, title, short_description, description, location, destination,
    price, discounted_price, duration_days, duration_nights, max_participants, 
    min_participants, difficulty_level, status, is_featured, gallery_images,
    included_services, category_id, target_audience, created_at, updated_at
) VALUES 
-- Tour 1: Hạ Long Bay
(1, 'Du thuyền Hạ Long Bay 2 ngày 1 đêm', 
'Khám phá vẻ đẹp kỳ vĩ của vịnh Hạ Long với du thuyền sang trọng',
'Chuyến du lịch 2 ngày 1 đêm tại vịnh Hạ Long sẽ mang đến cho bạn những trải nghiệm tuyệt vời. Bạn sẽ được ngắm nhìn hàng nghìn hòn đảo đá vôi kỳ vĩ, thăm quan động Thiên Cung, làng chài Cửa Vạn, và thưởng thức hải sản tươi ngon.',
'Hà Nội', 'Hạ Long, Quảng Ninh',
2500000, 2200000, 2, 1, 20, 4, 'EASY', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1528127269322-539801943592?w=400", "https://images.unsplash.com/photo-1509650460351-3c78c0dcfce4?w=400", "https://images.unsplash.com/photo-1580654712603-eb43273aff33?w=400"]',
'Xe đưa đón, Du thuyền 5 sao, Bữa ăn theo chương trình, Hướng dẫn viên, Bảo hiểm du lịch',
1, 'FAMILY', NOW(), NOW()),

-- Tour 2: Sapa Trekking
(2, 'Sapa Trekking 3 ngày 2 đêm - Fansipan', 
'Chinh phục nóc nhà Đông Dương và khám phá văn hóa dân tộc',
'Hành trình 3 ngày 2 đêm tại Sapa sẽ đưa bạn đến với những thửa ruộng bậc thang tuyệt đẹp, các bản làng dân tộc thiểu số đặc sắc. Bạn sẽ có cơ hội chinh phục đỉnh Fansipan bằng cáp treo hiện đại.',
'Hà Nội', 'Sapa, Lào Cai',
1800000, 1500000, 3, 2, 15, 6, 'MEDIUM', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1539650116574-75c0c6d73469?w=400", "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", "https://images.unsplash.com/photo-1553150195-8383e3743b87?w=400"]',
'Xe đưa đón, Khách sạn 3 sao, Vé cáp treo Fansipan, Bữa ăn theo chương trình, Hướng dẫn viên địa phương',
2, 'FRIENDS', NOW(), NOW()),

-- Tour 3: Phú Quốc Beach
(3, 'Phú Quốc 4 ngày 3 đêm - Thiên đường biển đảo', 
'Thư giãn tại bãi biển đẹp nhất Việt Nam với resort 5 sao',
'Kỳ nghỉ 4 ngày 3 đêm tại đảo ngọc Phú Quốc sẽ mang đến cho bạn những giây phút thư giãn tuyệt vời. Bạn sẽ được tắm biển tại bãi Sao, bãi Kem với làn nước trong xanh, cát trắng mịn.',
'TP. Hồ Chí Minh', 'Phú Quốc, Kiên Giang',
4200000, 3800000, 4, 3, 25, 2, 'EASY', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", "https://images.unsplash.com/photo-1571801208806-fe5f129e2c4d?w=400"]',
'Vé máy bay khứ hồi, Resort 5 sao, Xe đưa đón sân bay, Bữa sáng hằng ngày, Tour 4 đảo, Bảo hiểm du lịch',
3, 'COUPLE', NOW(), NOW()),

-- Tour 4: Đà Lạt Romantic
(4, 'Đà Lạt 3 ngày 2 đêm - Thành phố ngàn hoa', 
'Lãng mạn tại thành phố mùa xuân với khí hậu mát mẻ',
'Chuyến du lịch 3 ngày 2 đêm tại Đà Lạt sẽ đưa bạn đến với thành phố ngàn hoa thơ mộng. Thăm quan thác Elephant, hồ Xuân Hương, chùa Linh Phước, làng hoa Vạn Thành.',
'TP. Hồ Chí Minh', 'Đà Lạt, Lâm Đồng',
1600000, 1400000, 3, 2, 18, 4, 'EASY', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1578271887552-5ac3a72752d2?w=400", "https://images.unsplash.com/photo-1562179136-4663191ca4bb?w=400", "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400"]',
'Xe đưa đón, Khách sạn 3 sao, Bữa ăn theo chương trình, Hướng dẫn viên, Vé tham quan',
1, 'COUPLE', NOW(), NOW()),

-- Tour 5: Ninh Bình Adventure
(5, 'Ninh Bình 2 ngày 1 đêm - Hoa Lư Tam Cốc', 
'Khám phá vẻ đẹp hùng vĩ của vịnh Hạ Long trên cạn',
'Tour 2 ngày 1 đêm tại Ninh Bình đưa bạn khám phá cố đô Hoa Lư, du thuyền sông Ngô Đồng qua Tam Cốc - Bích Động, leo núi Mua để ngắm toàn cảnh.',
'Hà Nội', 'Ninh Bình',
1200000, 1000000, 2, 1, 20, 6, 'MEDIUM', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400", "https://images.unsplash.com/photo-1583919098097-6fa7ac5a7a32?w=400", "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400"]',
'Xe đưa đón, Khách sạn 3 sao, Thuyền thăm Tam Cốc, Bữa ăn theo chương trình, Vé tham quan, Hướng dẫn viên',
2, 'FAMILY', NOW(), NOW()),

-- Tour 6: Mekong Delta
(6, 'Miền Tây 2 ngày 1 đêm - Chợ nổi Cái Răng', 
'Trải nghiệm cuộc sống miệt vườn và chợ nổi sông nước',
'Hành trình 2 ngày 1 đêm khám phá miền Tây Nam Bộ với chợ nổi Cái Răng, vườn trái cây, làng nghề truyền thống.',
'TP. Hồ Chí Minh', 'Cần Thơ, An Giang',
1100000, 950000, 2, 1, 16, 8, 'EASY', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1571057887532-7c2d5e8f2b9d?w=400", "https://images.unsplash.com/photo-1608736869737-8c366cf892c5?w=400", "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400"]',
'Xe đưa đón, Khách sạn 2 sao, Thuyền thăm chợ nổi, Bữa ăn đặc sản miền Tây, Hướng dẫn viên',
4, 'FAMILY', NOW(), NOW()),

-- Tour 7: Hội An Ancient Town
(7, 'Hội An 3 ngày 2 đêm - Phố cổ và Mỹ Sơn', 
'Khám phá di sản văn hóa thế giới và ẩm thực đặc sắc',
'Tour 3 ngày 2 đêm tại Hội An đưa bạn khám phá phố cổ với kiến trúc độc đáo, đền tháp Mỹ Sơn của người Chăm, làng rau Trà Quế.',
'TP. Hồ Chí Minh', 'Hội An, Quảng Nam',
2000000, 1750000, 3, 2, 20, 4, 'EASY', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400", "https://images.unsplash.com/photo-1582719471009-5a9e4bdd7af3?w=400", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400"]',
'Xe đưa đón, Khách sạn 4 sao, Vé tham quan Mỹ Sơn, Xe đạp tham quan phố cổ, Bữa ăn theo chương trình, Hướng dẫn viên',
5, 'FAMILY', NOW(), NOW()),

-- Tour 8: Cao Bang Falls  
(8, 'Cao Bằng 3 ngày 2 đêm - Thác Bản Giốc', 
'Chiêm ngưỡng thác nước hùng vĩ biên giới Việt - Trung',
'Chuyến du lịch 3 ngày 2 đêm tại Cao Bằng đưa bạn đến thác Bản Giốc - thác nước lớn nhất Việt Nam, động Ngườm Ngao kỳ vĩ.',
'Hà Nội', 'Cao Bằng',
1700000, 1500000, 3, 2, 12, 6, 'MEDIUM', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"]',
'Xe đưa đón, Khách sạn 2 sao, Bữa ăn theo chương trình, Vé tham quan, Thuyền tham quan thác, Hướng dẫn viên',
2, 'FRIENDS', NOW(), NOW());
