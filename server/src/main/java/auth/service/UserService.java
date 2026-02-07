package auth.service;

import auth.dto.*;
import auth.entity.User;
import auth.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    private static final long OTP_VALIDITY_SECONDS = 600; // 10 minutes

    @Value("${app.auth.jwt.secret:very-secret-key-change-me}")
    private String jwtSecret;

    @Value("${app.auth.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
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

        emailService.sendOtpEmail(user.getEmail(), otp, "registration_otp.html");
    }

    // ================= LOGIN =================
    public LoginResponse loginUser(LoginRequest request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isActive()) {
            generateOtpIfMissing(user, "login_verification_otp.html");
            throw new IllegalStateException("OTP_REQUIRED");
        }

        return buildLoginResponse(user);
    }

    // ================= LOGIN WITH OTP =================
    public LoginResponse loginWithOtp(OtpLoginRequest request) {

        if (request.getEmail() == null || request.getOtp() == null) {
            throw new IllegalArgumentException("Email and OTP required");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isActive()) {
            throw new IllegalStateException("User already active");
        }

        validateOtp(user, request.getOtp());

        user.setActive(true);
        user.setOtp(null);
        user.setOtpGeneratedAt(null);
        userRepository.save(user);

        return buildLoginResponse(user);
    }

    // ================= OTP HELPERS =================
    private void generateOtpIfMissing(User user, String template) {

        if (user.getOtp() != null &&
            user.getOtpGeneratedAt() != null &&
            user.getOtpGeneratedAt()
                    .plusSeconds(OTP_VALIDITY_SECONDS)
                    .isAfter(Instant.now())) {

            // OTP already valid → do NOT regenerate
            return;
        }

        String otp = generate4DigitOtp();
        user.setOtp(otp);
        user.setOtpGeneratedAt(Instant.now());
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp, template);
    }

    private void validateOtp(User user, String requestOtp) {

        if (user.getOtp() == null || user.getOtpGeneratedAt() == null) {
            throw new IllegalArgumentException("OTP not found");
        }

        if (user.getOtpGeneratedAt()
                .plusSeconds(OTP_VALIDITY_SECONDS)
                .isBefore(Instant.now())) {
            throw new IllegalArgumentException("OTP expired");
        }

        if (!user.getOtp().equals(requestOtp.trim())) {
            throw new IllegalArgumentException("Invalid OTP");
        }
    }

    // ================= PASSWORD RESET =================
    public void requestPasswordReset(PasswordResetRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        String otp = generate4DigitOtp();
        user.setResetToken(otp);
        user.setResetTokenExpiry(Instant.now().plusSeconds(OTP_VALIDITY_SECONDS));
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

    // ================= HELPERS =================
    private LoginResponse buildLoginResponse(User user) {
        String jwt = generateJwtToken(user);
        return LoginResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    private void validateRegistration(UserRegistrationRequest request) {
        if (request.getEmail() == null ||
            request.getUsername() == null ||
            request.getPassword() == null ||
            request.getConfirmPassword() == null) {
            throw new IllegalArgumentException("All fields are required");
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

    private String generate4DigitOtp() {
        return String.valueOf(new Random().nextInt(9000) + 1000);
    }

    private String generateJwtToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("username", user.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                .compact();
    }
}
