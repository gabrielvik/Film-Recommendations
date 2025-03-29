# Film Recommendations Application Deployment Guide

This guide explains how to deploy the Film Recommendations application with public internet access and CI/CD using Jenkins.

## Prerequisites

- Docker and Docker Compose installed
- A registered domain name
- Access to your router's configuration
- A server with a public IP address

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Film-Recommendations.git
cd Film-Recommendations
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# API Keys
TMDB_API_KEY=your_tmdb_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GROK_API_KEY=your_grok_api_key_here

# JWT Settings (optional, defaults are in docker-compose.yml)
JWT_KEY=your_custom_jwt_key
JWT_ISSUER=your_custom_issuer
JWT_AUDIENCE=your_custom_audience
```

### 3. Configure Domain Name

1. Update `nginx/nginx.conf` to use your actual domain name instead of `filmrecs.example.com`
2. Configure your DNS provider to point your domain to your server's public IP address
3. Set up port forwarding on your router for ports 80 and 443 to your server's local IP address

### 4. Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d
```

### 5. Set Up SSL/TLS Certificate (Optional but Recommended)

```bash
# Make the script executable
chmod +x ssl-setup.sh

# Run the SSL setup script
./ssl-setup.sh
```

### 6. Set Up Jenkins CI/CD

1. Access Jenkins at http://your-server-ip:8080
2. Follow the setup wizard and install recommended plugins
3. Create a new Pipeline job
4. Configure the Pipeline to use the Jenkinsfile from your Git repository
5. Set up webhook in your Git repository to trigger Jenkins on push

## Accessing the Application

- Website: http://your-domain.com (or https:// if SSL is configured)
- API: http://your-domain.com/api
- Swagger Documentation: http://your-domain.com/swagger
- Jenkins: http://your-server-ip:8080

## Troubleshooting

### Database Connection Issues
- Ensure SQL Server container is running: `docker ps | grep filmrecs-db`
- Check connection string in the .env file

### SSL Certificate Issues
- Run `certbot certificates` to check the status of your certificates
- Ensure ports 80 and 443 are correctly forwarded

### Jenkins Issues
- Check Jenkins logs: `docker logs filmrecs-jenkins`
- Ensure Jenkins has access to Docker: `docker exec -it filmrecs-jenkins docker ps`

## Maintenance

### Database Backups
```bash
# Backup the database
docker exec filmrecs-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123! -Q "BACKUP DATABASE [FilmRecommendations] TO DISK = N'/var/opt/mssql/backup/FilmRecommendations.bak' WITH NOFORMAT, NOINIT, NAME = 'FilmRecommendations-full', SKIP, NOREWIND, NOUNLOAD, STATS = 10"

# Copy the backup file from the container
docker cp filmrecs-db:/var/opt/mssql/backup/FilmRecommendations.bak ./
```

### Updating the Application
Pushing to the configured Git repository will trigger the Jenkins pipeline to rebuild and redeploy automatically.
