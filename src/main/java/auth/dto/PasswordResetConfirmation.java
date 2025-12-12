package auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PasswordResetConfirmation {
    private String token;
    private String newPassword;



}
