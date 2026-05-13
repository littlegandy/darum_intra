package kr.co.darumtech.intra.repository;

import kr.co.darumtech.intra.domain.employee.Jobgrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobgradeRepository extends JpaRepository<Jobgrade, Long> {
}
