#!/usr/bin/env bash
set -euo pipefail

# Backend launcher for Darumtech Intra V2
# Requirements: JDK 17, Gradle wrapper
# Env vars to set externally: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JASYPT_ENCRYPTOR_PASSWORD

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

: "${SPRING_PROFILES_ACTIVE:=dev}"
export SPRING_PROFILES_ACTIVE

: "${DB_URL:=jdbc:db2://192.168.0.70:25010/INTRA}"
: "${DB_USERNAME:=db2inst1}"
: "${DB_PASSWORD:=TeCh2)2@!}"
: "${JASYPT_ENCRYPTOR_PASSWORD:=ekfmaxpzm2022!}"
export DB_URL DB_USERNAME DB_PASSWORD JASYPT_ENCRYPTOR_PASSWORD

# Drop any previous build output to avoid stale/generated file locks
rm -rf build

if [[ ! -x ./gradlew ]]; then
  chmod +x ./gradlew
fi

exec ./gradlew clean bootRun
