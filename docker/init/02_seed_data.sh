#!/bin/bash
set -e
echo "[seed] Running seed data insertion..."

tr -d '\r' < /tmp/seed_data.sql > /tmp/seed_clean.sql

su - db2inst1 -c "db2 connect to INTRA && db2 -t -f /tmp/seed_clean.sql && db2 disconnect INTRA"

echo "[seed] Seed data insertion complete."
