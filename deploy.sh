#!/bin/bash

# Update system packages
sudo yum update -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    sudo amazon-linux-extras enable docker
    sudo yum install -y docker
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

# Create necessary directories
mkdir -p /home/ec2-user/abnormal-file-hub/backend/media
chmod 777 /home/ec2-user/abnormal-file-hub/backend/media

# Stop and remove existing containers
docker-compose down

# Remove all unused images
docker system prune -f

# Build and start containers
docker-compose up --build -d

# Check if containers are running
docker-compose ps

echo "Backend deployment completed successfully!" 