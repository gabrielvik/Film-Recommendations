#!/bin/bash
set -e  # Exit immediately if a command exits with non-zero status

# Get directory where script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Working directory: $SCRIPT_DIR"
cd "$SCRIPT_DIR"

# Define variables
HOMELAB_USER="manu"
HOMELAB_IP="192.168.1.10"
PROJECT_DIR="/home/manu/film-recommendations"

echo "Checking for required deployment files..."
if [ ! -f "$SCRIPT_DIR/docker-compose.homelab.yml" ]; then
    echo "Error: docker-compose.homelab.yml not found in $SCRIPT_DIR"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/FilmRecommendations.Frontend/homelab.nginx.conf" ]; then
    echo "Error: homelab.nginx.conf not found in $SCRIPT_DIR/FilmRecommendations.Frontend/"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "Warning: .env file not found. Creating a template..."
    cat > "$SCRIPT_DIR/.env" << 'EOT'
# API Keys for Film Recommendations application
TMDB_API_KEY=your_tmdb_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GROK_API_KEY=your_grok_api_key_here
JWT_KEY=your_jwt_secret_key_here
JWT_ISSUER=FilmRecomendationWebsite
JWT_AUDIENCE=ClientApplication
EOT
    echo "Please update the .env file with your actual API keys before continuing."
    exit 1
fi

# Create project directory on homelab
echo "Creating project directory on homelab..."
ssh "${HOMELAB_USER}@${HOMELAB_IP}" "mkdir -p ${PROJECT_DIR}"

# Copy essential files to homelab
echo "Copying docker-compose.homelab.yml to homelab..."
scp "$SCRIPT_DIR/docker-compose.homelab.yml" "${HOMELAB_USER}@${HOMELAB_IP}:${PROJECT_DIR}/docker-compose.yml"

echo "Copying .env file to homelab..."
scp "$SCRIPT_DIR/.env" "${HOMELAB_USER}@${HOMELAB_IP}:${PROJECT_DIR}/.env"

# Create a tar of the frontend and backend directories
echo "Creating deployment package..."
tar -cf deploy.tar FilmRecomendations.WebApi FilmRecommendations.Frontend

echo "Copying deployment package to homelab..."
scp "deploy.tar" "${HOMELAB_USER}@${HOMELAB_IP}:${PROJECT_DIR}/deploy.tar"

# Remove the local tar file
rm deploy.tar

# SSH into homelab and deploy
echo "Deploying on homelab..."
ssh "${HOMELAB_USER}@${HOMELAB_IP}" << 'EOF'
cd ~/film-recommendations

# Extract the deployment package
echo "Extracting deployment package..."
tar -xf deploy.tar
rm deploy.tar

# Deploy using docker-compose
echo "Starting containers..."
docker-compose down
docker-compose pull
docker-compose build
docker-compose up -d

echo "Checking container status..."
docker ps | grep filmrecs

echo "Deployment complete!"
EOF

echo "Deployment to homelab completed successfully!"
echo "Your application should be accessible at:"
echo "- Frontend: http://192.168.1.10:5173"
echo "- API: http://192.168.1.10:5291"
echo "- Swagger: http://192.168.1.10:5291/swagger"