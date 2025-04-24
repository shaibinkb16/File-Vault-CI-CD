FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn pytest pytest-django pytest-cov

# Copy project files
COPY . .

# Create media directory
RUN mkdir -p /app/media /app/data
RUN chmod -R 777 /app/media /app/data

# Make start script executable
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"] 