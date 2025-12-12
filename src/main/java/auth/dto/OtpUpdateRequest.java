package auth.dto;

import lombok.Data;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class OtpUpdateRequest {
    private String otp;


}
