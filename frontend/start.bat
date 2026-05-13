@echo off
setlocal
rem Frontend launcher for Darumtech Intra V2 (Windows)
rem Requirements: Node.js (>=18 recommended), npm

cd /d "%~dp0"

if not exist node_modules (
    npm install || exit /b 1
)

if exist dist (
    rmdir /s /q dist
)

if "%PORT%"=="" (
    set "PORT=80"
)

npm run dev -- --host --port %PORT%

endlocal
