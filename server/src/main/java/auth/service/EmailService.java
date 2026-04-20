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
            throw new RuntimeException("Failed to send email to " + to + ": " + e.getMessage(), e);
        }
    }

    public void sendOtpEmail(String to, String otp, String template) {
        String body = "Your OTP is: <b>" + otp + "</b><br>Valid for 5 minutes.";
        sendVerificationEmail(to, "Your Verification Code", body);
    }

    public void sendPasswordResetEmail(String to, String otp) {
        String body = "Your password reset code is: <b>" + otp + "</b><br>Valid for 10 minutes.";
        sendVerificationEmail(to, "Password Reset Code", body);
    }
}
