#!/bin/bash

# docker-entrypoint.sh for Django backend
# This script handles database migrations, seeding, and running the server

set -e

echo "=========================================="
echo "Django Backend Startup Script"
echo "=========================================="

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

# Wait for Redis to be ready
attempt=1
REDIS_HOST=${REDIS_HOST:-localhost}

while ! nc -z $REDIS_HOST 6379; do
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Redis timeout"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: waiting for Redis..."
  sleep 2
  attempt=$((attempt + 1))
done
echo "✅ Redis ready!"

echo "Running database migrations..."
python manage.py migrate --noinput

# Seed database if needed (only if database is empty)
echo "Checking if database needs seeding..."
if ! python -c "from app.models import Offer; import sys; sys.exit(0 if Offer.objects.count() > 0 else 1)" 2>/dev/null; then
  echo "Database is empty, seeding data..."
  python seed_public.py
  python seed_private.py
else
  echo "Database already has data, skipping seeding."
fi

echo "=========================================="
echo "Starting Gunicorn Production Server"
echo "=========================================="

# Run the production server with gunicorn
exec gunicorn app.wsgi:application --bind 0.0.0.0:3000 --workers 3 --timeout 120
