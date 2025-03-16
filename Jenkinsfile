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
                // Stop existing containers if running
                sh 'docker-compose down || true'
                
                // Start with new images
                sh 'docker-compose up -d'
                
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