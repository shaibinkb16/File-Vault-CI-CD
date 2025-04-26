#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker ec2-user
fi

# Start Docker service
sudo service docker start

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create necessary directories
mkdir -p /home/ec2-user/abnormal-file-hub/backend/media
chmod 777 /home/ec2-user/abnormal-file-hub/backend/media

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Remove existing volumes
echo "Cleaning up volumes..."
docker volume prune -f || true

# Build and start containers
echo "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Verify services are running
echo "Checking service status..."
if ! docker-compose ps | grep -q "Up"; then
    echo "Services are not running properly!"
    echo "Container logs:"
    docker-compose logs
    echo "Docker processes:"
    docker ps -a
    exit 1
fi

echo "Deployment completed successfully!" 