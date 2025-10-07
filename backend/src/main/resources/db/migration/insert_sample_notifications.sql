-- Insert sample notifications for testing
-- Types: Info, Success, Warning, Error
-- user_id: NULL = system-wide, 999 = specific user

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at) VALUES
-- System notifications (user_id = NULL)
(NULL, 'Cập nhật hệ thống', 'Hệ thống sẽ bảo trì vào 2h sáng ngày 15/10/2025. Thời gian dự kiến: 30 phút.', 'Info', NULL, 0, '2025-10-07 08:00:00'),
(NULL, 'Khuyến mãi Black Friday', 'Chương trình giảm giá lớn Black Friday đang diễn ra! Giảm đến 30% cho tất cả các tour.', 'Success', '/promotions', 0, '2025-10-07 07:30:00'),
(NULL, 'Cảnh báo thời tiết', 'Bão số 5 đang tiến vào miền Trung. Các tour đến Đà Nẵng, Hội An có thể bị hoãn.', 'Warning', NULL, 0, '2025-10-07 06:00:00'),
(NULL, 'Lỗi thanh toán', 'Hệ thống thanh toán MoMo đang gặp sự cố. Vui lòng sử dụng phương thức thanh toán khác.', 'Error', NULL, 1, '2025-10-06 14:20:00'),

-- User-specific notifications (user_id = 999)
(999, 'Đặt tour thành công', 'Bạn đã đặt tour "Du lịch Sapa 3N2Đ" thành công. Mã booking: BK001234', 'Success', '/bookings/1', 1, '2025-10-06 10:30:00'),
(999, 'Xác nhận thanh toán', 'Thanh toán của bạn cho booking BK001234 đã được xác nhận. Tổng tiền: 5.500.000đ', 'Success', '/bookings/1', 1, '2025-10-06 10:35:00'),
(999, 'Chờ xác nhận', 'Booking BK001235 của bạn đang chờ xác nhận từ nhà cung cấp. Chúng tôi sẽ thông báo sớm nhất.', 'Info', '/bookings/2', 0, '2025-10-05 16:45:00'),
(999, 'Tour sắp khởi hành', 'Tour "Du lịch Phú Quốc 4N3Đ" của bạn sẽ khởi hành vào ngày 20/10/2025. Vui lòng chuẩn bị hành lý.', 'Warning', '/bookings/3', 0, '2025-10-05 09:00:00'),
(999, 'Yêu cầu hủy tour', 'Yêu cầu hủy tour BK001236 của bạn đã được tiếp nhận. Chúng tôi sẽ xử lý trong 24h.', 'Info', '/bookings/4', 1, '2025-10-04 11:20:00'),
(999, 'Hoàn tiền thành công', 'Đã hoàn 4.200.000đ vào tài khoản của bạn cho booking BK001236. Vui lòng kiểm tra.', 'Success', '/bookings/4', 0, '2025-10-03 15:30:00'),

-- More system notifications
(NULL, 'Tour mới', 'Tour "Khám phá Tây Bắc 5N4Đ" vừa được ra mắt với giá ưu đãi 7.990.000đ', 'Info', '/tours/new', 0, '2025-10-03 08:00:00'),
(NULL, 'Chương trình khách hàng thân thiết', 'Tham gia ngay chương trình khách hàng thân thiết để nhận ưu đãi đặc biệt!', 'Success', '/loyalty-program', 1, '2025-10-02 10:00:00'),
(NULL, 'Thay đổi chính sách', 'Chính sách hủy tour đã được cập nhật. Xem chi tiết tại trang Điều khoản.', 'Warning', '/terms', 1, '2025-10-01 14:00:00'),

-- More user notifications
(999, 'Đánh giá tour', 'Bạn đã hoàn thành tour "Du lịch Đà Lạt 3N2Đ". Hãy để lại đánh giá của bạn!', 'Info', '/reviews/new?booking=5', 0, '2025-09-30 18:00:00'),
(999, 'Điểm thưởng', 'Bạn vừa nhận được 500 điểm thưởng từ booking BK001237. Tổng điểm: 1.200', 'Success', '/profile/points', 1, '2025-09-29 12:00:00'),
(999, 'Mã giảm giá', 'Chúc mừng sinh nhật! Bạn nhận được mã giảm giá 15% cho booking tiếp theo: BIRTHDAY15', 'Success', '/promotions', 0, '2025-09-28 00:00:00'),
(999, 'Cập nhật hồ sơ', 'Vui lòng cập nhật thông tin hộ chiếu trong hồ sơ của bạn trước ngày 25/10/2025.', 'Warning', '/profile/edit', 0, '2025-09-27 09:00:00'),
(999, 'Thanh toán thất bại', 'Thanh toán cho booking BK001238 không thành công. Vui lòng thử lại hoặc chọn phương thức khác.', 'Error', '/bookings/6/payment', 0, '2025-09-26 16:30:00'),

-- Recent notifications
(NULL, 'Tuyển dụng', 'Công ty đang tuyển dụng HDV cho các tour miền Bắc. Xem chi tiết tại trang Tuyển dụng.', 'Info', '/careers', 0, '2025-10-07 09:30:00'),
(999, 'Tin nhắn mới', 'Bạn có tin nhắn mới từ bộ phận hỗ trợ khách hàng về booking BK001234.', 'Info', '/messages/123', 0, '2025-10-07 10:15:00'),
(999, 'Xác thực tài khoản', 'Vui lòng xác thực email của bạn để sử dụng đầy đủ tính năng của hệ thống.', 'Warning', '/verify-email', 0, '2025-10-07 11:00:00');

