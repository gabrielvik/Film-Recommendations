# PowerShell script to deploy Film Recommendations app to homelab server

# Configuration
$HomelabHost = "192.168.1.10"
$RemoteDir = "/home/manu/film-recommendations"
$Username = "manu"
$UseDocker = $true
$DockerTcpPort = 2375

# Display banner
Write-Host "======================================================"
Write-Host "  Film Recommendations - Homelab Deployment Script"
Write-Host "======================================================"
Write-Host "Target: $HomelabHost"
Write-Host "Remote Directory: $RemoteDir"
Write-Host ""

# Check required files
$requiredFiles = @(
    "docker-compose.homelab.yml",
    ".env",
    "FilmRecommendations.Frontend\homelab.nginx.fixed.conf"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "ERROR: Required file not found: $file" -ForegroundColor Red
        exit 1
    }
}

# Create remote directory
Write-Host "Creating remote directory..." -ForegroundColor Cyan
if ($UseDocker) {
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm alpine sh -c "mkdir -p $RemoteDir"
} else {
    ssh ${Username}@${HomelabHost} "mkdir -p $RemoteDir"
}

# Copy docker-compose file
Write-Host "Copying docker-compose.homelab.yml..." -ForegroundColor Cyan
if ($UseDocker) {
    Copy-Item -Path "docker-compose.homelab.yml" -Destination "docker-compose.homelab.copy.yml" -Force
    docker run --rm -v "${PWD}/docker-compose.homelab.copy.yml:/tmp/docker-compose.yml" alpine cat /tmp/docker-compose.yml > docker-compose.temp.yml
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/docker-compose.yml" < docker-compose.temp.yml
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm -v /tmp:/tmp -v ${RemoteDir}:/dest alpine sh -c "cp /tmp/docker-compose.yml /dest/docker-compose.yml"
    Remove-Item -Path "docker-compose.temp.yml" -Force
    Remove-Item -Path "docker-compose.homelab.copy.yml" -Force
} else {
    scp "docker-compose.homelab.yml" ${Username}@${HomelabHost}:${RemoteDir}/docker-compose.yml
}

# Copy .env file
Write-Host "Copying .env file..." -ForegroundColor Cyan
if ($UseDocker) {
    Copy-Item -Path ".env" -Destination ".env.copy" -Force
    docker run --rm -v "${PWD}/.env.copy:/tmp/.env" alpine cat /tmp/.env > .env.temp
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/.env" < .env.temp
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm -v /tmp:/tmp -v ${RemoteDir}:/dest alpine sh -c "cp /tmp/.env /dest/.env"
    Remove-Item -Path ".env.temp" -Force
    Remove-Item -Path ".env.copy" -Force
} else {
    scp ".env" ${Username}@${HomelabHost}:${RemoteDir}/.env
}

# Copy nginx config
Write-Host "Copying nginx configuration..." -ForegroundColor Cyan
if ($UseDocker) {
    Copy-Item -Path "FilmRecommendations.Frontend\homelab.nginx.fixed.conf" -Destination "nginx.conf.copy" -Force
    docker run --rm -v "${PWD}/nginx.conf.copy:/tmp/nginx.conf" alpine cat /tmp/nginx.conf > nginx.conf.temp
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/nginx.conf" < nginx.conf.temp
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} run --rm -v /tmp:/tmp -v ${RemoteDir}:/dest alpine sh -c "cp /tmp/nginx.conf /dest/nginx.conf"
    Remove-Item -Path "nginx.conf.temp" -Force
    Remove-Item -Path "nginx.conf.copy" -Force
} else {
    scp "FilmRecommendations.Frontend\homelab.nginx.fixed.conf" ${Username}@${HomelabHost}:${RemoteDir}/nginx.conf
}

# Deploy with docker-compose
Write-Host "Deploying containers..." -ForegroundColor Cyan
if ($UseDocker) {
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} -v ${RemoteDir}:/app -w /app docker-compose down
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} -v ${RemoteDir}:/app -w /app docker-compose pull
    docker run --rm docker:cli docker -H tcp://${HomelabHost}:${DockerTcpPort} -v ${RemoteDir}:/app -w /app docker-compose up -d
} else {
    ssh ${Username}@${HomelabHost} "cd $RemoteDir && docker-compose down && docker-compose pull && docker-compose up -d"
}

# Show success message
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "  Deployment completed successfully!" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host "Your application should be accessible at:"
Write-Host "- Frontend: http://${HomelabHost}:5173"
Write-Host "- API: http://${HomelabHost}:5291"
Write-Host "- Swagger: http://${HomelabHost}:5291/swagger"
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
