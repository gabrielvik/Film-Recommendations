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

# Check for required deployment files
echo "Checking for required deployment files..."
if [ ! -f "$SCRIPT_DIR/docker-compose.homelab.yml" ]; then
    echo "Error: docker-compose.homelab.yml not found in $SCRIPT_DIR"
    exit 1
fi

# Check for frontend nginx config (case-insensitive check)
NGINX_CONF=""
if [ -f "$SCRIPT_DIR/FilmRecommendations.Frontend/homelab.nginx.conf" ]; then
    NGINX_CONF="$SCRIPT_DIR/FilmRecommendations.Frontend/homelab.nginx.conf"
    echo "Found nginx config at: $NGINX_CONF"
elif [ -f "$SCRIPT_DIR/FilmRecomendations.Frontend/homelab.nginx.conf" ]; then
    NGINX_CONF="$SCRIPT_DIR/FilmRecomendations.Frontend/homelab.nginx.conf"
    echo "Found nginx config at: $NGINX_CONF"
else
    echo "Error: homelab.nginx.conf not found in frontend directory"
    echo "Checking directories:"
    ls -la "$SCRIPT_DIR"
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

echo "Copying nginx configuration..."
scp "$NGINX_CONF" "${HOMELAB_USER}@${HOMELAB_IP}:${PROJECT_DIR}/nginx.conf"

# Check if WebApi directory exists (with either spelling)
WEBAPI_DIR=""
if [ -d "$SCRIPT_DIR/FilmRecomendations.WebApi" ]; then
    WEBAPI_DIR="FilmRecomendations.WebApi"
elif [ -d "$SCRIPT_DIR/FilmRecommendations.WebApi" ]; then
    WEBAPI_DIR="FilmRecommendations.WebApi"
else
    echo "Error: WebApi directory not found"
    exit 1
fi

# Check if Frontend directory exists (with either spelling)
FRONTEND_DIR=""
if [ -d "$SCRIPT_DIR/FilmRecomendations.Frontend" ]; then
    FRONTEND_DIR="FilmRecomendations.Frontend"
elif [ -d "$SCRIPT_DIR/FilmRecommendations.Frontend" ]; then
    FRONTEND_DIR="FilmRecommendations.Frontend"
else
    echo "Error: Frontend directory not found"
    exit 1
fi

echo "Using WebApi directory: $WEBAPI_DIR"
echo "Using Frontend directory: $FRONTEND_DIR"

# Create individual tars for each project
echo "Creating WebApi package..."
tar -cf webapi.tar "$WEBAPI_DIR" || {
    echo "Error: Failed to create WebApi tar file"
    exit 1
}

echo "Creating Frontend package..."
tar -cf frontend.tar "$FRONTEND_DIR" || {
    echo "Error: Failed to create Frontend tar file"
    exit 1
}

echo "Copying WebApi package to homelab..."
scp "webapi.tar" "${HOMELAB_USER}@${HOMELAB_IP}:${PROJECT_DIR}/webapi.tar"

echo "Copying Frontend package to homelab..."
scp "frontend.tar" "${HOMELAB_USER}@${HOMELAB_IP}:${PROJECT_DIR}/frontend.tar"

# Remove the local tar files
rm webapi.tar frontend.tar

# SSH into homelab and deploy
echo "Deploying on homelab..."
ssh "${HOMELAB_USER}@${HOMELAB_IP}" << 'EOF'
cd ~/film-recommendations

# Extract the deployment packages
echo "Extracting deployment packages..."
tar -xf webapi.tar
tar -xf frontend.tar
rm webapi.tar frontend.tar

# Make sure the nginx config is in the right place
mkdir -p FilmRecommendations.Frontend
mkdir -p FilmRecomendations.Frontend

# Copy nginx config to both possible locations to ensure it's found
cp nginx.conf FilmRecommendations.Frontend/nginx.conf
cp nginx.conf FilmRecomendations.Frontend/nginx.conf
cp nginx.conf FilmRecommendations.Frontend/homelab.nginx.conf
cp nginx.conf FilmRecomendations.Frontend/homelab.nginx.conf

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