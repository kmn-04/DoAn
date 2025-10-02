package backend.service.impl;

import backend.entity.Booking;
import backend.entity.User;
import backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@tourbooking.com}")
    private String fromEmail;
    
    @Value("${app.name:Tour Booking System}")
    private String appName;
    
    @Value("${app.url:http://localhost:5173}")
    private String appUrl;
    
    private static final DateTimeFormatter DATE_FORMATTER = 
            DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    private static final NumberFormat CURRENCY_FORMATTER = 
            NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    
    @Override
    @Async
    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            String subject = String.format("[%s] Xác nhận đặt tour - %s", 
                    appName, booking.getBookingCode());
            
            String body = buildBookingConfirmationHtml(booking);
            
            sendHtmlEmail(booking.getUser().getEmail(), subject, body);
            
            log.info("✅ Sent booking confirmation email to: {}", booking.getUser().getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send booking confirmation email", e);
        }
    }
    
    @Override
    @Async
    public void sendPaymentConfirmationEmail(Booking booking) {
        try {
            String subject = String.format("[%s] Xác nhận thanh toán - %s", 
                    appName, booking.getBookingCode());
            
            String body = buildPaymentConfirmationHtml(booking);
            
            sendHtmlEmail(booking.getUser().getEmail(), subject, body);
            
            log.info("✅ Sent payment confirmation email to: {}", booking.getUser().getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send payment confirmation email", e);
        }
    }
    
    @Override
    @Async
    public void sendBookingCancellationEmail(Booking booking, String reason) {
        try {
            String subject = String.format("[%s] Hủy booking - %s", 
                    appName, booking.getBookingCode());
            
            String body = buildBookingCancellationHtml(booking, reason);
            
            sendHtmlEmail(booking.getUser().getEmail(), subject, body);
            
            log.info("✅ Sent booking cancellation email to: {}", booking.getUser().getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send booking cancellation email", e);
        }
    }
    
    @Override
    @Async
    public void sendBookingReminderEmail(Booking booking) {
        try {
            String subject = String.format("[%s] Nhắc nhở tour sắp khởi hành - %s", 
                    appName, booking.getTour().getName());
            
            String body = buildBookingReminderHtml(booking);
            
            sendHtmlEmail(booking.getUser().getEmail(), subject, body);
            
            log.info("✅ Sent booking reminder email to: {}", booking.getUser().getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send booking reminder email", e);
        }
    }
    
    @Override
    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            String subject = String.format("[%s] Đặt lại mật khẩu", appName);
            
            String resetUrl = String.format("%s/reset-password?token=%s", appUrl, resetToken);
            
            String body = buildPasswordResetHtml(user, resetUrl);
            
            sendHtmlEmail(user.getEmail(), subject, body);
            
            log.info("✅ Sent password reset email to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send password reset email", e);
        }
    }
    
    @Override
    @Async
    public void sendWelcomeEmail(User user) {
        try {
            String subject = String.format("Chào mừng đến với %s!", appName);
            
            String body = buildWelcomeHtml(user);
            
            sendHtmlEmail(user.getEmail(), subject, body);
            
            log.info("✅ Sent welcome email to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send welcome email", e);
        }
    }
    
    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            
            log.info("✅ Sent email to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send email to: {}", to, e);
        }
    }
    
    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            mailSender.send(message);
            
            log.info("✅ Sent HTML email to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to: {}", to, e);
        }
    }
    
    // ================== HTML Template Builders ==================
    
    private String buildBookingConfirmationHtml(Booking booking) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">Xác nhận đặt tour</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đặt tour tại %s. Đây là thông tin booking của bạn:</p>
                        
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Mã booking:</strong> %s</p>
                            <p><strong>Tour:</strong> %s</p>
                            <p><strong>Ngày khởi hành:</strong> %s</p>
                            <p><strong>Số người:</strong> %d người lớn, %d trẻ em</p>
                            <p><strong>Tổng tiền:</strong> %s</p>
                        </div>
                        
                        <p>Vui lòng thanh toán để xác nhận booking của bạn.</p>
                        <p>Trân trọng,<br/>%s</p>
                    </div>
                </body>
                </html>
                """,
                booking.getUser().getName(),
                appName,
                booking.getBookingCode(),
                booking.getTour().getName(),
                booking.getStartDate().format(DATE_FORMATTER),
                booking.getNumAdults(),
                booking.getNumChildren(),
                CURRENCY_FORMATTER.format(booking.getFinalAmount()),
                appName
        );
    }
    
    private String buildPaymentConfirmationHtml(Booking booking) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #16a34a;">Thanh toán thành công!</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Chúng tôi đã nhận được thanh toán của bạn cho booking <strong>%s</strong>.</p>
                        
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                            <p><strong>Tour:</strong> %s</p>
                            <p><strong>Số tiền:</strong> %s</p>
                            <p><strong>Trạng thái:</strong> Đã thanh toán</p>
                        </div>
                        
                        <p>Chúc bạn có một chuyến đi vui vẻ!</p>
                        <p>Trân trọng,<br/>%s</p>
                    </div>
                </body>
                </html>
                """,
                booking.getUser().getName(),
                booking.getBookingCode(),
                booking.getTour().getName(),
                CURRENCY_FORMATTER.format(booking.getFinalAmount()),
                appName
        );
    }
    
    private String buildBookingCancellationHtml(Booking booking, String reason) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #dc2626;">Hủy booking</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Booking <strong>%s</strong> của bạn đã được hủy.</p>
                        
                        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                            <p><strong>Tour:</strong> %s</p>
                            <p><strong>Lý do:</strong> %s</p>
                        </div>
                        
                        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
                        <p>Trân trọng,<br/>%s</p>
                    </div>
                </body>
                </html>
                """,
                booking.getUser().getName(),
                booking.getBookingCode(),
                booking.getTour().getName(),
                reason,
                appName
        );
    }
    
    private String buildBookingReminderHtml(Booking booking) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #f59e0b;">Tour sắp khởi hành!</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Tour <strong>%s</strong> của bạn sắp khởi hành vào <strong>%s</strong>.</p>
                        
                        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                            <p>Vui lòng chuẩn bị hành lý và có mặt đúng giờ tại điểm hẹn.</p>
                        </div>
                        
                        <p>Chúc bạn có một chuyến đi tuyệt vời!</p>
                        <p>Trân trọng,<br/>%s</p>
                    </div>
                </body>
                </html>
                """,
                booking.getUser().getName(),
                booking.getTour().getName(),
                booking.getStartDate().format(DATE_FORMATTER),
                appName
        );
    }
    
    private String buildPasswordResetHtml(User user, String resetUrl) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">Đặt lại mật khẩu</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link bên dưới để đặt lại:</p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="%s" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Đặt lại mật khẩu
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px;">Link này sẽ hết hạn sau 1 giờ.</p>
                        <p style="color: #6b7280; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <p>Trân trọng,<br/>%s</p>
                    </div>
                </body>
                </html>
                """,
                user.getName(),
                resetUrl,
                appName
        );
    }
    
    private String buildWelcomeHtml(User user) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">Chào mừng đến với %s!</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại %s.</p>
                        
                        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p>Bạn có thể bắt đầu khám phá các tour du lịch tuyệt vời của chúng tôi ngay bây giờ!</p>
                        </div>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="%s" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Khám phá tour
                            </a>
                        </div>
                        
                        <p>Trân trọng,<br/>%s</p>
                    </div>
                </body>
                </html>
                """,
                appName,
                user.getName(),
                appName,
                appUrl + "/tours",
                appName
        );
    }
    
    @Override
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            
            log.info("✅ Sent simple email to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send simple email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}

