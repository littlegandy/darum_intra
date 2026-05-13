#!/usr/bin/env bash
set -euo pipefail

# Frontend launcher for Darumtech Intra V2
# Requirements: Node.js (>=18 recommended), npm

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -d node_modules ]]; then
  npm install
fi

# Remove stale build artifacts so dev server starts clean
rm -rf dist

# VITE_API_URL should point to the backend (e.g., http://localhost:8080)
PORT="${PORT:-80}"

exec npm run dev -- --host --port "$PORT"
