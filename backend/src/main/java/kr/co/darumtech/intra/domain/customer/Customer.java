package kr.co.darumtech.intra.domain.customer;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CUSTOMER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CUSTNO")
    private Long custno;

    @Column(name = "CUST_NAME", nullable = false, length = 100)
    private String custName;

    @Column(name = "DARUM_SALES", length = 100)
    private String darumSales;

    @Column(name = "VACATION")
    private Boolean vacation = false;

    @Column(name = "LOCATION", length = 200)
    private String location;
}
