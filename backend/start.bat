@echo off
setlocal disableDelayedExpansion enableextensions
rem Backend launcher for Darumtech Intra V2 (Windows)
rem Requirements: JDK 17, Gradle wrapper
rem Env vars to set externally when different: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JASYPT_ENCRYPTOR_PASSWORD, SPRING_PROFILES_ACTIVE

cd /d "%~dp0"
chcp 65001 >nul
set "JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8"

if not defined SPRING_PROFILES_ACTIVE set "SPRING_PROFILES_ACTIVE=dev"
if not defined DB_URL set "DB_URL=jdbc:db2://192.168.0.70:25010/INTRA"
if not defined DB_USERNAME set "DB_USERNAME=db2inst1"
if not defined DB_PASSWORD set "DB_PASSWORD=TeCh2)2@!"
if not defined JASYPT_ENCRYPTOR_PASSWORD set "JASYPT_ENCRYPTOR_PASSWORD=ekfmaxpzm2022!"

if exist build (
    rmdir /s /q build
)

if exist gradlew.bat (
    call gradlew.bat clean bootRun
) else (
    echo gradlew.bat not found. Please run from the backend directory.
    exit /b 1
)

endlocal
