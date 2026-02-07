package auth.dto;

import lombok.Data;

@Data
public class OtpLoginRequest {
    private String email;
    private String otp;
}
