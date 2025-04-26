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

# Create and set permissions for directories
RUN mkdir -p /app/media /app/staticfiles && \
    chmod -R 755 /app/media /app/staticfiles

# Set environment variables
ENV PYTHONPATH=/app:.

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Create a non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"] 