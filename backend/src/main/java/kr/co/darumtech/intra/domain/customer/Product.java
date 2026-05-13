package kr.co.darumtech.intra.domain.customer;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PRODUCT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRODNO")
    private Long prodno;

    @Column(name = "PROD_NAME", nullable = false, length = 100)
    private String prodName;

    @Column(name = "PROD_STATE")
    private Boolean prodState = true;

    @Column(name = "VACATION")
    private Boolean vacation = false;
}
