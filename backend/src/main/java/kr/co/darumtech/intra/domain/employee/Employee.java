package kr.co.darumtech.intra.domain.employee;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"password"})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EMPNO")
    private Long empno;

    @Column(name = "ID", unique = true, nullable = false, length = 50)
    private String id;

    @Column(name = "PW", nullable = false, length = 255)
    private String password;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "MAIL", length = 100)
    private String email;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPTNO")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "JOBNO")
    private Jobgrade jobgrade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTNO")
    private Position position;

    @Column(name = "ENTRY_DATE")
    private LocalDate entryDate;

    @Column(name = "LEAVE_DATE")
    private LocalDate leaveDate;

    @Column(name = "INTRA_VIEW")
    private Boolean intraView = true;

    @Column(name = "EMP_STATE")
    private Boolean empState = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERMISSION", length = 20, nullable = false)
    private Role permission = Role.ROLE_USER;
}
