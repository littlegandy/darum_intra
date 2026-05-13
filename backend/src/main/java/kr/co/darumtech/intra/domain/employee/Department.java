package kr.co.darumtech.intra.domain.employee;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DEPARTMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DEPTNO")
    private Long deptno;

    @Column(name = "DEPT_NAME", nullable = false, length = 100)
    private String deptName;

    @Column(name = "DEPT_RANK")
    private Integer deptRank;
}
