package auth.controller;

import auth.dto.*;
import auth.entity.*;
import auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/authentication")
public class userController {

    private final UserService userService;

    // ------------------ Register User ------------------
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerUser(@RequestBody UserRegistrationRequest request) {
        userService.registerUser(request);
    }

    // ------------------ Get All Users ------------------
    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ------------------ Verify / Update OTP ------------------
    @PutMapping("/otp/{userIdOrEmail}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> updateUserOtp(@PathVariable String userIdOrEmail, @RequestBody OtpUpdateRequest request) {
        userService.updateUserOtp(userIdOrEmail, request);
        return Map.of("message", "Email verified successfully");
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse loginUser(@RequestBody LoginRequest request) {
        return userService.loginUser(request);
    }

    // ------------------ Delete User ------------------
    @DeleteMapping("/delete/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
    }

    // ------------------ Request Password Reset ------------------
    @PostMapping("/password-reset-request")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        userService.requestPasswordReset(request);
        return Map.of("message", "Password reset code sent to your email");
    }

    // ------------------ Reset Password ------------------
    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> resetPassword(@RequestBody PasswordResetConfirmation request) {
        userService.resetPassword(request);
        return Map.of("message", "Password reset successfully");
    }
}
