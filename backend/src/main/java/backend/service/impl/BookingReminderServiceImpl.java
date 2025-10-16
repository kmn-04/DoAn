package backend.service.impl;

import backend.entity.Booking;
import backend.entity.Tour;
import backend.entity.User;
import backend.repository.BookingRepository;
import backend.service.BookingReminderService;
import backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingReminderServiceImpl implements BookingReminderService {
    
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    /**
     * Scheduled job runs every day at 8:00 AM
     * Sends reminder emails for tours starting in 3 days
     */
    @Scheduled(cron = "0 0 8 * * *")  // 8:00 AM daily
    @Transactional
    @Override
    public void sendUpcomingTourReminders() {
        log.info("Starting scheduled job: Send booking reminders");
        
        try {
            // Calculate target date (3 days from now)
            LocalDate targetDate = LocalDate.now().plusDays(3);
            
            // Find bookings that need reminders
            List<Booking> bookingsToRemind = bookingRepository.findAll().stream()
                    .filter(booking -> shouldSendReminder(booking, targetDate))
                    .toList();
            
            log.info("Found {} bookings that need reminders for date: {}", 
                    bookingsToRemind.size(), targetDate.format(DATE_FORMATTER));
            
            // Send reminder for each booking
            int successCount = 0;
            for (Booking booking : bookingsToRemind) {
                try {
                    sendReminderEmail(booking);
                    
                    // Mark reminder as sent
                    booking.setReminderSent(true);
                    booking.setReminderSentAt(LocalDateTime.now());
                    bookingRepository.save(booking);
                    
                    successCount++;
                    log.info("Sent reminder for booking: {} to {}", 
                            booking.getBookingCode(), booking.getCustomerEmail());
                } catch (Exception e) {
                    log.error("Failed to send reminder for booking: {}", booking.getBookingCode(), e);
                }
            }
            
            log.info("Completed scheduled job: Sent {} reminders successfully", successCount);
            
        } catch (Exception e) {
            log.error("Error in sendUpcomingTourReminders job", e);
        }
    }
    
    @Override
    @Transactional
    public void sendReminderForBooking(Long bookingId) {
        log.info("Manually sending reminder for booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        
        if (booking.getReminderSent()) {
            log.warn("Reminder already sent for booking: {}", booking.getBookingCode());
            return;
        }
        
        sendReminderEmail(booking);
        
        booking.setReminderSent(true);
        booking.setReminderSentAt(LocalDateTime.now());
        bookingRepository.save(booking);
        
        log.info("Reminder sent successfully for booking: {}", booking.getBookingCode());
    }
    
    /**
     * Check if should send reminder for this booking
     */
    private boolean shouldSendReminder(Booking booking, LocalDate targetDate) {
        // Already sent reminder
        if (Boolean.TRUE.equals(booking.getReminderSent())) {
            return false;
        }
        
        // Only send for confirmed bookings
        if (booking.getConfirmationStatus() != Booking.ConfirmationStatus.CONFIRMED) {
            return false;
        }
        
        // Check if tour starts on target date
        if (!booking.getStartDate().equals(targetDate)) {
            return false;
        }
        
        // Must have customer email
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Send reminder email
     */
    private void sendReminderEmail(Booking booking) {
        Tour tour = booking.getTour();
        
        String customerName = booking.getCustomerName();
        String customerEmail = booking.getCustomerEmail();
        
        String subject = String.format("🎉 Nhắc nhở: Tour %s sắp khởi hành!", 
                tour != null ? tour.getName() : "của bạn");
        
        String emailBody = buildReminderEmailBody(booking, tour, customerName);
        
        emailService.sendEmail(customerEmail, subject, emailBody);
    }
    
    /**
     * Build reminder email HTML body
     */
    private String buildReminderEmailBody(Booking booking, Tour tour, String customerName) {
        String tourName = tour != null ? tour.getName() : "Tour";
        String startDate = booking.getStartDate().format(DATE_FORMATTER);
        int daysUntil = (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), booking.getStartDate());
        
        String greeting = daysUntil == 3 ? "sắp đến ngày tour của bạn" :
                         daysUntil == 1 ? "tour của bạn sẽ bắt đầu vào ngày mai" :
                         daysUntil == 0 ? "tour của bạn bắt đầu hôm nay" :
                         "sắp đến ngày tour của bạn";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; width: 150px; color: #667eea; }
                    .detail-value { flex: 1; }
                    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Nhắc nhở tour</h1>
                        <p>%s!</p>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        
                        <div class="highlight">
                            <strong>⏰ Tour của bạn sẽ khởi hành trong %d ngày nữa!</strong>
                        </div>
                        
                        <div class="booking-details">
                            <h3>📋 Thông tin booking</h3>
                            <div class="detail-row">
                                <span class="detail-label">🎫 Mã booking:</span>
                                <span class="detail-value"><strong>%s</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">🏖️ Tour:</span>
                                <span class="detail-value"><strong>%s</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">📅 Ngày khởi hành:</span>
                                <span class="detail-value"><strong>%s</strong></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">👥 Số người:</span>
                                <span class="detail-value">%d người lớn, %d trẻ em, %d em bé</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">💰 Tổng tiền:</span>
                                <span class="detail-value"><strong>%,d VNĐ</strong></span>
                            </div>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h4 style="margin-top: 0;">📝 Lưu ý quan trọng:</h4>
                            <ul style="margin: 10px 0;">
                                <li>Vui lòng chuẩn bị giấy tờ tùy thân (CMND/CCCD/Passport)</li>
                                <li>Có mặt trước giờ khởi hành 30 phút</li>
                                <li>Mang theo đồ cá nhân cần thiết</li>
                                <li>Liên hệ HDV nếu có thắc mắc: <strong>0123456789</strong></li>
                            </ul>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="http://localhost:5173/dashboard/bookings" class="button">Xem chi tiết booking</a>
                        </p>
                        
                        <p>Chúc bạn có một chuyến đi vui vẻ và đáng nhớ! 🎊</p>
                        
                        <div class="footer">
                            <p>Email này được gửi tự động từ hệ thống Tour Booking System</p>
                            <p>Nếu bạn có thắc mắc, vui lòng liên hệ: support@tourbooking.com</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """,
            greeting.substring(0, 1).toUpperCase() + greeting.substring(1),
            customerName,
            daysUntil,
            booking.getBookingCode(),
            tourName,
            startDate,
            booking.getNumAdults(),
            booking.getNumChildren(),
            booking.getNumInfants(),
            booking.getFinalAmount().longValue()
        );
    }
}

