package kr.co.darumtech.intra.dto.master;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupportRequest {
    @NotBlank(message = "지원유형명을 입력하세요.")
    private String suppname;
    private Boolean vacation = false;
}
