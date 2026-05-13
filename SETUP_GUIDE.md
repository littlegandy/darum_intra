# Darumtech Intra V2 - 설치/실행/배포 가이드

본 문서는 로컬 개발, 컨테이너 빌드, k3s 배포까지의 절차를 상세히 안내합니다.

## 1) 필수 요구사항
- Java 17
- Node.js 18+ (권장: 20 LTS)
- DB2 접속 정보
- Docker (컨테이너 빌드용)
- k3s 클러스터 (배포 대상 서버)

## 2) 환경 변수
### 백엔드
백엔드 실행 전에 아래 환경 변수를 설정합니다.

```
DB_URL=jdbc:db2://<host>:<port>/<db>
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
JASYPT_ENCRYPTOR_PASSWORD=your-jasypt-password
```

### 프론트엔드
프론트엔드는 Vite 빌드 시점에 API 주소를 주입합니다.

```
VITE_API_URL=http://localhost:8080
```

## 3) 로컬 개발 실행
### 백엔드
```
cd backend
./gradlew clean build
./gradlew bootRun
```
- 기본 포트: `8080`

### 프론트엔드
```
cd frontend
npm install
npm run dev
```
- 기본 포트: `80`

### 접속
- Frontend: `http://localhost`
- Backend API: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 4) 컨테이너 빌드
### 백엔드 이미지
```
docker build -t darumtech/intra-backend:latest -f backend/Dockerfile backend
```

### 프론트엔드 이미지
```
docker build -t darumtech/intra-frontend:latest \
  --build-arg VITE_API_URL=http://localhost:8080 \
  -f frontend/Dockerfile frontend
```

## 5) k3s 배포 (intra.darumtech.co.kr)
### 배포 구성
- Frontend: 80 포트 (도메인 `intra.darumtech.co.kr`)
- Backend: 8080 포트 (도메인 `intra.darumtech.co.kr:8080`)
- k3s 기본 Ingress(traefik) 사용

### 배포 스크립트
- Windows: `scripts/deploy_k3s_windows.ps1`
- Linux: `scripts/deploy_k3s_linux.sh`

스크립트는 아래 작업을 자동 수행합니다.
1. 백엔드/프론트엔드 Docker 이미지 빌드
2. 이미지 tar 저장 후 k3s containerd로 import
3. k8s 매니페스트 적용

### 배포 시 주의사항
- `deploy/k3s/secret.yaml`에 실제 DB/JWT/Jasypt 값을 입력해야 합니다.
- DNS에서 `intra.darumtech.co.kr`이 k3s 노드를 가리키도록 설정합니다.
- 방화벽에서 80/8080 포트를 허용해야 합니다.

## 6) 배포 점검
```
kubectl get pods -n intra
kubectl get svc -n intra
kubectl get ingress -n intra
```

## 7) 테스트
- Backend: `cd backend && ./gradlew test`
- Frontend: `cd frontend && npm run lint`
