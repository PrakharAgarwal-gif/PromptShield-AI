#!/bin/sh
set -e

echo "[CLOUDOPS SENTINEL] Starting backend entrypoint initialization..."

# Wait for database connectivity if configured
if [ -n "$POSTGRES_SERVER" ]; then
    echo "[CLOUDOPS SENTINEL] Waiting for PostgreSQL at ${POSTGRES_SERVER}:${POSTGRES_PORT:-5432}..."
    python -c "
import socket
import time
import os

host = os.environ.get('POSTGRES_SERVER', 'postgres')
port = int(os.environ.get('POSTGRES_PORT', '5432'))

for attempt in range(30):
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        print(f'[CLOUDOPS SENTINEL] Database host {host}:{port} is reachable.')
        break
    except Exception as e:
        print(f'[CLOUDOPS SENTINEL] Waiting for database (attempt {attempt+1}/30)...')
        time.sleep(2)
else:
    print('[CLOUDOPS SENTINEL] WARNING: Database connection timed out. Proceeding anyway...')
"
fi

# Run Alembic migrations to apply or update schema
echo "[CLOUDOPS SENTINEL] Applying database migrations with Alembic..."
alembic upgrade head || {
    echo "[CLOUDOPS SENTINEL] Migration failed or skipped. Verifying startup..."
}

echo "[CLOUDOPS SENTINEL] Handing over process to command: $@"
exec "$@"
