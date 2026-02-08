package auth.dto;

import lombok.Data;

@Data
public class OtpUpdateRequest {

    private String email;
    private String otp;
}
