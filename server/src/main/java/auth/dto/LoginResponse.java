package auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private String username;



}
