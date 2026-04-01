FROM python:3.13-slim

WORKDIR /app

# Install health check tools BEFORE copying code
# CRITICAL: Must install curl and other tools before copying application files
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

RUN mkdir -p /app/staticfiles && chmod -R 777 /app/staticfiles

# Expose port
EXPOSE 3000

# Use custom entrypoint
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
