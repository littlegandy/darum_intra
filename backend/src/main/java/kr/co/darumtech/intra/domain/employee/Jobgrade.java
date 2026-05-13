package kr.co.darumtech.intra.domain.employee;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "JOBGRADE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Jobgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JOBNO")
    private Long jobno;

    @Column(name = "JOB_NAME", nullable = false, length = 100)
    private String jobName;
}
