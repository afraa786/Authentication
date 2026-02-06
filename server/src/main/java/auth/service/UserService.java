    package auth.service;

    import auth.dto.*;
    import auth.entity.User;
    import auth.service.EmailService;
    import auth.dto.OtpUpdateRequest;
    import auth.dto.UserRegistrationRequest;
    import auth.repository.UserRepository;
    import io.jsonwebtoken.Jwts;
    import io.jsonwebtoken.SignatureAlgorithm;
    import lombok.RequiredArgsConstructor;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;


    import java.time.Instant;
    import java.time.LocalDateTime;
    import java.time.ZoneId;
    import java.util.*;
    import java.util.concurrent.ConcurrentHashMap;

    @Service
    @RequiredArgsConstructor
    @Transactional
    public class UserService implements UserDetailsService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final EmailService emailService;

        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        }


        // In-memory token blacklist for logout (consider Redis for production)
        private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

        @Value("${app.auth.jwt.secret:very-secret-key-change-me}")
        private String jwtSecret;

        // JWT validity in milliseconds (e.g., 24 hours)
        @Value("${app.auth.jwt.expiration-ms:86400000}")
        private long jwtExpirationMs;

        // ---------------- REGISTER USER ----------------
        public void registerUser(UserRegistrationRequest request) {
            // basic validations
            if (request.getEmail() == null || request.getUsername() == null || request.getPassword() == null || request.getPassword() == null) {
                throw new IllegalArgumentException("All fields are required");
            }
            if (!request.getPassword().equals(request.getConfirmPassword()))
    {
                throw new IllegalArgumentException("Passwords do not match");
            }

            // uniqueness checks
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists");
            }
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }

            String otp = generate4DigitOtp();
            LocalDateTime now = LocalDateTime.now();

            User newUser = User.builder()
                    .email(request.getEmail())
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .active(false)
                    .otp(otp)
                    .otpGeneratedAt(now)
                    .build();

            userRepository.save(newUser);

            // send registration OTP email (template name handled in EmailService)
            emailService.sendOtpEmail(newUser.getEmail(), otp, "registration_otp.html");
        }

        // ---------------- VERIFY OTP / ACTIVATE (by userId or email) ----------------
        public void updateUserOtp(String userIdOrEmail, OtpUpdateRequest request) {
            if (request == null || request.getOtp() == null) {
                throw new IllegalArgumentException("OTP is required");
            }

            // Try to find user by ID first (if numeric), then by email
            User user = null;
            try {
                Long userId = Long.parseLong(userIdOrEmail);
                user = userRepository.findById(userId)
                        .orElse(null);
            } catch (NumberFormatException e) {
                // Not a number, treat as email
                user = userRepository.findByEmail(userIdOrEmail)
                        .orElse(null);
            }

            if (user == null) {
                throw new IllegalArgumentException("User not found");
            }

            if (user.isActive()) {
                throw new IllegalArgumentException("User already active");
            }

            if (user.getOtp() == null) {
                throw new IllegalArgumentException("No OTP set for user");
            }

            if (!request.getOtp().equals(user.getOtp())) {
                throw new IllegalArgumentException("Invalid OTP");
            }

            // Check expiry (10 minutes)
            if (user.getOtpGeneratedAt() == null || user.getOtpGeneratedAt().plusMinutes(10).isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("OTP expired");
            }

            user.setActive(true);
            user.setOtp(null);
            user.setOtpGeneratedAt(null);

            userRepository.save(user);

            // optionally send welcome email
            emailService.sendVerificationEmail(user.getEmail(), "Welcome", "Your account is now active.");
        }

        // ---------------- RESEND OTP ----------------
        public void resendOtp(ResendOtpRequest request) {
            if (request.getEmail() == null) {
                throw new IllegalArgumentException("Email required");
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (user.isActive()) {
                throw new IllegalArgumentException("User already active");
            }

            String newOtp = generate4DigitOtp();
            user.setOtp(newOtp);
            user.setOtpGeneratedAt(LocalDateTime.now());

            userRepository.save(user);

            emailService.sendOtpEmail(user.getEmail(), newOtp, "otp_resend.html");
        }

        // ---------------- GET ALL USERS ----------------
        public List<User> getAllUsers() {
            return userRepository.findAll();
        }

        // ---------------- LOGIN ----------------
        public LoginResponse loginUser(LoginRequest request) {
            if ((request.getEmail() == null || request.getEmail().isBlank()) || request.getPassword() == null) {
                throw new IllegalArgumentException("Email and password required");
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

            if (!user.isActive()) {
                throw new IllegalArgumentException("User not verified");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Invalid email or password");
            }

            String jwt = generateJwtToken(user);

            return LoginResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
        }

        // ---------------- LOGOUT ----------------
        public void logout(String jwtToken) {
            if (jwtToken == null || jwtToken.isBlank()) {
                throw new IllegalArgumentException("Token required");
            }
            // add to blacklist (simple in-memory). In production persist this with expiry (Redis)
            tokenBlacklist.add(jwtToken);
        }

        public boolean isTokenBlacklisted(String jwtToken) {
            return jwtToken == null || tokenBlacklist.contains(jwtToken);
        }

        // ---------------- PASSWORD RESET REQUEST (generate token) ----------------
        public void requestPasswordReset(PasswordResetRequest request) {
            if (request.getEmail() == null) {
                throw new IllegalArgumentException("Email required");
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Email not found"));

            // generate a 4-digit numeric OTP for password reset
            String otp = generate4DigitOtp();
            user.setResetToken(otp);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));

            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), otp);
        }

        // ---------------- PASSWORD RESET (verify token and set new password) ----------------
        public void resetPassword(PasswordResetConfirmation request) {
            if (request == null || request.getOtp() == null || request.getNewPassword() == null) {
                throw new IllegalArgumentException("OTP and new password required");
            }

            User user = userRepository.findByResetToken(request.getOtp())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

            if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Reset token expired");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);

            userRepository.save(user);

            // send success email
            emailService.sendVerificationEmail(user.getEmail(), "Password Reset Successful", "Your password has been reset.");
        }

        // ---------------- GET USER DATA ----------------
        public UserDto getUserData(Long userId) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            return new UserDto(user.getId(), user.getUsername(), user.getEmail());
        }

        // ---------------- UPDATE USERNAME ----------------
        public void updateUsername(Long userId, UpdateUsernameRequest request) {
            if (request.getUsername() == null || request.getUsername().isBlank()) {
                throw new IllegalArgumentException("Username required");
            }

            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already taken");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            user.setUsername(request.getUsername());
            userRepository.save(user);
        }

        // ---------------- DELETE USER ----------------
        public void deleteUser(Long userId) {
            if (!userRepository.existsById(userId)) {
                throw new IllegalArgumentException("User not found");
            }
            userRepository.deleteById(userId);
        }

        // ---------------- HELPERS ----------------

        private String generate4DigitOtp() {
            int otp = new Random().nextInt(9000) + 1000; // 1000..9999
            return String.valueOf(otp);
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

        // Optional helper to validate token (basic check)
        public Optional<Long> parseUserIdFromJwt(String token) {
            try {
            String subject = Jwts.parserBuilder()
                        .setSigningKey(jwtSecret.getBytes())
                        .build()
                        .parseClaimsJws(token)
                        .getBody()
                        .getSubject();

                return Optional.of(Long.parseLong(subject));
            } catch (Exception e) {
                return Optional.empty();
            }
        }

    }
