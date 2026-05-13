package kr.co.darumtech.intra.repository;

import kr.co.darumtech.intra.domain.customer.Support;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 지원유형 Repository
 */
@Repository
public interface SupportRepository extends JpaRepository<Support, Long> {
}
