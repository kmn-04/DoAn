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
    
    @Value("${spring.mail.username:khoi14112004@gmail.com}")
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
            log.info("🔄 Starting to send password reset email to: {}", user.getEmail());
            log.info("📧 From email: {}", fromEmail);
            log.info("🔗 App URL: {}", appUrl);
            
            String subject = String.format("[%s] Đặt lại mật khẩu", appName);
            
            String resetUrl = String.format("%s/reset-password/%s", appUrl, resetToken);
            log.info("🔗 Reset URL: {}", resetUrl);
            
            String body = buildPasswordResetHtml(user, resetUrl);
            
            sendHtmlEmail(user.getEmail(), subject, body);
            
            log.info("✅ Sent password reset email to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send password reset email to: {}", user.getEmail(), e);
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
    public void sendVerificationEmail(User user, String token) {
        try {
            String subject = String.format("🔐 [%s] Xác thực email của bạn", appName);
            
            String body = buildVerificationEmailHtml(user, token);
            
            sendHtmlEmail(user.getEmail(), subject, body);
            
            log.info("✅ Sent verification email to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send verification email", e);
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
            log.info("📧 Creating MimeMessage for: {}", to);
            log.info("📧 Subject: {}", subject);
            log.info("📧 From: {}", fromEmail);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            log.info("📧 Sending email...");
            mailSender.send(message);
            
            log.info("✅ Sent HTML email to: {}", to);
            
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to: {}", to, e);
            log.error("❌ Error details: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("❌ Root cause: {}", e.getCause().getMessage());
            }
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
    
    private String buildVerificationEmailHtml(User user, String token) {
        String verificationUrl = appUrl + "/auth/verify-email?token=" + token;
        
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2563eb; margin: 0;">🔐 Xác thực Email</h1>
                        </div>
                        
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>%s</strong>!</p>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e;">
                                ⚠️ <strong>Bạn cần xác thực email để sử dụng tài khoản.</strong>
                            </p>
                        </div>
                        
                        <p>Vui lòng nhấn vào nút bên dưới để xác thực email của bạn:</p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="%s" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                                ✅ Xác thực Email
                            </a>
                        </div>
                        
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                Hoặc copy link sau vào trình duyệt:<br/>
                                <a href="%s" style="color: #2563eb; word-break: break-all;">%s</a>
                            </p>
                        </div>
                        
                        <div style="background: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #991b1b;">
                                ⏰ <strong>Link xác thực có hiệu lực trong 24 giờ.</strong><br/>
                                Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;"/>
                        
                        <p style="font-size: 14px; color: #6b7280;">
                            Trân trọng,<br/>
                            <strong>%s Team</strong>
                        </p>
                    </div>
                </body>
                </html>
                """,
                user.getName(),
                appName,
                verificationUrl,
                verificationUrl,
                verificationUrl,
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
    
    // ================== Loyalty Email Methods ==================
    
    @Override
    @Async
    public void sendPointsEarnedEmail(User user, int points, String source, String description) {
        try {
            String subject = String.format("🎉 [%s] Bạn vừa nhận được %d điểm thưởng!", appName, points);
            String body = buildPointsEarnedHtml(user, points, source, description);
            sendHtmlEmail(user.getEmail(), subject, body);
            log.info("✅ Sent points earned email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send points earned email to: {}", user.getEmail(), e);
        }
    }
    
    @Override
    @Async
    public void sendLevelUpEmail(User user, String oldLevel, String newLevel, int pointsBalance) {
        try {
            String subject = String.format("🏆 [%s] Chúc mừng! Bạn đã lên hạng %s!", appName, newLevel);
            String body = buildLevelUpHtml(user, oldLevel, newLevel, pointsBalance);
            sendHtmlEmail(user.getEmail(), subject, body);
            log.info("✅ Sent level up email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send level up email to: {}", user.getEmail(), e);
        }
    }
    
    @Override
    @Async
    public void sendVoucherRedeemedEmail(User user, String voucherCode, int pointsCost, double voucherValue) {
        try {
            String subject = String.format("🎁 [%s] Bạn đã đổi voucher thành công!", appName);
            String body = buildVoucherRedeemedHtml(user, voucherCode, pointsCost, voucherValue);
            sendHtmlEmail(user.getEmail(), subject, body);
            log.info("✅ Sent voucher redeemed email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ Failed to send voucher redeemed email to: {}", user.getEmail(), e);
        }
    }
    
    // ================== Loyalty HTML Template Builders ==================
    
    private String buildPointsEarnedHtml(User user, int points, String source, String description) {
        String emoji = getSourceEmoji(source);
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; }
                    .points-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .points-number { font-size: 48px; font-weight: bold; color: #667eea; text-align: center; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s Điểm Thưởng Mới!</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Chúc mừng! Bạn vừa nhận được điểm thưởng từ %s:</p>
                        
                        <div class="points-box">
                            <div class="points-number">+%d điểm</div>
                            <p style="text-align: center; margin-top: 10px; color: #666;">%s</p>
                        </div>
                        
                        <p>💡 <strong>Mẹo:</strong> Tích lũy điểm để đổi voucher giảm giá và nâng cấp hạng thành viên!</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/loyalty" class="button">Xem Điểm Thưởng</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            emoji,
            user.getName(),
            getSourceName(source),
            points,
            description,
            appUrl,
            appName
        );
    }
    
    private String buildLevelUpHtml(User user, String oldLevel, String newLevel, int pointsBalance) {
        String newLevelEmoji = getLevelEmoji(newLevel);
        String benefits = getLevelBenefitsHtml(newLevel);
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                    .level-badge { font-size: 80px; margin: 20px 0; }
                    .content { background: #f8f9fa; padding: 30px; }
                    .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .benefit-item { padding: 10px; margin: 10px 0; background: #f0f7ff; border-left: 3px solid #4299e1; }
                    .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎊 Chúc Mừng Lên Hạng! 🎊</h1>
                        <div class="level-badge">%s</div>
                        <h2>%s</h2>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Thật tuyệt vời! Bạn đã được nâng cấp từ hạng <strong>%s</strong> lên <strong>%s</strong>!</p>
                        
                        <p>📊 Tổng điểm hiện tại: <strong>%d điểm</strong></p>
                        
                        <div class="benefits">
                            <h3>🎁 Quyền lợi của hạng %s:</h3>
                            %s
                        </div>
                        
                        <p>Tiếp tục tích điểm để mở khóa nhiều ưu đãi hơn nữa!</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/loyalty" class="button">Khám Phá Quyền Lợi</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            newLevelEmoji,
            newLevel,
            user.getName(),
            oldLevel,
            newLevel,
            pointsBalance,
            newLevel,
            benefits,
            appUrl,
            appName
        );
    }
    
    private String buildVoucherRedeemedHtml(User user, String voucherCode, int pointsCost, double voucherValue) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #a8edea 0%%, #fed6e3 100%%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; }
                    .voucher-box { background: white; border: 2px dashed #48bb78; padding: 25px; margin: 20px 0; border-radius: 10px; text-align: center; }
                    .voucher-code { font-size: 32px; font-weight: bold; color: #48bb78; letter-spacing: 2px; margin: 15px 0; padding: 15px; background: #f0fff4; border-radius: 5px; }
                    .voucher-value { font-size: 36px; font-weight: bold; color: #e53e3e; }
                    .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .button { display: inline-block; padding: 12px 30px; background: #48bb78; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎁 Voucher Của Bạn</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Bạn đã đổi thành công <strong>%d điểm</strong> lấy voucher giảm giá!</p>
                        
                        <div class="voucher-box">
                            <p>💰 Giá trị voucher</p>
                            <div class="voucher-value">%s</div>
                            <p style="margin-top: 20px;">🔑 Mã voucher</p>
                            <div class="voucher-code">%s</div>
                        </div>
                        
                        <div class="info-box">
                            <p><strong>📝 Hướng dẫn sử dụng:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Sao chép mã voucher bên trên</li>
                                <li>Nhập mã khi thanh toán booking</li>
                                <li>Giảm giá sẽ được áp dụng tự động</li>
                            </ul>
                            <p><strong>⚠️ Lưu ý:</strong> Voucher có thể có hạn sử dụng, vui lòng kiểm tra trong tài khoản.</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="%s/tours" class="button">Đặt Tour Ngay</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            user.getName(),
            pointsCost,
            CURRENCY_FORMATTER.format(voucherValue),
            voucherCode,
            appUrl,
            appName
        );
    }
    
    // Helper methods
    private String getSourceEmoji(String source) {
        return switch (source.toUpperCase()) {
            case "BOOKING" -> "✈️";
            case "REVIEW" -> "⭐";
            case "REFERRAL" -> "👥";
            case "BIRTHDAY" -> "🎂";
            case "PROMOTION" -> "🎉";
            default -> "🎁";
        };
    }
    
    private String getSourceName(String source) {
        return switch (source.toUpperCase()) {
            case "BOOKING" -> "đặt tour";
            case "REVIEW" -> "đánh giá tour";
            case "REFERRAL" -> "giới thiệu bạn bè";
            case "BIRTHDAY" -> "sinh nhật";
            case "PROMOTION" -> "chương trình khuyến mãi";
            default -> "hệ thống";
        };
    }
    
    private String getLevelEmoji(String level) {
        return switch (level.toUpperCase()) {
            case "DIAMOND" -> "💎";
            case "PLATINUM" -> "🏆";
            case "GOLD" -> "🥇";
            case "SILVER" -> "🥈";
            case "BRONZE" -> "🥉";
            default -> "⭐";
        };
    }
    
    private String getLevelBenefitsHtml(String level) {
        return switch (level.toUpperCase()) {
            case "SILVER" -> """
                <div class="benefit-item">💰 Giảm 5%% mọi booking</div>
                <div class="benefit-item">⚡ Ưu tiên xử lý booking</div>
                """;
            case "GOLD" -> """
                <div class="benefit-item">💰 Giảm 10%% mọi booking</div>
                <div class="benefit-item">⚡ Ưu tiên xử lý booking</div>
                <div class="benefit-item">⬆️ Nâng cấp miễn phí phòng & dịch vụ</div>
                """;
            case "PLATINUM" -> """
                <div class="benefit-item">💰 Giảm 15%% mọi booking</div>
                <div class="benefit-item">⚡ Ưu tiên xử lý booking</div>
                <div class="benefit-item">⬆️ Nâng cấp miễn phí phòng & dịch vụ</div>
                <div class="benefit-item">👤 Quản lý cá nhân hỗ trợ 24/7</div>
                """;
            case "DIAMOND" -> """
                <div class="benefit-item">💰 Giảm 20%% mọi booking</div>
                <div class="benefit-item">⚡ Ưu tiên xử lý booking</div>
                <div class="benefit-item">⬆️ Nâng cấp miễn phí phòng & dịch vụ</div>
                <div class="benefit-item">👤 Quản lý cá nhân hỗ trợ 24/7</div>
                <div class="benefit-item">🎉 Trải nghiệm sự kiện VIP độc quyền</div>
                """;
            default -> """
                <div class="benefit-item">💰 Giảm 2%% mọi booking</div>
                """;
        };
    }
}

