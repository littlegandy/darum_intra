#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="intra"
BACKEND_IMAGE="darumtech/intra-backend:latest"
FRONTEND_IMAGE="darumtech/intra-frontend:latest"
VITE_API_URL="http://intra.darumtech.co.kr"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "${SCRIPT_DIR}/.." && pwd)

build_backend() {
  docker build -t "${BACKEND_IMAGE}" -f "${ROOT_DIR}/backend/Dockerfile" "${ROOT_DIR}/backend"
}

build_frontend() {
  docker build -t "${FRONTEND_IMAGE}" \
    --build-arg VITE_API_URL="${VITE_API_URL}" \
    -f "${ROOT_DIR}/frontend/Dockerfile" "${ROOT_DIR}/frontend"
}

import_image() {
  local image="$1"
  local tar="/tmp/$(echo "$image" | tr '/:' '_').tar"
  docker save -o "$tar" "$image"
  if command -v k3s >/dev/null 2>&1; then
    k3s ctr images import "$tar"
  else
    ctr -n k8s.io images import "$tar"
  fi
  rm -f "$tar"
}

apply_manifests() {
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/namespace.yaml"
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/secret.yaml"
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/backend-deployment.yaml"
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/backend-service.yaml"
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/frontend-deployment.yaml"
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/frontend-service.yaml"
  kubectl apply -f "${ROOT_DIR}/deploy/k3s/ingress.yaml"
}

rollout_deployments() {
  kubectl rollout restart deployment/intra-backend -n "${NAMESPACE}"
  kubectl rollout restart deployment/intra-frontend -n "${NAMESPACE}"
  kubectl rollout status deployment/intra-backend -n "${NAMESPACE}"
  kubectl rollout status deployment/intra-frontend -n "${NAMESPACE}"
}

main() {
  build_backend
  build_frontend
  import_image "$BACKEND_IMAGE"
  import_image "$FRONTEND_IMAGE"
  apply_manifests
  rollout_deployments

  echo "Deployed to namespace: ${NAMESPACE}"
  echo "Frontend: http://intra.darumtech.co.kr"
  echo "Backend: http://intra.darumtech.co.kr/api"
}

main "$@"
