#!/bin/bash

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Stop and remove existing containers
docker-compose down

# Remove all unused images
docker system prune -f

# Build and start containers
docker-compose up --build -d

# Check if containers are running
docker-compose ps

echo "Deployment completed successfully!" 