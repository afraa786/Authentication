package auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor


public class UserRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String confirmPassword;


}
