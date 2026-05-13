package kr.co.darumtech.intra.service.schedule;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Service
@Slf4j
public class HolidayService {

    private static final String HOLIDAY_API = "https://date.nager.at/api/v3/PublicHolidays/%d/KR";
    private final RestTemplate restTemplate;
    private final ConcurrentMap<Integer, Set<LocalDate>> cache = new ConcurrentHashMap<>();

    public HolidayService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public boolean isHoliday(LocalDate date) {
        Set<LocalDate> holidays = cache.computeIfAbsent(date.getYear(), this::fetchHolidays);
        return holidays.contains(date);
    }

    private Set<LocalDate> fetchHolidays(int year) {
        String url = String.format(HOLIDAY_API, year);
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            List<Map<String, Object>> body = response.getBody();
            if (body == null) {
                return Set.of();
            }
            return body.stream()
                    .map(item -> (String) item.get("date"))
                    .filter(date -> date != null && !date.isBlank())
                    .map(LocalDate::parse)
                    .collect(Collectors.toSet());
        } catch (Exception ex) {
            log.warn("Failed to load holiday data for year {}", year, ex);
            return Set.of();
        }
    }
}
