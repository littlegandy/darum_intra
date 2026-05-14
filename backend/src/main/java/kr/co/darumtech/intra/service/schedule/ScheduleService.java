package kr.co.darumtech.intra.service.schedule;

import kr.co.darumtech.intra.domain.customer.Customer;
import kr.co.darumtech.intra.domain.customer.Product;
import kr.co.darumtech.intra.domain.customer.Support;
import kr.co.darumtech.intra.domain.employee.Employee;
import kr.co.darumtech.intra.domain.schedule.Schedule;
import kr.co.darumtech.intra.dto.schedule.CreateScheduleRequest;
import kr.co.darumtech.intra.dto.schedule.ScheduleDto;
import kr.co.darumtech.intra.dto.schedule.UpdateScheduleRequest;
import kr.co.darumtech.intra.repository.CustomerRepository;
import kr.co.darumtech.intra.repository.EmployeeRepository;
import kr.co.darumtech.intra.repository.ProductRepository;
import kr.co.darumtech.intra.repository.SupportRepository;
import kr.co.darumtech.intra.repository.schedule.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ?ㅼ?以?愿由??쒕퉬?? */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SupportRepository supportRepository;
    private final HolidayService holidayService;

    /**
     * ???ㅼ?以?議고쉶 (湲곌컙蹂?
     */
    public List<ScheduleDto> getMySchedules(String userId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findByIdWithDepartment(userId)
                .orElseThrow(() -> new IllegalArgumentException("吏곸썝??李얠쓣 ???놁뒿?덈떎: " + userId));

        List<Schedule> schedules = scheduleRepository.findByEmployeeAndDateRange(
                employee.getEmpno(), startDate, endDate
        );

        return schedules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * ?뱀젙 吏곸썝???ㅼ?以?議고쉶 (湲곌컙蹂?
     */
    public List<ScheduleDto> getEmployeeSchedules(Long empno, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(empno)
                .orElseThrow(() -> new IllegalArgumentException("吏곸썝??李얠쓣 ???놁뒿?덈떎: " + empno));

        List<Schedule> schedules = scheduleRepository.findByEmployeeAndDateRange(
                empno, startDate, endDate
        );

        return schedules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 遺?쒕퀎 ?ㅼ?以?議고쉶 (?뱀젙 ?좎쭨)
     */
    public List<ScheduleDto> getDepartmentSchedulesByDate(Long deptno, LocalDate workDate) {
        List<Schedule> schedules = scheduleRepository.findByDepartmentAndDate(deptno, workDate);

        return schedules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 遺?쒕퀎 ?ㅼ?以?議고쉶 (湲곌컙蹂?
     */
    public List<ScheduleDto> getDepartmentSchedulesByDateRange(Long deptno, LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules = scheduleRepository.findByDepartmentAndDateRange(deptno, startDate, endDate);

        return schedules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 怨좉컼?щ퀎 ?ㅼ?以?議고쉶 (湲곌컙蹂?
     */
    public List<ScheduleDto> getCustomerSchedules(Long custno, LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules = scheduleRepository.findByCustomerAndDateRange(custno, startDate, endDate);

        return schedules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * ?꾩껜 ?ㅼ?以?議고쉶 (湲곌컙蹂?
     */
    public List<ScheduleDto> getAllSchedules(LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules = scheduleRepository.findByDateRange(startDate, endDate);

        return schedules.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * ?ㅼ?以??곸꽭 議고쉶
     */
    public ScheduleDto getSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("?ㅼ?以꾩쓣 李얠쓣 ???놁뒿?덈떎: " + scheduleId));

        return convertToDto(schedule);
    }

    /**
     * ?ㅼ?以??앹꽦
     */
    @Transactional
    public ScheduleDto createSchedule(CreateScheduleRequest request, String requesterId, boolean isAdmin) {
        Employee employee = employeeRepository.findById(request.getEmpno())
                .orElseThrow(() -> new IllegalArgumentException("吏곸썝??李얠쓣 ???놁뒿?덈떎: " + request.getEmpno()));

        assertSameEmployeeOrAdmin(employee.getEmpno(), requesterId, isAdmin);

        List<LocalDate> targetDates;
        
        // dates 필드가 있으면 우선 사용
        if (request.getDates() != null && !request.getDates().isEmpty()) {
            targetDates = request.getDates();
            log.info("개별 날짜 선택 방식 사용: dates={}", targetDates);
        } else {
            // 기존 범위 방식
            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();
            if (startDate == null || endDate == null) {
                throw new IllegalArgumentException("?쒖옉?쇨낵 醫낅즺?쇱쓣 紐⑤몢 ?낅젰?댁빞 ?⑸땲??");
            }
            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("醫낅즺?쇱? ?쒖옉???댄썑?ъ빞 ?⑸땲??");
            }
            
            // 범위 내 날짜 생성 (휴일 필터링 적용)
            targetDates = new ArrayList<>();
            boolean includeHoliday = Boolean.TRUE.equals(request.getHoliday());
            LocalDate cursor = startDate;
            while (!cursor.isAfter(endDate)) {
                boolean isHoliday = isWeekend(cursor) || holidayService.isHoliday(cursor);
                if (includeHoliday || !isHoliday) {
                    targetDates.add(cursor);
                }
                cursor = cursor.plusDays(1);
            }
            log.info("범위 선택 방식 사용: startDate={}, endDate={}, includeHoliday={}, count={}", 
                    startDate, endDate, includeHoliday, targetDates.size());
        }

        if (targetDates.isEmpty()) {
            throw new IllegalArgumentException("생성할 일정이 없습니다.");
        }

        List<Schedule> schedulesToSave = new ArrayList<>();
        for (LocalDate date : targetDates) {
            boolean isHoliday = isWeekend(date) || holidayService.isHoliday(date);
            
            Schedule schedule = new Schedule();
            schedule.setEmployee(employee);
            schedule.setWorkDate(date);
            schedule.setContents(request.getContents());
            schedule.setLocation(request.getLocation());
            schedule.setStime(request.getStime());
            schedule.setRtime(request.getRtime());
            schedule.setEtime(request.getEtime());
            schedule.setStartNo(request.getStartNo() != null ? request.getStartNo() : 0L);
            schedule.setHoliday(isHoliday);

            // ?좏깮???곌?愿怨??ㅼ젙
            if (request.getCustno() != null) {
                Customer customer = customerRepository.findById(request.getCustno())
                        .orElseThrow(() -> new IllegalArgumentException("怨좉컼?щ? 李얠쓣 ???놁뒿?덈떎: " + request.getCustno()));
                schedule.setCustomer(customer);
            }

            if (request.getProdno() != null) {
                Product product = productRepository.findById(request.getProdno())
                        .orElseThrow(() -> new IllegalArgumentException("?쒗뭹??李얠쓣 ???놁뒿?덈떎: " + request.getProdno()));
                schedule.setProduct(product);
            }

            if (request.getSuppno() != null) {
                Support support = supportRepository.findById(request.getSuppno())
                        .orElseThrow(() -> new IllegalArgumentException("吏?먯쑀?뺤쓣 李얠쓣 ???놁뒿?덈떎: " + request.getSuppno()));
                schedule.setSupport(support);
            }

            applyScheduleDefaults(schedule);
            schedulesToSave.add(schedule);
        }

        // 癒쇱? ?섎굹瑜???ν빐 startNo 湲곕컲 ???뺣낫
        Schedule first = schedulesToSave.remove(0);
        Schedule savedFirst = scheduleRepository.save(first);
        Long startNo = savedFirst.getNo();

        savedFirst.setStartNo(startNo);
        List<Schedule> remaining = schedulesToSave.stream()
                .peek(s -> s.setStartNo(startNo))
                .toList();

        List<Schedule> savedRemaining = remaining.isEmpty() ? List.of() : scheduleRepository.saveAll(remaining);
        scheduleRepository.save(savedFirst); // startNo ?낅뜲?댄듃 諛섏쁺

        log.info("?ㅼ?以??앹꽦 ?꾨즺: count={}, startNo={}, empno={}, dates={}", 
                1 + savedRemaining.size(), startNo, employee.getEmpno(), targetDates);

        return convertToDto(savedFirst);
    }

    /**
     * ?ㅼ?以??섏젙
     */
    @Transactional
    public ScheduleDto updateSchedule(Long scheduleId, UpdateScheduleRequest request, String requesterId, boolean isAdmin) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("?ㅼ?以꾩쓣 李얠쓣 ???놁뒿?덈떎: " + scheduleId));

        assertSameEmployeeOrAdmin(schedule.getEmployee().getEmpno(), requesterId, isAdmin);

        boolean applyGroup = Boolean.TRUE.equals(request.getApplyGroup());
        Long targetStartNo = schedule.getStartNo() != 0 ? schedule.getStartNo() : schedule.getNo();

        List<Schedule> targets = applyGroup && targetStartNo != null
                ? scheduleRepository.findByStartNo(targetStartNo)
                : List.of(schedule);

        for (Schedule s : targets) {
            // 湲곕낯 ?꾨뱶 ?낅뜲?댄듃
            LocalDate newDate = request.getStartDate() != null ? request.getStartDate() : request.getEndDate();
            if (newDate != null) {
                s.setWorkDate(newDate);
            }
            if (request.getContents() != null) {
                s.setContents(request.getContents());
            }
            if (request.getLocation() != null) {
                s.setLocation(request.getLocation());
            }
            if (request.getStime() != null) {
                s.setStime(request.getStime());
            }
            if (request.getRtime() != null) {
                s.setRtime(request.getRtime());
            }
            if (request.getEtime() != null) {
                s.setEtime(request.getEtime());
            }
            if (request.getHoliday() != null) {
                s.setHoliday(request.getHoliday());
            }

            // ?좏깮???곌?愿怨??낅뜲?댄듃
            if (request.getCustno() != null) {
                Customer customer = customerRepository.findById(request.getCustno())
                        .orElseThrow(() -> new IllegalArgumentException("怨좉컼?щ? 李얠쓣 ???놁뒿?덈떎: " + request.getCustno()));
                s.setCustomer(customer);
            }

            if (request.getProdno() != null) {
                Product product = productRepository.findById(request.getProdno())
                        .orElseThrow(() -> new IllegalArgumentException("?쒗뭹??李얠쓣 ???놁뒿?덈떎: " + request.getProdno()));
                s.setProduct(product);
            }

            if (request.getSuppno() != null) {
                Support support = supportRepository.findById(request.getSuppno())
                        .orElseThrow(() -> new IllegalArgumentException("吏?먯쑀?뺤쓣 李얠쓣 ???놁뒿?덈떎: " + request.getSuppno()));
                s.setSupport(support);
            }
        }

        List<Schedule> updated = scheduleRepository.saveAll(targets);
        log.info("?ㅼ?以??섏젙 ?꾨즺: count={}, startNo={}", updated.size(), targetStartNo);

        return convertToDto(updated.get(0));
    }

    /**
     * ?ㅼ?以???젣
     */
    @Transactional
    public void deleteSchedule(Long scheduleId, String requesterId, boolean isAdmin, boolean deleteGroup) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("?ㅼ?以꾩쓣 李얠쓣 ???놁뒿?덈떎: " + scheduleId));

        assertSameEmployeeOrAdmin(schedule.getEmployee().getEmpno(), requesterId, isAdmin);

        if (deleteGroup && schedule.getStartNo() != 0) {
            List<Schedule> group = scheduleRepository.findByStartNo(schedule.getStartNo());
            scheduleRepository.deleteAll(group);
            log.info("臾띠쓬 ?ㅼ?以???젣 ?꾨즺: startNo={}, count={}", schedule.getStartNo(), group.size());
        } else {
            scheduleRepository.delete(schedule);
            log.info("?ㅼ?以???젣 ?꾨즺: scheduleId={}", scheduleId);
        }
    }

    /**
     * ?곗냽 ?ㅼ?以??앹꽦 (?쇨큵 ?앹꽦)
     */
    @Transactional
    public List<ScheduleDto> createBatchSchedules(List<CreateScheduleRequest> requests, String requesterId, boolean isAdmin) {
        Long requesterEmpno = getRequesterEmpno(requesterId, isAdmin);

        List<Schedule> schedules = requests.stream()
                .map(request -> {
                    Employee employee = employeeRepository.findById(request.getEmpno())
                            .orElseThrow(() -> new IllegalArgumentException("吏곸썝??李얠쓣 ???놁뒿?덈떎: " + request.getEmpno()));

                    if (!isAdmin && !employee.getEmpno().equals(requesterEmpno)) {
                        throw new AccessDeniedException("蹂몄씤 ?쇱젙留??쇨큵 ?앹꽦?????덉뒿?덈떎.");
                    }

                    LocalDate start = request.getStartDate();
                    LocalDate end = request.getEndDate();
                    if (start == null || end == null) {
                        throw new IllegalArgumentException("?쒖옉?쇨낵 醫낅즺?쇱쓣 紐⑤몢 ?낅젰?댁빞 ?⑸땲??");
                    }
                    if (end.isBefore(start)) {
                        throw new IllegalArgumentException("醫낅즺?쇱? ?쒖옉???댄썑?ъ빞 ?⑸땲??");
                    }

                    List<Schedule> items = new ArrayList<>();
                    boolean includeHoliday = Boolean.TRUE.equals(request.getHoliday());
                    LocalDate cursor = start;
                    while (!cursor.isAfter(end)) {
                        boolean isHoliday = isWeekend(cursor) || holidayService.isHoliday(cursor);
                        if (!includeHoliday && isHoliday) {
                            cursor = cursor.plusDays(1);
                            continue;
                        }
                        Schedule schedule = new Schedule();
                        schedule.setEmployee(employee);
                        schedule.setWorkDate(cursor);
                        schedule.setContents(request.getContents());
                        schedule.setLocation(request.getLocation());
                        schedule.setStime(request.getStime());
                        schedule.setRtime(request.getRtime());
                        schedule.setEtime(request.getEtime());
                        schedule.setStartNo(0L);
                        schedule.setHoliday(isHoliday);

                        // ?좏깮???곌?愿怨??ㅼ젙
                        if (request.getCustno() != null) {
                            customerRepository.findById(request.getCustno()).ifPresent(schedule::setCustomer);
                        }
                        if (request.getProdno() != null) {
                            productRepository.findById(request.getProdno()).ifPresent(schedule::setProduct);
                        }
                        if (request.getSuppno() != null) {
                            supportRepository.findById(request.getSuppno()).ifPresent(schedule::setSupport);
                        }
                        applyScheduleDefaults(schedule);
                        items.add(schedule);
                        cursor = cursor.plusDays(1);
                    }
                    return items;
                })
                .flatMap(List::stream)
                .collect(Collectors.toList());

        if (schedules.isEmpty()) {
            return List.of();
        }

        Schedule first = schedules.remove(0);
        Schedule savedFirst = scheduleRepository.save(first);
        Long startNo = savedFirst.getNo();

        savedFirst.setStartNo(startNo);
        schedules.forEach(s -> s.setStartNo(startNo));

        List<Schedule> savedRemaining = schedules.isEmpty() ? List.of() : scheduleRepository.saveAll(schedules);
        scheduleRepository.save(savedFirst);

        log.info("?곗냽 ?ㅼ?以??앹꽦 ?꾨즺: count={}, startNo={}", 1 + savedRemaining.size(), startNo);

        List<Schedule> allSaved = new ArrayList<>();
        allSaved.add(savedFirst);
        allSaved.addAll(savedRemaining);

        return allSaved.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private void applyScheduleDefaults(Schedule schedule) {
        if (schedule.getHoliday() == null) {
            schedule.setHoliday(false);
        }
        if (schedule.getStime() == null) {
            schedule.setStime(LocalTime.of(9, 30));
        }
        if (schedule.getEtime() == null) {
            schedule.setEtime(LocalTime.of(18, 0));
        }
        if (schedule.getRtime() == null) {
            schedule.setRtime(schedule.getEtime());
        }
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    /**
     * Entity瑜?DTO濡?蹂??     */
    private ScheduleDto convertToDto(Schedule schedule) {
        return ScheduleDto.builder()
                .no(schedule.getNo())
                .empno(schedule.getEmployee().getEmpno())
                .deptno(schedule.getEmployee().getDepartment() != null
                        ? schedule.getEmployee().getDepartment().getDeptno() : null)
                .employeeName(schedule.getEmployee().getName())
                .departmentName(schedule.getEmployee().getDepartment() != null
                        ? schedule.getEmployee().getDepartment().getDeptName() : null)
                .departmentRank(schedule.getEmployee().getDepartment() != null
                        ? schedule.getEmployee().getDepartment().getDeptRank() : null)
                .jobgradeName(schedule.getEmployee().getJobgrade() != null
                        ? schedule.getEmployee().getJobgrade().getJobName() : null)
                .custno(schedule.getCustomer() != null ? schedule.getCustomer().getCustno() : null)
                .customerName(schedule.getCustomer() != null ? schedule.getCustomer().getCustName() : null)
                .prodno(schedule.getProduct() != null ? schedule.getProduct().getProdno() : null)
                .productName(schedule.getProduct() != null ? schedule.getProduct().getProdName() : null)
                .suppno(schedule.getSupport() != null ? schedule.getSupport().getSuppno() : null)
                .supportName(schedule.getSupport() != null ? schedule.getSupport().getSuppname() : null)
                .contents(schedule.getContents())
                .location(schedule.getLocation())
                .workDate(schedule.getWorkDate())
                .stime(schedule.getStime())
                .rtime(schedule.getRtime())
                .etime(schedule.getEtime())
                .startNo(schedule.getStartNo())
                .holiday(schedule.getHoliday())
                .build();
    }

    private void assertSameEmployeeOrAdmin(Long targetEmpno, String requesterId, boolean isAdmin) {
        if (isAdmin) {
            return;
        }

        Long requesterEmpno = getRequesterEmpno(requesterId, false);
        if (!targetEmpno.equals(requesterEmpno)) {
            throw new AccessDeniedException("蹂몄씤 ?쇱젙留??섏젙/??젣?????덉뒿?덈떎.");
        }
    }

    private Long getRequesterEmpno(String requesterId, boolean isAdmin) {
        return employeeRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException(
                        isAdmin ? "?붿껌 ?ъ슜?먮? ?뺤씤?????놁뒿?덈떎." : "?ъ슜???뺣낫瑜?李얠쓣 ???놁뒿?덈떎.")
                )
                .getEmpno();
    }
}


