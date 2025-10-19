package backend.service.impl;

import backend.entity.Newsletter;
import backend.repository.NewsletterRepository;
import backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender mailSender;
    private final NewsletterRepository newsletterRepository;
    
    @Value("${app.email.from}")
    private String fromEmail;
    
    @Value("${app.email.from-name}")
    private String fromName;
    
    @Value("${spring.mail.username:#{null}}")
    private String mailUsername;
    
    private static final String FRONTEND_URL = "http://localhost:5173";
    
    @Override
    @Async
    public void sendNewsletterWelcomeEmail(String to, String subscriberEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("🎉 Chào mừng đến với TourBooking - Đăng ký nhận tin thành công!");
            
            String htmlContent = buildWelcomeEmailTemplate(subscriberEmail);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Welcome email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending welcome email to {}: {}", to, e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendNewTourNotification(Long tourId, String tourName, String tourSlug) {
        try {
            List<Newsletter> activeSubscribers = newsletterRepository.findAll().stream()
                    .filter(Newsletter::getIsActive)
                    .toList();
            
            if (activeSubscribers.isEmpty()) {
                log.info("📧 No active subscribers to send new tour notification");
                return;
            }
            
            String tourUrl = FRONTEND_URL + "/tours/" + tourSlug;
            
            for (Newsletter subscriber : activeSubscribers) {
                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    
                    helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
                    helper.setTo(subscriber.getEmail());
                    helper.setSubject("🌏 Tour mới: " + tourName);
                    
                    String htmlContent = buildNewTourEmailTemplate(tourName, tourUrl, subscriber.getEmail());
                    helper.setText(htmlContent, true);
                    
                    mailSender.send(message);
                    log.debug("✅ New tour email sent to: {}", subscriber.getEmail());
                    
                } catch (Exception e) {
                    log.error("❌ Error sending new tour email to {}: {}", subscriber.getEmail(), e.getMessage());
                }
            }
            
            log.info("✅ Sent new tour notification to {} subscribers", activeSubscribers.size());
            
        } catch (Exception e) {
            log.error("❌ Error sending new tour notifications: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendPromotionNotification(String promotionCode, String promotionName, Integer discountPercent) {
        try {
            List<Newsletter> activeSubscribers = newsletterRepository.findAll().stream()
                    .filter(Newsletter::getIsActive)
                    .toList();
            
            if (activeSubscribers.isEmpty()) {
                log.info("📧 No active subscribers to send promotion notification");
                return;
            }
            
            for (Newsletter subscriber : activeSubscribers) {
                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    
                    helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
                    helper.setTo(subscriber.getEmail());
                    helper.setSubject("🎁 Mã giảm giá " + discountPercent + "% - " + promotionName);
                    
                    String htmlContent = buildPromotionEmailTemplate(promotionCode, promotionName, discountPercent, subscriber.getEmail());
                    helper.setText(htmlContent, true);
                    
                    mailSender.send(message);
                    log.debug("✅ Promotion email sent to: {}", subscriber.getEmail());
                    
                } catch (Exception e) {
                    log.error("❌ Error sending promotion email to {}: {}", subscriber.getEmail(), e.getMessage());
                }
            }
            
            log.info("✅ Sent promotion notification to {} subscribers", activeSubscribers.size());
            
        } catch (Exception e) {
            log.error("❌ Error sending promotion notifications: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendBookingConfirmation(String to, String bookingCode, String tourName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("✅ Xác nhận đặt tour - " + bookingCode);
            
            String htmlContent = buildBookingConfirmationTemplate(bookingCode, tourName);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Booking confirmation email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending booking confirmation to {}: {}", to, e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendPasswordResetEmail(backend.entity.User user, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject("🔒 Đặt lại mật khẩu - TourBooking");
            
            String resetUrl = FRONTEND_URL + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetTemplate(user.getName(), resetUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Password reset email sent to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Error sending password reset email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendVerificationEmail(backend.entity.User user, String verificationToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject("✉️ Xác thực email - TourBooking");
            
            String verifyUrl = FRONTEND_URL + "/verify-email?token=" + verificationToken;
            String htmlContent = buildVerificationEmailTemplate(user.getName(), verifyUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Verification email sent to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Error sending verification email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            mailSender.send(message);
            log.info("✅ Simple email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending simple email: {}", e.getMessage(), e);
        }
    }
    
    // ==================== EMAIL TEMPLATES ====================
    
    private String buildWelcomeEmailTemplate(String email) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Chào mừng đến với TourBooking!</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào!</h2>
                        <p>Cảm ơn bạn đã đăng ký nhận tin tức từ <strong>TourBooking.com</strong>!</p>
                        <p>Từ giờ bạn sẽ nhận được:</p>
                        <ul>
                            <li>🌍 Thông báo về các tour mới hấp dẫn</li>
                            <li>🎁 Mã giảm giá độc quyền</li>
                            <li>✨ Ưu đãi đặc biệt dành riêng cho thành viên</li>
                            <li>📰 Tin tức du lịch mới nhất</li>
                        </ul>
                        <p style="text-align: center;">
                            <a href="%s/tours" class="button">Khám phá tour ngay</a>
                        </p>
                        <p>Nếu bạn muốn hủy đăng ký, vui lòng <a href="%s/newsletter/unsubscribe?email=%s">click vào đây</a>.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com. Tất cả quyền được bảo lưu.</p>
                        <p>123 Đường ABC, Quận 1, TP.HCM | +84 (0) 123 456 789</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(FRONTEND_URL, FRONTEND_URL, email);
    }
    
    private String buildNewTourEmailTemplate(String tourName, String tourUrl, String email) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌏 Tour Mới Vừa Ra Mắt!</h1>
                    </div>
                    <div class="content">
                        <h2>%s</h2>
                        <p>Chúng tôi vui mừng thông báo về tour du lịch mới tuyệt vời!</p>
                        <p>Đừng bỏ lỡ cơ hội khám phá những trải nghiệm độc đáo cùng chúng tôi.</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Xem chi tiết tour</a>
                        </p>
                        <p><small>Số lượng chỗ có hạn, đặt ngay để được giá tốt nhất!</small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p><a href="%s/newsletter/unsubscribe?email=%s">Hủy đăng ký</a></p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(tourName, tourUrl, FRONTEND_URL, email);
    }
    
    private String buildPromotionEmailTemplate(String code, String name, Integer percent, String email) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .promo-code { background: #fff; border: 2px dashed #D4AF37; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #D4AF37; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎁 Mã Giảm Giá %d%%%% Dành Cho Bạn!</h1>
                    </div>
                    <div class="content">
                        <h2>%s</h2>
                        <p>Chúng tôi có món quà đặc biệt dành cho bạn!</p>
                        <div class="promo-code">
                            %s
                        </div>
                        <p>Sử dụng mã này để nhận <strong>giảm giá %d%%%%</strong> cho booking tiếp theo của bạn!</p>
                        <p style="text-align: center;">
                            <a href="%s/tours" class="button">Đặt tour ngay</a>
                        </p>
                        <p><small><em>* Áp dụng cho tất cả các tour. Có thể có điều kiện kèm theo.</em></small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p><a href="%s/newsletter/unsubscribe?email=%s">Hủy đăng ký</a></p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(percent, name, code, percent, FRONTEND_URL, FRONTEND_URL, email);
    }
    
    private String buildBookingConfirmationTemplate(String bookingCode, String tourName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #22c55e 0%%, #16a34a 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .booking-code { background: #fff; border: 2px solid #22c55e; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; color: #16a34a; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Đặt Tour Thành Công!</h1>
                    </div>
                    <div class="content">
                        <h2>Cảm ơn bạn đã tin tưởng TourBooking!</h2>
                        <p>Booking của bạn đã được xác nhận thành công.</p>
                        <div class="booking-code">
                            Mã booking: %s
                        </div>
                        <p><strong>Tour:</strong> %s</p>
                        <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận chi tiết.</p>
                        <p style="text-align: center;">
                            <a href="%s/bookings" class="button">Xem chi tiết booking</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p>Hotline: +84 (0) 123 456 789</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(bookingCode, tourName, FRONTEND_URL);
    }
    
    private String buildPasswordResetTemplate(String userName, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔒 Đặt Lại Mật Khẩu</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                        <p>Click vào nút bên dưới để đặt lại mật khẩu:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Đặt lại mật khẩu</a>
                        </p>
                        <p><small>Link này sẽ hết hạn sau 24 giờ.</small></p>
                        <p><small><em>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</em></small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetUrl);
    }
    
    private String buildVerificationEmailTemplate(String userName, String verifyUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6 0%%, #2563eb 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Xác Thực Email</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Cảm ơn bạn đã đăng ký tài khoản TourBooking!</p>
                        <p>Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Xác thực email</a>
                        </p>
                        <p><small>Link này sẽ hết hạn sau 24 giờ.</small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, verifyUrl);
    }
    
    @Override
    @Async
    public void sendPointsEarnedEmail(backend.entity.User user, Integer points, String tourName, String transactionType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject("🎁 Bạn vừa nhận được " + points + " điểm thưởng!");
            
            String htmlContent = buildPointsEarnedTemplate(user.getName(), points, tourName, transactionType);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Points earned email sent to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Error sending points earned email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendLevelUpEmail(backend.entity.User user, String oldLevel, String newLevel, Integer totalPoints) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject("🎉 Chúc mừng! Bạn đã lên hạng " + newLevel);
            
            String htmlContent = buildLevelUpTemplate(user.getName(), oldLevel, newLevel, totalPoints);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Level up email sent to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Error sending level up email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async
    public void sendVoucherRedeemedEmail(backend.entity.User user, String voucherCode, Integer pointsUsed, double discountAmount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject("🎟️ Đổi điểm thành công - Mã: " + voucherCode);
            
            String htmlContent = buildVoucherRedeemedTemplate(user.getName(), voucherCode, pointsUsed, discountAmount);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Voucher redeemed email sent to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Error sending voucher redeemed email: {}", e.getMessage(), e);
        }
    }
    
    // Templates for new email types
    private String buildPointsEarnedTemplate(String userName, Integer points, String tourName, String transactionType) {
        String emoji = transactionType.equals("BOOKING") ? "🎫" : "🎁";
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .points-box { background: white; border: 2px solid #D4AF37; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
                    .points { font-size: 48px; font-weight: bold; color: #D4AF37; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s Điểm Thưởng Mới!</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Bạn vừa nhận được điểm thưởng từ: <strong>%s</strong></p>
                        <div class="points-box">
                            <div class="points">+%d</div>
                            <p>Điểm thưởng</p>
                        </div>
                        <p style="text-align: center;">
                            <a href="%s/loyalty" class="button">Xem điểm thưởng của tôi</a>
                        </p>
                        <p><small>Điểm thưởng có thể được sử dụng để đổi voucher giảm giá cho các booking tiếp theo!</small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(emoji, userName, tourName, points, FRONTEND_URL);
    }
    
    private String buildLevelUpTemplate(String userName, String oldLevel, String newLevel, Integer totalPoints) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%%, #7c3aed 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .level-box { background: white; border: 3px solid #8b5cf6; padding: 30px; margin: 20px 0; text-align: center; border-radius: 10px; }
                    .new-level { font-size: 42px; font-weight: bold; color: #8b5cf6; margin: 10px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Chúc Mừng Lên Hạng!</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Chúc mừng! Bạn đã lên hạng mới trong chương trình khách hàng thân thiết!</p>
                        <div class="level-box">
                            <div style="font-size: 24px; color: #666;">%s → </div>
                            <div class="new-level">%s</div>
                            <p style="font-size: 18px; color: #666; margin-top: 20px;">Tổng điểm: <strong>%d</strong></p>
                        </div>
                        <p>Với hạng mới, bạn sẽ nhận được nhiều ưu đãi hấp dẫn hơn!</p>
                        <p style="text-align: center;">
                            <a href="%s/loyalty" class="button">Khám phá quyền lợi</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, oldLevel, newLevel, totalPoints, FRONTEND_URL);
    }
    
    private String buildVoucherRedeemedTemplate(String userName, String voucherCode, Integer pointsUsed, double discountAmount) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .voucher-box { background: white; border: 2px dashed #10b981; padding: 30px; margin: 20px 0; text-align: center; border-radius: 10px; }
                    .voucher-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 2px; background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎟️ Đổi Điểm Thành Công!</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Bạn đã đổi <strong>%d điểm</strong> thành voucher giảm giá thành công!</p>
                        <div class="voucher-box">
                            <p style="font-size: 18px; margin: 10px 0;">Mã voucher của bạn:</p>
                            <div class="voucher-code">%s</div>
                            <p style="font-size: 16px; color: #10b981; font-weight: bold; margin: 15px 0;">Giảm: %,.0f VNĐ</p>
                        </div>
                        <p>Sử dụng mã này khi booking tour để được giảm giá!</p>
                        <p style="text-align: center;">
                            <a href="%s/tours" class="button">Khám phá tour ngay</a>
                        </p>
                        <p><small><em>Voucher có hiệu lực trong 30 ngày kể từ ngày đổi.</em></small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, pointsUsed, voucherCode, discountAmount, FRONTEND_URL);
    }
}
