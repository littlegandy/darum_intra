package kr.co.darumtech.intra.dto.master;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJobgradeRequest {
    @NotBlank(message = "직급명을 입력하세요.")
    private String jobName;
}
