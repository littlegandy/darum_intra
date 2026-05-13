# Darumtech Intra V2 - 프로젝트 개요

Darumtech Intra V2는 사내 일정/직원/마스터 데이터를 관리하는 웹 앱입니다. 백엔드는 Spring Boot 3 + JPA + JWT 기반의 REST API, 프론트엔드는 React 18 + TypeScript + Vite 기반 SPA로 구성됩니다. DB2를 사용하며, 권한(ROLE_USER/ROLE_ADMIN/ROLE_SUPERADMIN)에 따라 기능 접근이 분리됩니다.

## 핵심 기능
- 일정 관리: 등록/수정/삭제, 내 일정·부서별 일정·캘린더 조회
- 직원 관리: 등록/수정/조회, 부서/직급/직책 연동
- 마스터 관리: 부서/직급/직책/고객사/제품/지원유형 CRUD
- 권한 분리: 사용자/관리자/슈퍼관리자 역할 기반 접근 제어
- 다국어 UI: KR/EN 전환 지원

## 기술 스택
- Backend: Spring Boot 3, Java 17, Spring Security, JPA/QueryDSL, DB2, Gradle
- Frontend: React 18, TypeScript, Vite, Zustand, Tailwind CSS

## 프로젝트 구조
```
backend/
  src/main/java/kr/co/darumtech/intra/
    config/ controller/ domain/ dto/ exception/ repository/ security/ service/
  src/main/resources/application.yml

frontend/
  src/
    api/ components/ i18n/ pages/ store/ types/
    App.tsx main.tsx
```

## 주요 도메인 개요
- Employee: 사번/아이디/비밀번호, 부서/직급/직책, 재직 여부 등
- Schedule: 일정 내용/장소/시간, 고객사/제품/지원유형, 그룹(startNo) 일정
- Master: 부서, 직급, 직책, 고객사, 제품, 지원유형

## 일정 흐름(요약)
- 등록
  - 시작일/종료일 범위를 기준으로 일정 생성
  - “주말(휴일) 포함” 체크 여부에 따라 주말/공휴일 포함/제외
  - 다중 일자 등록 시 startNo로 그룹화
- 수정
  - 단일 일정 또는 그룹 일정 선택 가능
- 삭제
  - startNo 존재 시 그룹 삭제 옵션 사용

## 인증/인가
- JWT Access/Refresh 토큰 사용
- Spring Security 필터로 JWT 검증
- 권한에 따라 API 접근 제어
  - 직원/일정/마스터: USER 이상
  - 관리자 기능: ADMIN 이상

## API 요약
- 인증: `/api/v1/auth/*`
- 일정: `/api/v1/schedules/*`
- 직원: `/api/v1/employees/*`
- 마스터: `/api/v1/master/*`

## 환경 변수
백엔드 실행에 필요한 값은 외부 환경 변수로 주입합니다.
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`, `JASYPT_ENCRYPTOR_PASSWORD`

프론트엔드는 빌드 시점에 API 주소가 고정됩니다.
- `VITE_API_URL`

## 실행 요약
- Backend: `cd backend && ./gradlew bootRun`
- Frontend: `cd frontend && npm run dev`

자세한 실행/배포는 `SETUP_GUIDE.md` 참고.
