$ErrorActionPreference = "Stop"

$Namespace = "intra"
$BackendImage = "darumtech/intra-backend:latest"
$FrontendImage = "darumtech/intra-frontend:latest"
$ViteApiUrl = "http://intra.darumtech.co.kr:8080"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..")

function Build-Backend {
  docker build -t $BackendImage -f (Join-Path $RootDir "backend\Dockerfile") (Join-Path $RootDir "backend")
}

function Build-Frontend {
  docker build -t $FrontendImage --build-arg VITE_API_URL=$ViteApiUrl -f (Join-Path $RootDir "frontend\Dockerfile") (Join-Path $RootDir "frontend")
}

function Import-Image($Image) {
  $Tar = Join-Path $env:TEMP ("{0}.tar" -f ($Image -replace "[/|:]", "_"))
  docker save -o $Tar $Image

  if (Get-Command k3s -ErrorAction SilentlyContinue) {
    k3s ctr images import $Tar
  } else {
    ctr -n k8s.io images import $Tar
  }

  Remove-Item $Tar -Force
}

function Apply-Manifests {
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\namespace.yaml")
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\secret.yaml")
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\backend-deployment.yaml")
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\backend-service.yaml")
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\frontend-deployment.yaml")
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\frontend-service.yaml")
  kubectl apply -f (Join-Path $RootDir "deploy\k3s\ingress.yaml")
}

Build-Backend
Build-Frontend
Import-Image $BackendImage
Import-Image $FrontendImage
Apply-Manifests

Write-Host "Deployed to namespace: $Namespace"
Write-Host "Frontend: http://intra.darumtech.co.kr"
Write-Host "Backend: http://intra.darumtech.co.kr:8080"
