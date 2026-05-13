package kr.co.darumtech.intra.domain.schedule;

import jakarta.persistence.*;
import kr.co.darumtech.intra.domain.customer.Customer;
import kr.co.darumtech.intra.domain.customer.Product;
import kr.co.darumtech.intra.domain.customer.Support;
import kr.co.darumtech.intra.domain.employee.Employee;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "SCHEDULE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NO")
    private Long no;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPNO", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUSTNO")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODNO")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SUPPNO")
    private Support support;

    @Column(name = "CONTENTS", length = 500)
    private String contents;

    @Column(name = "LOCATION", length = 200)
    private String location;

    @Column(name = "WORK_DATE", nullable = false)
    private LocalDate workDate;

    @Column(name = "STIME")
    private LocalTime stime;

    @Column(name = "RTIME")
    private LocalTime rtime;

    @Column(name = "ETIME")
    private LocalTime etime;

    @Column(name = "START_NO", nullable = false)
    private long startNo = 0L;

    @Column(name = "HOLIDAY")
    private Boolean holiday = false;

    @PrePersist
    @PreUpdate
    private void ensureDefaults() {
        // ensure non-null start number for DB constraint
        if (startNo == 0L && no != null) {
            startNo = no;
        }
        if (holiday == null) {
            holiday = false;
        }
    }
}
