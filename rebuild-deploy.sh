#!/bin/bash

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down

# Rebuild the Docker image for the API
echo "Rebuilding the API Docker image..."
docker-compose build api

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait a moment for services to initialize
echo "Waiting for services to initialize..."
sleep 10

# Check the logs to see if the error is resolved
echo "Checking API logs..."
docker logs filmrecs-api
