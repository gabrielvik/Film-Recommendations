#!/bin/bash

# Stop any existing containers
docker-compose down

# Load the Docker images from tar files
docker load < api.tar
docker load < frontend.tar

# Start the containers
docker-compose -f docker-compose.homelab.yml up -d

echo "Deployment completed!"
echo "Frontend: http://localhost:5173"
echo "API: http://localhost:5291"
echo "Swagger: http://localhost:5291/swagger"
