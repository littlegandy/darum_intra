package kr.co.darumtech.intra.repository;

import kr.co.darumtech.intra.domain.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * 직원 ID로 직원 조회 (로그인용)
     */
    Optional<Employee> findById(String id);

    /**
     * 직원 ID로 직원 조회 (부서 정보 포함, LAZY LOADING 회피)
     */
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department WHERE e.id = :id")
    Optional<Employee> findByIdWithDepartment(@Param("id") String id);

    /**
     * 직원 ID 존재 여부 확인
     */
    boolean existsById(String id);

    /**
     * 부서 번호로 직원 목록 조회
     */
    java.util.List<Employee> findByDepartment_Deptno(Long deptno);

    /**
     * 정렬된 직원 목록 조회 (부서코드, 직책코드, 입사일, 이름)
     */
    @Query("SELECT e FROM Employee e " +
            "LEFT JOIN FETCH e.department d " +
            "LEFT JOIN FETCH e.jobgrade j " +
            "LEFT JOIN FETCH e.position p " +
            "WHERE (:activeOnly IS NULL " +
            "OR (:activeOnly = true AND (e.empState IS NULL OR e.empState = true)) " +
            "OR (:activeOnly = false)) " +
            "ORDER BY d.deptno ASC, j.jobno ASC, e.entryDate ASC, e.name ASC")
    List<Employee> findAllSorted(@Param("activeOnly") Boolean activeOnly);
}
