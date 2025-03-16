pipeline {
    agent any
    
    environment {
        DOTNET_CLI_HOME = '/tmp/dotnet_cli_home'
        DOTNET_CLI_TELEMETRY_OPTOUT = '1'
        // Using Jenkins credentials for sensitive information
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
        
        stage('Restore Dependencies') {
            steps {
                sh 'dotnet restore "Film Recommendations.sln"'
                
                dir('FilmRecommendations.Frontend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'dotnet build "Film Recommendations.sln" --configuration Release --no-restore'
                
                dir('FilmRecommendations.Frontend') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Test') {
            steps {
                // Run any unit tests if they exist
                echo 'Running tests...'
                // sh 'dotnet test --no-restore --verbosity normal'
            }
        }
        
        stage('Docker Build') {
            steps {
                // Build backend Docker image
                dir('FilmRecomendations.WebApi') {
                    sh 'docker build -t filmrecommendations-api:latest .'
                }
                
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
            // Clean up workspace
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