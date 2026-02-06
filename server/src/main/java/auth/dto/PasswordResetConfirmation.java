package auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PasswordResetConfirmation {
    private String otp;
    private String newPassword;



}
