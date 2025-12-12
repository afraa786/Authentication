package auth.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender emailSender;

    public void sendVerificationEmail(String to, String subject, String text) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);

            emailSender.send(message);
        } catch (Exception e) {
            // swallow or log in real app
        }
    }

    public void sendOtpEmail(String to, String otp, String template) {
        // minimal implementation: send a simple text message
        String body = (otp == null) ? "" : "Your OTP is: " + otp;
        sendVerificationEmail(to, "OTP Notification", body);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String body = "To reset your password use this token: " + token;
        sendVerificationEmail(to, "Password Reset", body);
    }
}