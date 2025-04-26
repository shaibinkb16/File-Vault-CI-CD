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
sudo systemctl start docker

# Ensure ec2-user is in docker group
if ! groups ec2-user | grep -q docker; then
    sudo usermod -aG docker ec2-user
    newgrp docker
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create necessary directories
mkdir -p /home/ec2-user/abnormal-file-hub/backend/media
chmod 777 /home/ec2-user/abnormal-file-hub/backend/media

# Create frontend .env file
echo "Creating frontend configuration..."
mkdir -p /home/ec2-user/abnormal-file-hub/frontend
cat > /home/ec2-user/abnormal-file-hub/frontend/.env << EOL
REACT_APP_API_URL=http://65.2.168.38/api
EOL

# Stop and remove all containers
echo "Stopping and removing all containers..."
docker-compose down --remove-orphans || true

# Remove all containers (including those not managed by compose)
echo "Removing all containers..."
docker rm -f $(docker ps -aq) || true

# Remove all networks
echo "Removing all networks..."
docker network prune -f || true

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

# Get the assigned port
PORT=$(docker-compose port backend 8000 | cut -d: -f2)
echo "Backend is running on port: $PORT"

# Update frontend configuration
echo "Updating frontend configuration..."
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://65.2.168.38:$PORT/api|" /home/ec2-user/abnormal-file-hub/frontend/.env
sed -i "s|REACT_APP_API_URL = .*|REACT_APP_API_URL = \"http://65.2.168.38:$PORT/api\"|" /home/ec2-user/abnormal-file-hub/netlify.toml

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