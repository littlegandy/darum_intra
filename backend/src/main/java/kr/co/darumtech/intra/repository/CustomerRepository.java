package kr.co.darumtech.intra.repository;

import kr.co.darumtech.intra.domain.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 고객사 Repository
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
