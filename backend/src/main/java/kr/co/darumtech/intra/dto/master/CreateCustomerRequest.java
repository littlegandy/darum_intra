package kr.co.darumtech.intra.dto.master;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerRequest {
    @NotBlank(message = "고객명을 입력하세요.")
    private String custName;
    private String darumSales;
    private Boolean vacation = false;
    private String location;
}
