stage('Deploy') {
    steps {
        // Create docker-compose.yml with environment-specific settings
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
        '''
        
        // Deploy to homelab if on Develop branch
        script {
            if (env.BRANCH_NAME == 'Develop') {
                echo 'Deploying to homelab...'
                
                // Save images to files
                sh '''
                    mkdir -p deploy
                    docker save filmrecommendations-api:latest > deploy/api.tar
                    docker save filmrecommendations-frontend:latest > deploy/frontend.tar
                    cp docker-compose.yml deploy/
                '''
                
                // Transfer files to homelab
                sshagent(credentials: ['homelab-ssh-key']) {
                    sh '''
                        # Ensure deploy directory exists on homelab
                        ssh manu@192.168.1.10 'mkdir -p ~/filmrecs-deploy'
                        
                        # Transfer Docker images and docker-compose.yml
                        scp deploy/* manu@192.168.1.10:~/filmrecs-deploy/
                        
                        # Run deployment script on homelab
                        ssh manu@192.168.1.10 'cd ~/filmrecs-deploy && bash deploy.sh'
                    '''
                }
                
                echo 'Deployment to homelab completed'
            } else {
                echo 'Skipping homelab deployment for non-Develop branch'
            }
        }
    }
}