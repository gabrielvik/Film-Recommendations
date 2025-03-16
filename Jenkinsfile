pipeline {
    agent any
    
    environment {
        // Your environment variables
        OPENAI_API_KEY = credentials('openai-api-key')
        TMDB_API_KEY = credentials('tmdb-api-key')
        GROK_API_KEY = credentials('grok-api-key')
        JWT_KEY = credentials('jwt-key')
        JWT_ISSUER = 'FilmRecommendationsAPI'
        JWT_AUDIENCE = 'FilmRecommendationsUsers'
        // Use a different port for the API in CI environment
        API_PORT = '5292' // Changed from 5291 to avoid conflict
    }
    
    stages {
        stage('Setup') {
            steps {
                sh '''
                    # Install docker-compose locally if it doesn't exist or can't be executed
                    if [ ! -f "./docker-compose" ] || [ ! -x "./docker-compose" ]; then
                        echo "Installing docker-compose..."
                        curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o docker-compose
                        chmod +x docker-compose
                    fi
                    
                    # Verify installation
                    ./docker-compose --version
                    
                    # Clean up any running containers that might conflict with our ports
                    echo "Stopping any containers that might be using our ports..."
                    docker ps -q -f publish=5291 | xargs -r docker stop || true
                    docker ps -q -f publish=5173 | xargs -r docker stop || true
                    
                    # Remove any stopped containers that used these ports
                    docker ps -a -q -f publish=5291 | xargs -r docker rm || true
                    docker ps -a -q -f publish=5173 | xargs -r docker rm || true
                '''
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Frontend Build') {
            steps {
                dir('FilmRecommendations.Frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                // Build backend Docker image - this will handle the .NET 9 build inside Docker
                sh 'docker build -t filmrecommendations-api:latest -f FilmRecomendations.WebApi/Dockerfile .'
                
                // Build frontend Docker image
                dir('FilmRecommendations.Frontend') {
                    sh 'docker build -t filmrecommendations-frontend:latest .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                // Create or update docker-compose.yml with environment-specific settings
                sh '''
                    # This ensures we use the port from the environment variable
                    cat <<EOF > docker-compose.yml
version: '3.8'

services:
  filmrecs-api:
    image: filmrecommendations-api:latest
    ports:
      - "${API_PORT}:5291"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TMDB_API_KEY=${TMDB_API_KEY}
      - GROK_API_KEY=${GROK_API_KEY}
      - JWT_KEY=${JWT_KEY}
      - JWT_ISSUER=${JWT_ISSUER}
      - JWT_AUDIENCE=${JWT_AUDIENCE}
      - ConnectionStrings__FilmConnectionString=Server=filmrecs-db;Database=FilmRecommendations;User Id=sa;Password=YourStr0ngP@ssw0rd;TrustServerCertificate=True
    networks:
      - filmrecs-network
    depends_on:
      - filmrecs-db

  filmrecs-frontend:
    image: filmrecommendations-frontend:latest
    ports:
      - "5173:5173"
    networks:
      - filmrecs-network
    depends_on:
      - filmrecs-api

  filmrecs-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStr0ngP@ssw0rd
    ports:
      - "1433:1433"
    volumes:
      - filmrecs-db-data:/var/opt/mssql
    networks:
      - filmrecs-network

networks:
  filmrecs-network:
    driver: bridge

volumes:
  filmrecs-db-data:
EOF

                    # Stop any existing deployment with the same project name
                    ./docker-compose down --remove-orphans || true
                    
                    # Start with new configuration
                    ./docker-compose up -d
                    
                    # Verify deployment
                    docker ps
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}