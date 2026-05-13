package kr.co.darumtech.intra.domain.customer;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SUPPORT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Support {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUPPNO")
    private Long suppno;

    @Column(name = "SUPPNAME", nullable = false, length = 100)
    private String suppname;

    @Column(name = "VACATION")
    private Boolean vacation = false;
}
