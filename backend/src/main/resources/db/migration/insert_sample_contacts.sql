-- =============================================
-- INSERT SAMPLE CONTACT REQUESTS
-- Dữ liệu mẫu cho testing trang Contact Admin
-- =============================================

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM contact_requests WHERE id >= 6;

-- Reset AUTO_INCREMENT
ALTER TABLE contact_requests AUTO_INCREMENT = 6;

-- Insert 20 contact requests với các trạng thái và nội dung đa dạng
INSERT INTO contact_requests 
(name, email, phone, subject, message, tour_interest, status, assigned_to, admin_note, created_at, updated_at) 
VALUES
-- New (Mới) - 7 requests
('Phạm Thị Mai', 'phammai@gmail.com', '0905123456', 'Hỏi về tour Hạ Long', 
'Em muốn đặt tour Hạ Long cho gia đình 4 người vào cuối tháng này. Tour có bao gồm ăn tối trên du thuyền không ạ? Chi phí khoảng bao nhiêu?', 
'Hạ Long Bay - Du thuyền 5 sao 2N1Đ', 
'New', NULL, NULL, 
'2025-10-06 08:30:00', '2025-10-06 08:30:00'),

('Nguyễn Văn Khôi', 'khoi.nguyen@outlook.com', '0912345678', 'Tour Sapa tháng 11', 
'Anh cho em hỏi tháng 11 đi Sapa có tuyết rơi không? Em muốn book tour cho 2 người, có phòng đôi view núi không ạ?', 
'Sapa - Fansipan - Cát Cát 3N2Đ', 
'New', NULL, NULL, 
'2025-10-06 09:15:00', '2025-10-06 09:15:00'),

('Lê Thị Hương', 'huongle@yahoo.com', '0923456789', 'Yêu cầu báo giá tour Phú Quốc', 
'Công ty em cần báo giá chi tiết cho đoàn 20 người đi Phú Quốc 4N3Đ. Khách sạn 4-5 sao, bao gồm vé máy bay từ Hà Nội. Vui lòng gửi báo giá qua email.', 
'Phú Quốc - Đảo Ngọc 4N3Đ', 
'New', NULL, NULL, 
'2025-10-06 10:00:00', '2025-10-06 10:00:00'),

('Trần Minh Tuấn', 'tuantran@gmail.com', '0934567890', 'Thủ tục visa Nhật Bản', 
'Em định book tour Tokyo nhưng chưa có visa. Công ty có hỗ trợ làm visa không ạ? Thời gian xử lý bao lâu? Em cần chuẩn bị giấy tờ gì?', 
'Tokyo - Phú Sĩ - Osaka 7N6Đ', 
'New', NULL, NULL, 
'2025-10-06 11:20:00', '2025-10-06 11:20:00'),

('Vũ Thị Lan', 'lanvu2024@gmail.com', '0945678901', 'Tour Đà Lạt dịp lễ 30/4', 
'Anh/chị cho em hỏi tour Đà Lạt dịp lễ 30/4 có chỗ trống không? Em muốn đi 3N2Đ cho 2 người. Giá tour bao nhiêu ạ?', 
'Đà Lạt - Thành phố Ngàn Hoa 3N2Đ', 
'New', NULL, NULL, 
'2025-10-06 13:45:00', '2025-10-06 13:45:00'),

('Hoàng Minh Đức', 'duchoang@outlook.com', '0956789012', 'Gia hạn visa Hàn Quốc', 
'Em đã đặt tour Seoul nhưng visa sắp hết hạn. Có thể gia hạn hoặc làm visa mới không? Tour xuất phát sau 15 ngày nữa.', 
'Seoul - Nami - Everland 5N4Đ', 
'New', NULL, NULL, 
'2025-10-06 14:30:00', '2025-10-06 14:30:00'),

('Đỗ Thị Ngọc', 'ngocdo@gmail.com', '0967890123', 'Hỏi về bảo hiểm du lịch', 
'Chị cho em hỏi tour Thái Lan có bao gồm bảo hiểm du lịch chưa ạ? Nếu chưa thì em có thể mua thêm không? Chi phí bao nhiêu?', 
'Bangkok - Pattaya - Coral Island 4N3Đ', 
'New', NULL, NULL, 
'2025-10-06 15:10:00', '2025-10-06 15:10:00'),

-- In_Progress (Đang xử lý) - 6 requests
('Bùi Văn Hùng', 'hungbui@gmail.com', '0978901234', 'Thay đổi ngày khởi hành', 
'Em đã đặt tour Nha Trang ngày 15/10 nhưng có việc đột xuất cần đổi sang ngày 20/10. Có được không ạ? Phí đổi lịch bao nhiêu?', 
'Nha Trang - Vinpearl 3N2Đ', 
'In_Progress', 1, 'Đang kiểm tra tình trạng tour ngày 20/10, sẽ phản hồi trong 24h.', 
'2025-10-05 08:00:00', '2025-10-06 09:30:00'),

('Nguyễn Thị Hà', 'hanguyen@yahoo.com', '0989012345', 'Tour Maldives honeymoon', 
'Vợ chồng em định đi Maldives tháng 12. Em muốn tư vấn resort 5 sao lãng mạn cho honeymoon, có spa và bữa tối riêng tư trên biển.', 
'Maldives - Paradise Resort 6N5Đ', 
'In_Progress', 1, 'Đã gửi 3 gợi ý resort, đang chờ khách lựa chọn.', 
'2025-10-04 10:30:00', '2025-10-06 11:00:00'),

('Lý Quang Minh', 'minhlq@gmail.com', '0990123456', 'Đặt chỗ nhóm 30 người', 
'Trường em tổ chức tour du lịch cho học sinh, khoảng 30 em cùng 5 giáo viên. Muốn đi Đà Nẵng 4N3Đ. Có ưu đãi cho đoàn không ạ?', 
'Đà Nẵng - Hội An - Bà Nà 4N3Đ', 
'In_Progress', 1, 'Đang làm báo giá cho đoàn 35 người, ưu đãi 15%.', 
'2025-10-05 14:20:00', '2025-10-06 10:15:00'),

('Trịnh Thị Thu', 'thutrinh@outlook.com', '0901234561', 'Hủy tour và hoàn tiền', 
'Em đã đặt tour Đà Lạt nhưng bị ốm nặng, bác sĩ khuyên không nên đi xa. Có thể hủy tour và được hoàn bao nhiêu % tiền?', 
'Đà Lạt - Langbiang 3N2Đ', 
'In_Progress', 1, 'Đang xem xét chứng nhận y tế, sẽ hoàn 70% theo chính sách.', 
'2025-10-03 16:00:00', '2025-10-05 14:30:00'),

('Phan Văn Thành', 'thanhphan@gmail.com', '0912345662', 'Thêm dịch vụ đưa đón sân bay', 
'Em đã book tour Phú Quốc nhưng quên không chọn dịch vụ đưa đón sân bay. Bây giờ có thể thêm không? Chi phí bao nhiêu ạ?', 
'Phú Quốc - Grand World 4N3Đ', 
'In_Progress', 1, 'Đã thêm dịch vụ pickup, phụ thu 500k/người. Đang chờ thanh toán.', 
'2025-10-05 09:30:00', '2025-10-06 08:00:00'),

('Võ Thị Kim', 'kimvo@yahoo.com', '0923456763', 'Tour Singapore cho người lớn tuổi', 
'Em muốn đặt tour Singapore cho bố mẹ (65 tuổi). Có tour nào nhẹ nhàng, không đi nhiều, phù hợp người lớn tuổi không ạ?', 
'Singapore - Malaysia 5N4Đ', 
'In_Progress', 1, 'Đã gợi ý tour senior-friendly, ít walking, có xe riêng.', 
'2025-10-04 11:00:00', '2025-10-05 16:45:00'),

-- Resolved (Đã giải quyết) - 5 requests
('Đinh Văn Long', 'longdinh@gmail.com', '0934567864', 'Xác nhận booking tour Hội An', 
'Em đã chuyển khoản đặt cọc tour Hội An. Vui lòng xác nhận đã nhận tiền và gửi voucher cho em ạ.', 
'Hội An - Cù Lao Chàm 3N2Đ', 
'Resolved', 1, 'Đã xác nhận thanh toán và gửi voucher qua email. Case closed.', 
'2025-10-02 08:00:00', '2025-10-02 14:30:00'),

('Lâm Thị Mai', 'mailam@outlook.com', '0945678965', 'Câu hỏi về chính sách trẻ em', 
'Tour Vũng Tàu có giảm giá cho trẻ em không ạ? Con em 8 tuổi, có tính phí như người lớn không?', 
'Vũng Tàu - Hồ Cốc 2N1Đ', 
'Resolved', 1, 'Đã tư vấn: Trẻ 8 tuổi tính 70% giá người lớn. Khách đã đặt tour.', 
'2025-10-01 10:30:00', '2025-10-01 15:00:00'),

('Cao Văn Phúc', 'phuccao@gmail.com', '0956789066', 'Gia hạn thời gian thanh toán', 
'Em đã đặt tour Thái Lan nhưng chưa kịp chuyển tiền đúng hạn. Có thể gia hạn thêm 3 ngày được không ạ?', 
'Bangkok - Phuket - Krabi 6N5Đ', 
'Resolved', 1, 'Đã gia hạn đến 10/10. Khách đã thanh toán đầy đủ.', 
'2025-09-28 09:00:00', '2025-09-30 11:20:00'),

('Ngô Thị Hồng', 'hongngo@yahoo.com', '0967890167', 'Yêu cầu phòng liền kề', 
'Gia đình em đặt 2 phòng tour Đà Nẵng. Có thể sắp xếp 2 phòng cạnh nhau hoặc đối diện không ạ?', 
'Đà Nẵng - Cù Lao Chàm 4N3Đ', 
'Resolved', 1, 'Đã confirm với khách sạn, 2 phòng liền kề tầng 12. Khách hài lòng.', 
'2025-09-29 14:00:00', '2025-10-01 10:00:00'),

('Tô Văn Bình', 'binhto@gmail.com', '0978901268', 'Hỏi về chương trình khuyến mãi', 
'Em thấy có mã giảm giá SUMMER2024 nhưng khi nhập không được. Mã này còn hiệu lực không ạ?', 
'Quy Nhơn - Kỳ Co 3N2Đ', 
'Resolved', 1, 'Mã đã hết hạn 30/9. Đã áp dụng mã FALL2024 -10% cho khách.', 
'2025-10-02 16:30:00', '2025-10-03 09:00:00'),

-- Closed (Đã đóng) - 2 requests
('Dương Thị Lan', 'landuong@outlook.com', '0989012369', 'Cảm ơn về chuyến đi tuyệt vời', 
'Em vừa đi tour Sapa về, rất hài lòng với dịch vụ. HDV nhiệt tình, khách sạn đẹp, ăn uống ngon. Cảm ơn team rất nhiều!', 
'Sapa - Fansipan - Bản Cát Cát 3N2Đ', 
'Closed', NULL, 'Feedback tích cực từ khách. Đã ghi nhận và cảm ơn.', 
'2025-09-25 18:00:00', '2025-09-26 09:00:00'),

('Hồ Văn Nam', 'namho@gmail.com', '0990123470', 'Spam - Quảng cáo dịch vụ không liên quan', 
'Công ty chúng tôi cung cấp dịch vụ marketing online, SEO, Facebook Ads. Liên hệ 09xxxx để được tư vấn miễn phí...', 
NULL, 
'Closed', 1, 'SPAM - Đã đánh dấu và đóng. Không phản hồi.', 
'2025-10-05 20:00:00', '2025-10-05 20:05:00');

-- Thống kê sau khi insert
SELECT 
    status,
    COUNT(*) as total,
    CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contact_requests), 1), '%') as percentage
FROM contact_requests
GROUP BY status
ORDER BY 
    FIELD(status, 'New', 'In_Progress', 'Resolved', 'Closed');

SELECT '✅ Đã thêm 20 contact requests mẫu thành công!' as message;
