#!/bin/bash
set -e
echo "[init] Running schema initialization..."

# Copy to writable location and strip Windows CRLF line endings
tr -d '\r' < /tmp/init_schema.sql > /tmp/schema_clean.sql

# -t flag: treat ';' as statement terminator (required for multi-line SQL)
su - db2inst1 -c "db2 connect to INTRA && db2 -t -f /tmp/schema_clean.sql && db2 disconnect INTRA"

echo "[init] Schema initialization complete."
