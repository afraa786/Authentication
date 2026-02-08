package auth.controller;

import auth.dto.*;
import auth.service.JwtService;
import auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/authentication")
public class userController {

    private final UserService userService;
    private final JwtService jwtService;

    // ================= REGISTER =================
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(
            @RequestBody UserRegistrationRequest request) {

        userService.registerUser(request);

        return Map.of(
                "message",
                "Registration successful. Please verify the OTP sent to your email."
        );
    }

    // ================= VERIFY EMAIL =================
    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail(
            @RequestBody OtpUpdateRequest request) {

        userService.verifyEmail(request);

        return Map.of("message", "Email verified successfully. You can now login.");
    }

    // ================= SEND EMAIL VERIFICATION OTP =================
@PostMapping("/send-verification-otp")
public Map<String, String> sendVerificationOtp(
        @RequestBody PasswordResetRequest request) {

    userService.sendEmailVerificationOtp(request.getEmail());

    return Map.of("message", "OTP sent to your email for verification.");
}


    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {
            return ResponseEntity.ok(userService.loginUser(request));
        } catch (IllegalStateException ex) {

            if ("EMAIL_NOT_VERIFIED".equals(ex.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "error", "EMAIL_NOT_VERIFIED",
                                "message", "Please verify your email before logging in."
                        ));
            }

            throw ex;
        }
    }

    // ================= PASSWORD RESET REQUEST =================
    @PostMapping("/password-reset-request")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> requestPasswordReset(
            @RequestBody PasswordResetRequest request) {

        userService.requestPasswordReset(request);

        return Map.of("message", "Password reset OTP sent to your email.");
    }

    // ================= PASSWORD RESET =================
    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> resetPassword(
            @RequestBody PasswordResetConfirmation request) {

        userService.resetPassword(request);

        return Map.of("message", "Password reset successfully.");
    }

    // ================= RESEND OTP =================
    @PostMapping("/resend-otp")
    public Map<String, String> resendOtp(@RequestBody ResendOtpRequest request) {
        userService.resendOtp(request);
        return Map.of("message", "OTP resent successfully.");
    }

    // ================= ADMIN UTIL =================
    @GetMapping("/all")
    public java.util.List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/delete/{id}")
    public Map<String, String> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUserById(id);
        return Map.of("message", "User deleted.");
    }

    @PutMapping("/update-username")
    public Map<String, String> updateUsername(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody UpdateUsernameRequest request
    ) {
        String email = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                email = jwtService.extractUsername(token);
            } catch (Exception ex) {
                // ignore and let service throw if email null
            }
        }

        if (email == null) {
            throw new IllegalArgumentException("Missing or invalid token");
        }

        userService.updateUsernameByEmail(email, request);
        return Map.of("message", "Username updated successfully.");
    }
}
