package auth.controller;

import auth.dto.*;
import auth.entity.*;
import auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


import java.util.List;

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
    @PutMapping("/otp/{userId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void updateUserOtp(@PathVariable Long userId, @RequestBody OtpUpdateRequest request) {
        userService.updateUserOtp(userId, request);
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
    public void requestPasswordReset(@RequestBody PasswordResetRequest request) {
        userService.requestPasswordReset(request);
    }

    // ------------------ Reset Password ------------------
    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.OK)
    public void resetPassword(@RequestBody PasswordResetConfirmation request) {
        userService.resetPassword(request);
    }
}
