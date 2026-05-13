package kr.co.darumtech.intra.repository;

import kr.co.darumtech.intra.domain.customer.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 제품 Repository
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
