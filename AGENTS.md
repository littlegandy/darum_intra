# Repository Guidelines

이 문서는 Darumtech Intra V2에 기여할 때 필요한 최소한의 정보를 모았습니다. 각 변경은 목적·테스트 결과와 함께 남겨 주세요.

## 프로젝트 구조 & 모듈
- `backend/`: Spring Boot 3 (Java 17). 패키지: `config`, `domain`, `repository`, `service`, `controller`, `dto`, `security`, `exception`. 설정은 `src/main/resources`.
- `frontend/`: React 18 + TypeScript + Vite. 주요 경로: `src/pages`, `components`, `api`, `store`, `types`, `utils`, 진입점은 `main.tsx`.
- `database/`: DB2 관련 리소스 폴더. 덤프·비밀 값은 커밋 금지.
- 참고 문서: `PROJECT_OVERVIEW.md`, `SETUP_GUIDE.md`, 필요 시 `md_file/` 자료도 함께 업데이트.

## 빌드·테스트·개발 명령
- 백엔드: `cd backend && ./gradlew clean build`(전체 빌드), `./gradlew test`(JUnit), `./gradlew bootRun` 또는 `./start.sh`(dev 프로필 실행, 서버 포트는 `SERVER_PORT`로 오버라이드 가능). 실행 전 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JASYPT_ENCRYPTOR_PASSWORD`를 셸에 설정.
- 프론트엔드: `cd frontend && npm install`(최초 1회), `npm run dev -- --host --port 80` 또는 `./start.sh`(기본 80 포트), `npm run build`(타입체크+프로덕션 번들), `npm run lint`(ESLint).

## 코딩 스타일 & 네이밍
- Java: 4칸 들여쓰기, 클래스/인터페이스 `PascalCase`, 메서드·필드 `camelCase`. 생성자 주입 우선, DTO에는 Bean Validation 명시. 정렬·필터링은 DB 쿼리에서 처리하고 서비스는 얇게 유지.
- React/TypeScript: 함수형 컴포넌트와 훅 사용, Zustand 상태는 `store/`에, 폼은 `react-hook-form`. 파일은 컴포넌트 `PascalCase.tsx`, 유틸 `camelCase.ts`. API 호출은 `api/`, 타입은 `types/`에서 공유. PR 전 `npm run lint` 실행.

## 테스트 가이드
- 백엔드: 테스트는 `backend/src/test/java`. 슬라이스 테스트로 서비스/컨트롤러를 우선 검증하고, 인증·권한·정렬(부서/직급/날짜)·트랜잭션 경계를 커버. DB 의존 시 임베디드/테스트 컨테이너를 우선 고려.
- 프론트엔드: 현재 공식 테스트 스택 없음. 새 테스트 작성 시 페이지와 상태 흐름을 Vitest+Testing Library로 검증하고, DOM 셀렉터는 `data-testid`처럼 안정적인 값을 사용.

## 커밋 & PR
- 커밋 메시지: 명령형 한 줄(예: `Fix schedule startNo grouping`). 변경 단위는 작게, 프런트·백 혼합은 동일 기능일 때만.
- PR: 목적, 주요 변경점, 테스트 결과(명령 포함), 영향받는 API/DB 스키마를 명시. UI 변경은 스크린샷/GIF 첨부.

## 보안·설정 팁
- 비밀정보는 커밋 금지. 로컬 `.env`/셸 export 사용, 샘플 값은 `SETUP_GUIDE.md` 참고.
- Vite API 호출 주소는 `VITE_API_URL` 환경변수로 지정. Spring 민감 설정은 Jasypt로 암호화하여 주입. DB 접근·JWT 시크릿은 실행 시점에만 주입.
