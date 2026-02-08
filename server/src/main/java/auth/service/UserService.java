package auth.service;

import auth.dto.*;
import auth.entity.User;
import auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    // OTP validity: 5 minutes
    private static final long OTP_VALIDITY_SECONDS = 300;

    // ================= USER DETAILS =================
    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String email)
            throws org.springframework.security.core.userdetails.UsernameNotFoundException {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
    }

    // ================= REGISTER =================
    public void registerUser(UserRegistrationRequest request) {

        validateRegistration(request);

        String otp = generate4DigitOtp();

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(false)
                .otp(otp)
                .otpGeneratedAt(Instant.now())
                .build();

        userRepository.save(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                otp,
                "registration_otp.html"
        );
    }

    // ================= SEND EMAIL VERIFICATION OTP =================
    public void sendEmailVerificationOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isActive()) {
            throw new IllegalStateException("Email already verified");
        }

        String otp = generate4DigitOtp();
        user.setOtp(otp);
        user.setOtpGeneratedAt(Instant.now());

        userRepository.save(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                otp,
                "email_verification_otp.html"
        );
    }

    // ================= VERIFY EMAIL =================
    public void verifyEmail(OtpUpdateRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isActive()) {
            throw new IllegalStateException("Email already verified");
        }

        validateOtp(user, request.getOtp());

        user.setActive(true);
        user.setOtp(null);
        user.setOtpGeneratedAt(null);

        userRepository.save(user);
    }

    // ================= LOGIN =================
    public LoginResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("EMAIL_NOT_VERIFIED");
        }

        return buildLoginResponse(user);
    }

    // ================= PASSWORD RESET =================
    public void requestPasswordReset(PasswordResetRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        String otp = generate4DigitOtp();
        user.setResetToken(otp);
        user.setResetTokenExpiry(Instant.now().plusSeconds(600));

        userRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), otp);
    }

    public void resetPassword(PasswordResetConfirmation request) {

        User user = userRepository.findByResetToken(request.getOtp())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }

    // ================= JWT =================
    private LoginResponse buildLoginResponse(User user) {

        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    // ================= OTP VALIDATION =================
    private void validateOtp(User user, String requestOtp) {

        if (requestOtp == null || requestOtp.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP is required");
        }

        if (user.getOtp() == null || user.getOtpGeneratedAt() == null) {
            throw new IllegalStateException("No OTP found. Please request a new OTP.");
        }

        if (!requestOtp.trim().equals(user.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        if (user.getOtpGeneratedAt()
                .plusSeconds(OTP_VALIDITY_SECONDS)
                .isBefore(Instant.now())) {

            user.setOtp(null);
            user.setOtpGeneratedAt(null);
            userRepository.save(user);

            throw new IllegalArgumentException("OTP has expired");
        }
    }

    // ================= REGISTRATION VALIDATION =================
    private void validateRegistration(UserRegistrationRequest request) {

        if (request.getEmail() == null ||
                request.getUsername() == null ||
                request.getPassword() == null ||
                request.getConfirmPassword() == null) {
            throw new IllegalArgumentException("All fields required");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
    }

    // ================= OTP GENERATOR =================
    private String generate4DigitOtp() {
        return String.valueOf(new Random().nextInt(9000) + 1000);
    }

    // ================= RESEND OTP =================
    public void resendOtp(ResendOtpRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        String otp = generate4DigitOtp();
        user.setOtp(otp);
        user.setOtpGeneratedAt(Instant.now());

        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), otp, "registration_otp.html");
    }

    // ================= ADMIN / UTIL =================
    public List<UserDto> getAllUsers() {

        List<UserDto> dtos = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            dtos.add(UserDto.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .build());
        }
        return dtos;
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    public void updateUsernameByEmail(String email, UpdateUsernameRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        user.setUsername(request.getUsername());
        userRepository.save(user);
    }
}
