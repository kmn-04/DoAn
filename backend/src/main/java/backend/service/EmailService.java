package backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            System.out.println("🔄 Bắt đầu gửi email xác minh...");
            System.out.println("📧 From: " + fromEmail);
            System.out.println("📨 To: " + toEmail);
            System.out.println("🔢 Code: " + verificationCode);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác minh email - Travel Booking");

            String htmlContent = buildVerificationEmailContent(verificationCode);
            helper.setText(htmlContent, true);

            System.out.println("📤 Đang gửi email...");
            mailSender.send(message);
            System.out.println("✅ Email xác minh đã được gửi thành công tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email xác minh: " + e.getMessage(), e);
        }
    }

    private String buildVerificationEmailContent(String verificationCode) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<title>Xác minh email</title>" +
                "<style>" +
                    "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }" +
                    ".container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
                    ".header { text-align: center; margin-bottom: 30px; }" +
                    ".logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }" +
                    ".title { color: #333; font-size: 22px; margin-bottom: 10px; }" +
                    ".subtitle { color: #666; font-size: 16px; line-height: 1.5; }" +
                    ".code-container { background-color: #f8fafc; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; }" +
                    ".code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; }" +
                    ".code-label { color: #666; font-size: 14px; margin-bottom: 10px; }" +
                    ".instructions { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }" +
                    ".warning { color: #dc2626; font-size: 14px; margin-top: 20px; }" +
                    ".footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }" +
                "</style>" +
            "</head>" +
            "<body>" +
                "<div class=\"container\">" +
                    "<div class=\"header\">" +
                        "<div class=\"logo\">🌍 Travel Booking</div>" +
                        "<h1 class=\"title\">Xác minh địa chỉ email của bạn</h1>" +
                        "<p class=\"subtitle\">Chúng tôi cần xác minh email này thuộc về bạn để hoàn tất quá trình đăng ký.</p>" +
                    "</div>" +
                    
                    "<div class=\"code-container\">" +
                        "<div class=\"code-label\">Mã xác minh của bạn:</div>" +
                        "<div class=\"code\">" + verificationCode + "</div>" +
                    "</div>" +
                    
                    "<div class=\"instructions\">" +
                        "<strong>Hướng dẫn:</strong><br>" +
                        "1. Quay lại trang đăng ký<br>" +
                        "2. Nhập mã xác minh này vào ô được yêu cầu<br>" +
                        "3. Nhấn \"Xác minh\" để hoàn tất đăng ký" +
                    "</div>" +
                    
                    "<p class=\"warning\">" +
                        "⚠️ <strong>Lưu ý quan trọng:</strong><br>" +
                        "• Mã này có hiệu lực trong 15 phút<br>" +
                        "• Không chia sẻ mã này với ai khác<br>" +
                        "• Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email" +
                    "</p>" +
                    
                    "<div class=\"footer\">" +
                        "<p>Email này được gửi tự động, vui lòng không trả lời.</p>" +
                        "<p>&copy; 2024 Travel Booking. Tất cả quyền được bảo lưu.</p>" +
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";
    }
}
