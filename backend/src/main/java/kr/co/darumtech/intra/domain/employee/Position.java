package kr.co.darumtech.intra.domain.employee;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "POSITION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POSTNO")
    private Long postno;

    @Column(name = "POST_NAME", nullable = false, length = 100)
    private String postName;
}
