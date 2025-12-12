package auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class UserDto {
    private Long id;
    private String username;
    private String email;


}
