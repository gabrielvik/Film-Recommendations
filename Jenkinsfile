pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker-compose build api frontend nginx'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add test commands here when you have tests
                // sh 'dotnet test'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose down api frontend nginx || true'
                sh 'docker-compose up -d api frontend nginx'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
