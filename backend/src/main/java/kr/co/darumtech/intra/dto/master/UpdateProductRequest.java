package kr.co.darumtech.intra.dto.master;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    @NotBlank(message = "제품명을 입력하세요.")
    private String prodName;
    private Boolean prodState = true;
    private Boolean vacation = false;
}
