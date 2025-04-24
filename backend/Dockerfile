FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create media directory
RUN mkdir -p /app/media /app/data
RUN chmod -R 777 /app/media /app/data

# Set environment variables
ENV PYTHONPATH=/app:.
ENV DJANGO_SETTINGS_MODULE=core.settings
ENV DEBUG=1
ENV ALLOWED_HOSTS=*
ENV CORS_ORIGIN_ALLOW_ALL=True

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] 