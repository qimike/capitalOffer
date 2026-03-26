#!/bin/bash
set -e

echo "=== Application Starting ==="

# REQUIRED: Wait for database with timeout
max_attempts=30
attempt=1
DB_HOST=${DB_HOST:-localhost}

while ! nc -z $DB_HOST 5432; do
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database timeout"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: waiting..."
  sleep 2
  attempt=$((attempt + 1))
done

echo "✅ Database ready!"

# REQUIRED: Run initialization/seeding
python -m scripts.seed_public

# REQUIRED: Start application
exec python run.py # or node server.js
