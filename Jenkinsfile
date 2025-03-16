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
                // Stop existing containers if running using local docker-compose
                sh './docker-compose down || true'
                
                // Start with new images
                sh './docker-compose up -d'
                
                // Verify deployment
                sh 'docker ps'
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