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

import java.math.BigDecimal;
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
    public void sendPromotionNotification(
            String promotionCode, 
            String promotionName, 
            String promotionType,
            BigDecimal discountValue,
            BigDecimal minOrderAmount,
            BigDecimal maxDiscount) {
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
                    
                    // Create subject based on promotion type
                    String subject;
                    if ("Percentage".equals(promotionType) && discountValue != null) {
                        subject = "🎁 Mã giảm giá " + discountValue.intValue() + "% - " + promotionName;
                    } else if ("Fixed".equals(promotionType) && discountValue != null) {
                        subject = "🎁 Giảm " + String.format("%,.0f", discountValue) + "đ - " + promotionName;
                    } else {
                        subject = "🎁 Khuyến mãi đặc biệt - " + promotionName;
                    }
                    helper.setSubject(subject);
                    
                    String htmlContent = buildPromotionEmailTemplate(
                        promotionCode, 
                        promotionName, 
                        promotionType,
                        discountValue,
                        minOrderAmount,
                        maxDiscount,
                        subscriber.getEmail()
                    );
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
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
    
    private String buildPromotionEmailTemplate(
            String code, 
            String name, 
            String type,
            BigDecimal value,
            BigDecimal minOrder,
            BigDecimal maxDiscount,
            String email) {
        
        // Build discount display text
        String discountTitle;
        String discountValue;
        String discountDescription;
        
        if ("Percentage".equals(type) && value != null) {
            discountTitle = value.intValue() + "%%";
            discountValue = "GIẢM " + value.intValue() + "%%";
            discountDescription = "giảm giá <strong>" + value.intValue() + "%%</strong>";
        } else if ("Fixed".equals(type) && value != null) {
            discountTitle = String.format("%,.0f", value) + "đ";
            discountValue = "GIẢM " + String.format("%,.0f", value) + "đ";
            discountDescription = "giảm <strong>" + String.format("%,.0f", value) + " VNĐ</strong>";
        } else {
            discountTitle = "ĐẶC BIỆT";
            discountValue = "ƯU ĐÃI ĐẶC BIỆT";
            discountDescription = "ưu đãi <strong>đặc biệt</strong>";
        }
        
        // Build conditions text
        StringBuilder conditions = new StringBuilder();
        conditions.append("<div style='text-align: left;'>");
        
        boolean hasConditions = false;
        if (minOrder != null && minOrder.compareTo(BigDecimal.ZERO) > 0) {
            conditions.append("<div style='display: flex; align-items: start; margin-bottom: 12px;'>")
                     .append("<span style='color: #D4AF37; margin-right: 12px; font-size: 18px;'>✓</span>")
                     .append("<span style='color: #334155;'>Áp dụng cho đơn hàng từ <strong style='color: #1e293b;'>")
                     .append(String.format("%,.0f", minOrder))
                     .append(" VNĐ</strong></span></div>");
            hasConditions = true;
        }
        
        if (maxDiscount != null && maxDiscount.compareTo(BigDecimal.ZERO) > 0 && "Percentage".equals(type)) {
            conditions.append("<div style='display: flex; align-items: start; margin-bottom: 12px;'>")
                     .append("<span style='color: #D4AF37; margin-right: 12px; font-size: 18px;'>✓</span>")
                     .append("<span style='color: #334155;'>Giảm tối đa <strong style='color: #1e293b;'>")
                     .append(String.format("%,.0f", maxDiscount))
                     .append(" VNĐ</strong></span></div>");
            hasConditions = true;
        }
        
        if (!hasConditions) {
            conditions.append("<div style='display: flex; align-items: start; margin-bottom: 12px;'>")
                     .append("<span style='color: #D4AF37; margin-right: 12px; font-size: 18px;'>✓</span>")
                     .append("<span style='color: #334155;'>Áp dụng cho tất cả các tour</span></div>");
        }
        
        conditions.append("<div style='display: flex; align-items: start;'>")
                 .append("<span style='color: #D4AF37; margin-right: 12px; font-size: 18px;'>✓</span>")
                 .append("<span style='color: #334155;'>Có thể kết hợp với các ưu đãi khác</span></div>")
                 .append("</div>");
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; 
                        line-height: 1.6; 
                        color: #1e293b; 
                        background: #f8fafc;
                    }
                    .email-wrapper { background: #f8fafc; padding: 40px 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    .header { 
                        background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); 
                        padding: 50px 30px; 
                        text-align: center; 
                        position: relative;
                        overflow: hidden;
                    }
                    .header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="%%23D4AF37" opacity="0.05"/></svg>');
                        opacity: 0.5;
                    }
                    .header h1 { 
                        color: white; 
                        font-size: 28px; 
                        font-weight: 300; 
                        letter-spacing: -0.5px; 
                        margin: 0;
                        position: relative;
                        z-index: 1;
                    }
                    .gold-accent { 
                        background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        font-weight: 600;
                    }
                    .content { padding: 40px 30px; }
                    .promo-name { 
                        color: #1e293b; 
                        font-size: 24px; 
                        font-weight: 600; 
                        margin-bottom: 20px; 
                        text-align: center;
                    }
                    .discount-badge { 
                        background: linear-gradient(135deg, #D4AF37 0%%, #C5A028 100%%); 
                        color: white; 
                        padding: 20px 40px; 
                        display: inline-block; 
                        font-size: 22px; 
                        font-weight: 700; 
                        letter-spacing: 2px; 
                        margin: 20px 0;
                        text-align: center;
                        width: 100%%;
                        box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.3);
                    }
                    .promo-code-section { 
                        text-align: center; 
                        margin: 40px 0; 
                        padding: 30px; 
                        background: linear-gradient(135deg, #f8fafc 0%%, #f1f5f9 100%%);
                        border-radius: 8px;
                    }
                    .promo-code-label {
                        color: #64748b;
                        font-size: 12px;
                        font-weight: 600;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        margin-bottom: 12px;
                    }
                    .promo-code { 
                        background: white; 
                        border: 3px dashed #D4AF37; 
                        padding: 20px; 
                        font-size: 36px; 
                        font-weight: 800; 
                        color: #1e293b; 
                        letter-spacing: 4px; 
                        border-radius: 8px;
                        user-select: all;
                    }
                    .info-box { 
                        background: #f8fafc; 
                        border-left: 4px solid #D4AF37; 
                        padding: 25px; 
                        margin: 30px 0; 
                        border-radius: 0 8px 8px 0;
                    }
                    .info-box h3 { 
                        color: #1e293b; 
                        font-size: 16px; 
                        font-weight: 600; 
                        margin-bottom: 15px;
                        letter-spacing: 0.5px;
                    }
                    .button { 
                        display: inline-block; 
                        padding: 18px 50px; 
                        background: linear-gradient(135deg, #1e293b 0%%, #0f172a 100%%); 
                        color: white; 
                        text-decoration: none; 
                        font-size: 14px; 
                        font-weight: 600; 
                        letter-spacing: 1.5px; 
                        text-transform: uppercase;
                        border-radius: 4px;
                        box-shadow: 0 10px 25px -5px rgba(30, 41, 59, 0.3);
                        transition: all 0.3s;
                    }
                    .button:hover { 
                        transform: translateY(-2px);
                        box-shadow: 0 15px 30px -5px rgba(30, 41, 59, 0.4);
                    }
                    .cta-section { 
                        text-align: center; 
                        margin: 40px 0; 
                        padding: 30px; 
                        background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%);
                        border-radius: 8px;
                    }
                    .cta-section p { 
                        color: #92400e; 
                        font-size: 14px; 
                        margin-bottom: 20px;
                        font-weight: 500;
                    }
                    .footer { 
                        background: #1e293b; 
                        color: #cbd5e1; 
                        text-align: center; 
                        padding: 30px; 
                        font-size: 13px; 
                    }
                    .footer a { 
                        color: #D4AF37; 
                        text-decoration: none; 
                    }
                    .footer a:hover { 
                        text-decoration: underline; 
                    }
                    .divider { 
                        height: 1px; 
                        background: linear-gradient(90deg, transparent 0%%, #e2e8f0 50%%, transparent 100%%); 
                        margin: 30px 0; 
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                <div class="container">
                    <div class="header">
                            <h1>🎁 <span class="gold-accent">MÃ GIẢM GIÁ %s</span> DÀNH CHO BẠN</h1>
                    </div>
                    <div class="content">
                            <div class="promo-name">%s</div>
                            <div class="discount-badge">%s</div>
                            
                            <p style="text-align: center; color: #64748b; font-size: 15px; margin: 25px 0;">
                                Chúng tôi xin gửi tặng bạn mã ưu đãi đặc biệt để sử dụng cho chuyến du lịch tiếp theo!
                            </p>
                            
                            <div class="promo-code-section">
                                <div class="promo-code-label">Mã khuyến mãi của bạn</div>
                                <div class="promo-code">%s</div>
                        </div>
                            
                            <p style="text-align: center; color: #475569; font-size: 15px; margin: 25px 0;">
                                Sử dụng mã này để nhận %s khi đặt tour!
                            </p>
                            
                            <div class="divider"></div>
                            
                            <div class="info-box">
                                <h3>📋 ĐIỀU KIỆN ÁP DỤNG</h3>
                                %s
                            </div>
                            
                            <div class="cta-section">
                                <p>⏰ Nhanh tay đặt tour để không bỏ lỡ ưu đãi này!</p>
                                <a href="%s/tours" class="button">Khám Phá Tour Ngay</a>
                            </div>
                    </div>
                    <div class="footer">
                            <p style="margin-bottom: 10px; font-size: 14px; color: white;">&copy; 2025 TourBooking.com</p>
                            <p style="margin-bottom: 15px;">Cảm ơn bạn đã tin tưởng và đồng hành cùng chúng tôi!</p>
                            <p>
                                <a href="%s/newsletter/unsubscribe?email=%s">Hủy đăng ký nhận email</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                discountTitle,    // Header title  
                name,             // Promotion name
                discountValue,    // Badge text
                code,             // Promo code
                discountDescription, // Description
                conditions.toString(), // Conditions list
                FRONTEND_URL,     // Button link
                FRONTEND_URL,     // Unsubscribe link
                email             // Email for unsubscribe
            );
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
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
    @Async("emailExecutor")
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
    
    // ==================== PRIORITY 1: BOOKING & CANCELLATION EMAILS ====================
    
    @Override
    @Async("emailExecutor")
    public void sendPaymentSuccessEmail(String to, String bookingCode, String tourName, String amount, String paymentMethod) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("✅ Thanh toán thành công - " + bookingCode);
            
            String htmlContent = buildPaymentSuccessTemplate(bookingCode, tourName, amount, paymentMethod);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Payment success email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending payment success email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async("emailExecutor")
    public void sendCancellationRequestEmail(String to, String bookingCode, String tourName, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("📝 Đã nhận yêu cầu hủy tour - " + bookingCode);
            
            String htmlContent = buildCancellationRequestTemplate(bookingCode, tourName, reason);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Cancellation request email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending cancellation request email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async("emailExecutor")
    public void sendCancellationApprovedEmail(String to, String bookingCode, String tourName, String refundAmount, String adminNotes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("✅ Yêu cầu hủy tour được chấp nhận - " + bookingCode);
            
            String htmlContent = buildCancellationApprovedTemplate(bookingCode, tourName, refundAmount, adminNotes);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Cancellation approved email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending cancellation approved email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async("emailExecutor")
    public void sendCancellationRejectedEmail(String to, String bookingCode, String tourName, String rejectionReason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("❌ Yêu cầu hủy tour bị từ chối - " + bookingCode);
            
            String htmlContent = buildCancellationRejectedTemplate(bookingCode, tourName, rejectionReason);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Cancellation rejected email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending cancellation rejected email: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Async("emailExecutor")
    public void sendRefundCompletedEmail(String to, String bookingCode, String tourName, String refundAmount, String transactionId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailUsername != null ? mailUsername : fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("💰 Hoàn tiền thành công - " + bookingCode);
            
            String htmlContent = buildRefundCompletedTemplate(bookingCode, tourName, refundAmount, transactionId);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("✅ Refund completed email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Error sending refund completed email: {}", e.getMessage(), e);
        }
    }
    
    // ==================== EMAIL TEMPLATES FOR PRIORITY 1 ====================
    
    private String buildPaymentSuccessTemplate(String bookingCode, String tourName, String amount, String paymentMethod) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-icon { font-size: 64px; margin-bottom: 20px; }
                    .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .info-label { font-weight: 600; color: #6b7280; }
                    .info-value { color: #111827; font-weight: 500; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">✅</div>
                        <h1>Thanh Toán Thành Công!</h1>
                    </div>
                    <div class="content">
                        <h2>Cảm ơn bạn đã thanh toán!</h2>
                        <p>Chúng tôi đã nhận được thanh toán của bạn. Booking của bạn đã được xác nhận.</p>
                        
                        <div class="info-box">
                            <div class="info-row">
                                <span class="info-label">Mã booking:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Tour:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Số tiền:</span>
                                <span class="info-value">%s VNĐ</span>
                            </div>
                            <div class="info-row" style="border-bottom: none;">
                                <span class="info-label">Phương thức:</span>
                                <span class="info-value">%s</span>
                            </div>
                        </div>
                        
                        <p><strong>Bước tiếp theo:</strong></p>
                        <ul>
                            <li>Chúng tôi sẽ gửi thông tin chi tiết về tour qua email</li>
                            <li>Vui lòng chuẩn bị giấy tờ cần thiết trước ngày khởi hành</li>
                            <li>Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
                        </ul>
                        
                        <p style="text-align: center;">
                            <a href="%s/bookings" class="button">Xem chi tiết booking</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p>Hotline: 1900-xxxx | Email: support@tourbooking.vn</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(bookingCode, tourName, amount, paymentMethod, FRONTEND_URL);
    }
    
    private String buildCancellationRequestTemplate(String bookingCode, String tourName, String reason) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                    .info-box { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📝 Đã Nhận Yêu Cầu Hủy Tour</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào,</h2>
                        <p>Chúng tôi đã nhận được yêu cầu hủy tour của bạn.</p>
                        
                        <div class="info-box">
                            <p><strong>Mã booking:</strong> %s</p>
                            <p><strong>Tour:</strong> %s</p>
                            <p><strong>Lý do hủy:</strong> %s</p>
                        </div>
                        
                        <div class="warning-box">
                            <p><strong>⏳ Thời gian xử lý:</strong> 24-48 giờ làm việc</p>
                            <p>Chúng tôi sẽ xem xét yêu cầu của bạn và thông báo kết quả sớm nhất.</p>
                        </div>
                        
                        <p><strong>Chính sách hoàn tiền:</strong></p>
                        <ul>
                            <li>Hủy trên 30 ngày: Hoàn 100%% (trừ phí xử lý)</li>
                            <li>Hủy trên 20 ngày: Hoàn 70%% (trừ phí xử lý)</li>
                            <li>Hủy trên 10 ngày: Hoàn 50%% (trừ phí xử lý)</li>
                            <li>Hủy dưới 10 ngày: Không hoàn tiền</li>
                        </ul>
                        
                        <p style="text-align: center;">
                            <a href="%s/bookings" class="button">Theo dõi yêu cầu</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p>Hotline: 1900-xxxx | Email: support@tourbooking.vn</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(bookingCode, tourName, reason, FRONTEND_URL);
    }
    
    private String buildCancellationApprovedTemplate(String bookingCode, String tourName, String refundAmount, String adminNotes) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
                    .refund-box { background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
                    .refund-amount { font-size: 32px; font-weight: bold; color: #059669; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Yêu Cầu Hủy Tour Được Chấp Nhận</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào,</h2>
                        <p>Yêu cầu hủy tour của bạn đã được phê duyệt.</p>
                        
                        <div class="success-box">
                            <p><strong>Mã booking:</strong> %s</p>
                            <p><strong>Tour:</strong> %s</p>
                        </div>
                        
                        <div class="refund-box">
                            <p style="margin: 0 0 10px 0; color: #6b7280;">Số tiền hoàn lại:</p>
                            <div class="refund-amount">%s VNĐ</div>
                        </div>
                        
                        %s
                        
                        <p><strong>Thời gian hoàn tiền:</strong> 7-10 ngày làm việc</p>
                        <p>Số tiền sẽ được hoàn về phương thức thanh toán ban đầu của bạn.</p>
                        
                        <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:</p>
                        <ul>
                            <li>Hotline: 1900-xxxx</li>
                            <li>Email: support@tourbooking.vn</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                bookingCode, 
                tourName, 
                refundAmount,
                adminNotes != null && !adminNotes.isEmpty() 
                    ? "<p><strong>Ghi chú từ admin:</strong> " + adminNotes + "</p>" 
                    : ""
            );
    }
    
    private String buildCancellationRejectedTemplate(String bookingCode, String tourName, String rejectionReason) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                    .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3b82f6 0%%, #2563eb 100%%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Yêu Cầu Hủy Tour Bị Từ Chối</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào,</h2>
                        <p>Rất tiếc, yêu cầu hủy tour của bạn không được chấp nhận.</p>
                        
                        <div class="error-box">
                            <p><strong>Mã booking:</strong> %s</p>
                            <p><strong>Tour:</strong> %s</p>
                            <p><strong>Lý do từ chối:</strong> %s</p>
                        </div>
                        
                        <p>Booking của bạn vẫn được giữ nguyên và tour sẽ diễn ra theo lịch trình.</p>
                        
                        <p><strong>Nếu bạn vẫn muốn hủy tour:</strong></p>
                        <ul>
                            <li>Vui lòng liên hệ trực tiếp với chúng tôi qua hotline: 1900-xxxx</li>
                            <li>Hoặc gửi email đến: support@tourbooking.vn</li>
                            <li>Chúng tôi sẽ hỗ trợ bạn tìm ra giải pháp phù hợp</li>
                        </ul>
                        
                        <p style="text-align: center;">
                            <a href="%s/bookings" class="button">Xem chi tiết booking</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p>Hotline: 1900-xxxx | Email: support@tourbooking.vn</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(bookingCode, tourName, rejectionReason, FRONTEND_URL);
    }
    
    private String buildRefundCompletedTemplate(String bookingCode, String tourName, String refundAmount, String transactionId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-icon { font-size: 64px; margin-bottom: 20px; }
                    .refund-box { background: #ecfdf5; padding: 25px; margin: 20px 0; border-radius: 10px; text-align: center; border: 2px solid #10b981; }
                    .refund-amount { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
                    .transaction-id { background: #f3f4f6; padding: 10px; margin: 20px 0; border-radius: 5px; font-family: monospace; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">💰</div>
                        <h1>Hoàn Tiền Thành Công!</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào,</h2>
                        <p>Chúng tôi đã hoàn tiền thành công cho booking của bạn.</p>
                        
                        <div class="refund-box">
                            <p style="margin: 0; color: #6b7280;">Số tiền đã hoàn:</p>
                            <div class="refund-amount">%s VNĐ</div>
                            <p style="margin: 10px 0 0 0; color: #6b7280;">Mã booking: <strong>%s</strong></p>
                            <p style="margin: 5px 0 0 0; color: #6b7280;">Tour: %s</p>
                        </div>
                        
                        <div class="transaction-id">
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">Mã giao dịch hoàn tiền:</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold;">%s</p>
                        </div>
                        
                        <p><strong>Thông tin quan trọng:</strong></p>
                        <ul>
                            <li>Số tiền sẽ được chuyển về tài khoản/thẻ của bạn trong 1-3 ngày làm việc</li>
                            <li>Vui lòng kiểm tra tài khoản của bạn</li>
                            <li>Nếu sau 3 ngày chưa nhận được tiền, vui lòng liên hệ với chúng tôi</li>
                        </ul>
                        
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của TourBooking. Chúng tôi hy vọng được phục vụ bạn trong tương lai!</p>
                        
                        <p>Liên hệ hỗ trợ:</p>
                        <ul>
                            <li>Hotline: 1900-xxxx</li>
                            <li>Email: support@tourbooking.vn</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 TourBooking.com</p>
                        <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi!</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(refundAmount, bookingCode, tourName, transactionId);
    }
}
