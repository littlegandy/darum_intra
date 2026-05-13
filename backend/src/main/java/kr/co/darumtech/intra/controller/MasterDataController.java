package kr.co.darumtech.intra.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.darumtech.intra.domain.customer.Customer;
import kr.co.darumtech.intra.domain.customer.Product;
import kr.co.darumtech.intra.domain.customer.Support;
import kr.co.darumtech.intra.domain.employee.Department;
import kr.co.darumtech.intra.domain.employee.Jobgrade;
import kr.co.darumtech.intra.domain.employee.Position;
import kr.co.darumtech.intra.dto.ApiResponse;
import kr.co.darumtech.intra.dto.master.CreateCustomerRequest;
import kr.co.darumtech.intra.dto.master.CreateDepartmentRequest;
import kr.co.darumtech.intra.dto.master.CreateProductRequest;
import kr.co.darumtech.intra.dto.master.CreateSupportRequest;
import kr.co.darumtech.intra.dto.master.CreateJobgradeRequest;
import kr.co.darumtech.intra.dto.master.CreatePositionRequest;
import kr.co.darumtech.intra.dto.master.UpdateCustomerRequest;
import kr.co.darumtech.intra.dto.master.UpdateDepartmentRequest;
import kr.co.darumtech.intra.dto.master.UpdateJobgradeRequest;
import kr.co.darumtech.intra.dto.master.UpdatePositionRequest;
import kr.co.darumtech.intra.dto.master.UpdateProductRequest;
import kr.co.darumtech.intra.dto.master.UpdateSupportRequest;
import kr.co.darumtech.intra.repository.CustomerRepository;
import kr.co.darumtech.intra.repository.DepartmentRepository;
import kr.co.darumtech.intra.repository.ProductRepository;
import kr.co.darumtech.intra.repository.SupportRepository;
import kr.co.darumtech.intra.repository.JobgradeRepository;
import kr.co.darumtech.intra.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 마스터 데이터 REST API Controller
 * (부서, 고객사, 제품, 지원유형 등)
 */
@RestController
@RequestMapping("/api/v1/master")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Master Data", description = "마스터 데이터 API")
public class MasterDataController {

    private final DepartmentRepository departmentRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SupportRepository supportRepository;
    private final JobgradeRepository jobgradeRepository;
    private final PositionRepository positionRepository;

    /**
     * 부서 목록 조회
     */
    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "부서 목록 조회", description = "전체 부서 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(
                "부서 목록 조회 성공",
                departments
        ));
    }

    /**
     * 직원이 소속된 부서만 조회
     */
    @GetMapping("/departments/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "활성 부서 목록 조회", description = "직원이 소속된 부서만 조회합니다")
    public ResponseEntity<ApiResponse<List<Department>>> getActiveDepartments() {
        List<Department> departments = departmentRepository.findActiveDepartments();
        return ResponseEntity.ok(ApiResponse.success(
                "활성 부서 목록 조회 성공",
                departments
        ));
    }

    /**
     * 고객사 목록 조회
     */
    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "고객사 목록 조회", description = "전체 고객사 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<Customer>>> getCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(
                "고객사 목록 조회 성공",
                customers
        ));
    }

    /**
     * 제품 목록 조회
     */
    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "제품 목록 조회", description = "전체 제품 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<Product>>> getProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(
                "제품 목록 조회 성공",
                products
        ));
    }

    /**
     * 지원유형 목록 조회
     */
    @GetMapping("/supports")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "지원유형 목록 조회", description = "전체 지원유형 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<Support>>> getSupports() {
        List<Support> supports = supportRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(
                "지원유형 목록 조회 성공",
                supports
        ));
    }

    /**
     * 직급 목록 조회
     */
    @GetMapping("/jobgrades")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직급 목록 조회", description = "전체 직급 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<Jobgrade>>> getJobgrades() {
        List<Jobgrade> jobgrades = jobgradeRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("직급 목록 조회 성공", jobgrades));
    }

    /**
     * 직책 목록 조회
     */
    @GetMapping("/positions")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직책 목록 조회", description = "전체 직책 목록을 조회합니다")
    public ResponseEntity<ApiResponse<List<Position>>> getPositions() {
        List<Position> positions = positionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("직책 목록 조회 성공", positions));
    }

    /**
     * 부서 생성 (ADMIN)
     */
    @PostMapping("/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "부서 생성", description = "새 부서를 생성합니다")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        Department department = new Department();
        department.setDeptName(request.getDeptName());
        department.setDeptRank(request.getDeptRank());
        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success("부서 생성 성공", saved));
    }

    @PutMapping("/departments/{deptno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "부서 수정", description = "부서 정보를 수정합니다")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(@PathVariable Long deptno, @Valid @RequestBody UpdateDepartmentRequest request) {
        Department department = departmentRepository.findById(deptno)
                .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다."));
        department.setDeptName(request.getDeptName());
        department.setDeptRank(request.getDeptRank());
        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success("부서 수정 성공", saved));
    }

    @DeleteMapping("/departments/{deptno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "부서 삭제", description = "부서를 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long deptno) {
        departmentRepository.deleteById(deptno);
        return ResponseEntity.ok(ApiResponse.success("부서 삭제 성공", null));
    }

    /**
     * 고객사 생성 (ADMIN)
     */
    @PostMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "고객사 생성", description = "새 고객사를 생성합니다")
    public ResponseEntity<ApiResponse<Customer>> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        Customer customer = new Customer();
        customer.setCustName(request.getCustName());
        customer.setDarumSales(request.getDarumSales());
        customer.setVacation(request.getVacation());
        customer.setLocation(request.getLocation());
        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(ApiResponse.success("고객사 생성 성공", saved));
    }

    @PutMapping("/customers/{custno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "고객사 수정", description = "고객사 정보를 수정합니다")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(@PathVariable Long custno, @Valid @RequestBody UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(custno)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));
        customer.setCustName(request.getCustName());
        customer.setDarumSales(request.getDarumSales());
        customer.setVacation(request.getVacation());
        customer.setLocation(request.getLocation());
        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(ApiResponse.success("고객사 수정 성공", saved));
    }

    @DeleteMapping("/customers/{custno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "고객사 삭제", description = "고객사를 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long custno) {
        customerRepository.deleteById(custno);
        return ResponseEntity.ok(ApiResponse.success("고객사 삭제 성공", null));
    }

    /**
     * 제품 생성 (ADMIN)
     */
    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "제품 생성", description = "새 제품을 생성합니다")
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product product = new Product();
        product.setProdName(request.getProdName());
        product.setProdState(request.getProdState());
        product.setVacation(request.getVacation());
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(ApiResponse.success("제품 생성 성공", saved));
    }

    @PutMapping("/products/{prodno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "제품 수정", description = "제품 정보를 수정합니다")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Long prodno, @Valid @RequestBody UpdateProductRequest request) {
        Product product = productRepository.findById(prodno)
                .orElseThrow(() -> new IllegalArgumentException("제품을 찾을 수 없습니다."));
        product.setProdName(request.getProdName());
        product.setProdState(request.getProdState());
        product.setVacation(request.getVacation());
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(ApiResponse.success("제품 수정 성공", saved));
    }

    @DeleteMapping("/products/{prodno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "제품 삭제", description = "제품을 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long prodno) {
        productRepository.deleteById(prodno);
        return ResponseEntity.ok(ApiResponse.success("제품 삭제 성공", null));
    }

    /**
     * 지원유형 생성 (ADMIN)
     */
    @PostMapping("/supports")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "지원유형 생성", description = "새 지원유형을 생성합니다")
    public ResponseEntity<ApiResponse<Support>> createSupport(@Valid @RequestBody CreateSupportRequest request) {
        Support support = new Support();
        support.setSuppname(request.getSuppname());
        support.setVacation(request.getVacation());
        Support saved = supportRepository.save(support);
        return ResponseEntity.ok(ApiResponse.success("지원유형 생성 성공", saved));
    }

    @PutMapping("/supports/{suppno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "지원유형 수정", description = "지원유형 정보를 수정합니다")
    public ResponseEntity<ApiResponse<Support>> updateSupport(@PathVariable Long suppno, @Valid @RequestBody UpdateSupportRequest request) {
        Support support = supportRepository.findById(suppno)
                .orElseThrow(() -> new IllegalArgumentException("지원유형을 찾을 수 없습니다."));
        support.setSuppname(request.getSuppname());
        support.setVacation(request.getVacation());
        Support saved = supportRepository.save(support);
        return ResponseEntity.ok(ApiResponse.success("지원유형 수정 성공", saved));
    }

    @DeleteMapping("/supports/{suppno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "지원유형 삭제", description = "지원유형을 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteSupport(@PathVariable Long suppno) {
        supportRepository.deleteById(suppno);
        return ResponseEntity.ok(ApiResponse.success("지원유형 삭제 성공", null));
    }

    /**
     * 직급 생성/수정/삭제
     */
    @PostMapping("/jobgrades")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직급 생성", description = "새 직급을 생성합니다")
    public ResponseEntity<ApiResponse<Jobgrade>> createJobgrade(@Valid @RequestBody CreateJobgradeRequest request) {
        Jobgrade jobgrade = new Jobgrade();
        jobgrade.setJobName(request.getJobName());
        Jobgrade saved = jobgradeRepository.save(jobgrade);
        return ResponseEntity.ok(ApiResponse.success("직급 생성 성공", saved));
    }

    @PutMapping("/jobgrades/{jobno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직급 수정", description = "직급 정보를 수정합니다")
    public ResponseEntity<ApiResponse<Jobgrade>> updateJobgrade(@PathVariable Long jobno, @Valid @RequestBody UpdateJobgradeRequest request) {
        Jobgrade jobgrade = jobgradeRepository.findById(jobno)
                .orElseThrow(() -> new IllegalArgumentException("직급을 찾을 수 없습니다."));
        jobgrade.setJobName(request.getJobName());
        Jobgrade saved = jobgradeRepository.save(jobgrade);
        return ResponseEntity.ok(ApiResponse.success("직급 수정 성공", saved));
    }

    @DeleteMapping("/jobgrades/{jobno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직급 삭제", description = "직급을 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteJobgrade(@PathVariable Long jobno) {
        jobgradeRepository.deleteById(jobno);
        return ResponseEntity.ok(ApiResponse.success("직급 삭제 성공", null));
    }

    /**
     * 직책 생성/수정/삭제
     */
    @PostMapping("/positions")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직책 생성", description = "새 직책을 생성합니다")
    public ResponseEntity<ApiResponse<Position>> createPosition(@Valid @RequestBody CreatePositionRequest request) {
        Position position = new Position();
        position.setPostName(request.getPostName());
        Position saved = positionRepository.save(position);
        return ResponseEntity.ok(ApiResponse.success("직책 생성 성공", saved));
    }

    @PutMapping("/positions/{postno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직책 수정", description = "직책 정보를 수정합니다")
    public ResponseEntity<ApiResponse<Position>> updatePosition(@PathVariable Long postno, @Valid @RequestBody UpdatePositionRequest request) {
        Position position = positionRepository.findById(postno)
                .orElseThrow(() -> new IllegalArgumentException("직책을 찾을 수 없습니다."));
        position.setPostName(request.getPostName());
        Position saved = positionRepository.save(position);
        return ResponseEntity.ok(ApiResponse.success("직책 수정 성공", saved));
    }

    @DeleteMapping("/positions/{postno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "직책 삭제", description = "직책을 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deletePosition(@PathVariable Long postno) {
        positionRepository.deleteById(postno);
        return ResponseEntity.ok(ApiResponse.success("직책 삭제 성공", null));
    }
}
