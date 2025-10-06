-- Sample Reviews Data for Testing
-- Make sure to select your database first: USE your_database_name;

-- Reviews for Tour 1 (Hạ Long - Ninh Bình 3N2Đ)
INSERT INTO `reviews` (`user_id`, `tour_id`, `booking_id`, `rating`, `comment`, `images`, `helpful_count`, `admin_reply`, `replied_by`, `replied_at`, `status`, `created_at`, `updated_at`) VALUES
(999, 1, 1, 5, 'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Cảnh đẹp tuyệt vời, đồ ăn ngon. Gia đình tôi rất hài lòng và sẽ quay lại!', NULL, 15, 'Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ! Chúng tôi rất vui khi tour đã mang lại trải nghiệm tuyệt vời cho gia đình bạn.', 1, '2025-10-03 10:30:00', 'Approved', '2025-10-02 15:30:00', '2025-10-03 10:30:00'),

(1191, 1, NULL, 4, 'Tour tốt, cảnh đẹp. Tuy nhiên thời gian di chuyển hơi dài. Nên có thêm thời gian tự do tham quan.', NULL, 8, 'Cảm ơn góp ý của bạn! Chúng tôi sẽ xem xét điều chỉnh lịch trình để phù hợp hơn.', 1, '2025-10-03 11:00:00', 'Approved', '2025-10-02 18:45:00', '2025-10-03 11:00:00'),

-- Reviews for Tour 2 (Sapa - Fansipan 2N1Đ)
(999, 2, NULL, 5, 'Chinh phục đỉnh Fansipan thật tuyệt! Cảm giác đứng trên nóc nhà Đông Dương không gì sánh bằng. HDV am hiểu về địa phương.', NULL, 22, NULL, NULL, NULL, 'Approved', '2025-10-01 20:15:00', '2025-10-01 20:15:00'),

(1191, 2, NULL, 5, 'Sapa đẹp mê hồn! Thời tiết se lạnh, người dân thân thiện. Homestay sạch sẽ, ăn ngon. Highly recommended!', NULL, 18, 'Thank you! Sapa luôn là điểm đến yêu thích của du khách miền xuôi 😊', 2, '2025-10-02 09:00:00', 'Approved', '2025-10-01 22:30:00', '2025-10-02 09:00:00'),

-- Reviews for Tour 3 (Đà Lạt lãng mạn 3N2Đ)
(999, 3, NULL, 4, 'Đà Lạt thơ mộng và lãng mạn. Khách sạn tốt, đồ ăn ngon. Nếu có thêm 1 ngày nữa thì hoàn hảo!', NULL, 12, 'Chúng tôi có tour Đà Lạt 4N3Đ nếu bạn muốn khám phá nhiều hơn nha!', 1, '2025-10-03 14:00:00', 'Approved', '2025-10-03 10:20:00', '2025-10-03 14:00:00'),

(1191, 3, NULL, 5, 'Perfect cho couple! Mình và bạn gái đi rất vui. Chụp hình nhiều góc đẹp. Cảm ơn anh HDV đã chụp ảnh nhiệt tình 📸', NULL, 25, NULL, NULL, NULL, 'Approved', '2025-10-02 16:45:00', '2025-10-02 16:45:00'),

-- Reviews for Tour 6 (Đà Nẵng - Hội An 4N3Đ)
(999, 6, NULL, 5, 'Đà Nẵng - Hội An là combo hoàn hảo! Bà Nà Hills cực đỉnh, Hội An về đêm lung linh. Resort view biển tuyệt đẹp!', NULL, 30, 'Rất vui khi tour đã để lại ấn tượng đẹp! Hẹn gặp lại quý khách trong các tour tiếp theo!', 1, '2025-10-04 09:30:00', 'Approved', '2025-10-03 19:00:00', '2025-10-04 09:30:00'),

(1191, 6, NULL, 4, 'Tour tốt, tuy nhiên nên có thêm thời gian ở Hội An. 1 ngày không đủ để khám phá hết phố cổ này.', NULL, 10, 'Cảm ơn feedback! Chúng tôi đang có tour Hội An 3N2Đ chuyên sâu nếu bạn quan tâm.', 2, '2025-10-04 10:00:00', 'Approved', '2025-10-04 08:15:00', '2025-10-04 10:00:00'),

-- Reviews for Tour 9 (Nha Trang biển xanh 3N2Đ)
(999, 9, NULL, 5, 'Nha Trang thật sự là thiên đường biển! Tour 4 đảo rất thú vị, lặn ngắm san hô đẹp mắt. Hải sản tươi ngon!', NULL, 20, NULL, NULL, NULL, 'Approved', '2025-10-02 14:30:00', '2025-10-02 14:30:00'),

(1191, 9, NULL, 3, 'Tour ok nhưng hơi đông khách, phải chờ lâu khi tham quan. Khách sạn bình thường, không như mô tả lắm.', NULL, 5, 'Xin lỗi vì trải nghiệm chưa tốt. Chúng tôi sẽ cải thiện việc phân bổ khách và kiểm tra lại chất lượng khách sạn.', 1, '2025-10-03 11:30:00', 'Approved', '2025-10-03 09:00:00', '2025-10-03 11:30:00'),

-- Reviews for Tour 10 (Phú Quốc nghỉ dưỡng 4N3Đ)
(999, 10, NULL, 5, 'Resort 5 sao đỉnh của chóp! Bãi biển riêng tuyệt đẹp, ăn uống tuyệt vời. Đáng từng đồng! Highly recommend cho ai muốn nghỉ dưỡng cao cấp.', NULL, 35, 'Cảm ơn! Phú Quốc là điểm đến yêu thích cho các kỳ nghỉ sang trọng. Hẹn gặp lại!', 1, '2025-10-05 10:00:00', 'Approved', '2025-10-04 20:30:00', '2025-10-05 10:00:00'),

(1191, 10, NULL, 5, 'Tuyệt vời! Safari Zoo, Grand World, Vinpearl đều rất đáng trải nghiệm. Bamboo Circus show cực đỉnh 🎪', NULL, 28, NULL, NULL, NULL, 'Approved', '2025-10-04 17:00:00', '2025-10-04 17:00:00'),

-- Pending review (chưa duyệt)
(999, 14, NULL, 2, 'Tour không như mong đợi. HDV thiếu kinh nghiệm, lịch trình bị delay nhiều. Cần cải thiện!', NULL, 3, NULL, NULL, NULL, 'Pending', '2025-10-06 08:00:00', '2025-10-06 08:00:00'),

-- Rejected review (vi phạm)
(1191, 16, NULL, 1, 'Tour tệ, lừa đảo, không nên đi. Công ty này chỉ biết lừa tiền!!!', NULL, 0, NULL, NULL, NULL, 'Rejected', '2025-10-05 12:00:00', '2025-10-05 15:00:00');

