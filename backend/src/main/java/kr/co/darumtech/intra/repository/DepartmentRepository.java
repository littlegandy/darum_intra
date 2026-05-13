package kr.co.darumtech.intra.repository;

import kr.co.darumtech.intra.domain.employee.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    @Query("SELECT DISTINCT d FROM Department d JOIN Employee e ON e.department = d WHERE e.department IS NOT NULL AND (e.empState IS NULL OR e.empState = true) ORDER BY d.deptno ASC")
    List<Department> findActiveDepartments();
}
