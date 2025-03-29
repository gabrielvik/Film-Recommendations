@echo off
echo Deploying Film Recommendations to homelab (192.168.1.10)...

rem Set variables
set HOMELAB_IP=192.168.1.10
set HOMELAB_USER=manu
set REMOTE_DIR=/home/manu/film-recommendations

rem Display initial message
echo ======================================================
echo  Film Recommendations - Homelab Deployment
echo ======================================================
echo Target:          %HOMELAB_IP%
echo Remote Directory: %REMOTE_DIR%
echo.

rem Check if docker-compose and Nginx config files exist
if not exist "docker-compose.homelab.simple.yml" (
    echo ERROR: docker-compose.homelab.simple.yml not found
    goto :error
)

if not exist "FilmRecommendations.Frontend\homelab.nginx.fixed.conf" (
    echo ERROR: homelab.nginx.fixed.conf not found
    goto :error
)

if not exist ".env" (
    echo ERROR: .env file not found
    goto :error
)

rem Step 1: Copy docker-compose file
echo Copying docker-compose.yml...
docker run --rm -v "%cd%\docker-compose.homelab.simple.yml:/tmp/docker-compose.yml" alpine cat /tmp/docker-compose.yml > docker-compose.temp.yml
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm alpine sh -c "mkdir -p %REMOTE_DIR%"
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/docker-compose.yml" < docker-compose.temp.yml
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/docker-compose.yml /dest/docker-compose.yml"
del docker-compose.temp.yml

rem Step 2: Copy .env file
echo Copying .env file...
docker run --rm -v "%cd%\.env:/tmp/.env" alpine cat /tmp/.env > .env.temp
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/.env" < .env.temp
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/.env /dest/.env"
del .env.temp

rem Step 3: Copy Nginx config
echo Copying Nginx configuration...
docker run --rm -v "%cd%\FilmRecommendations.Frontend\homelab.nginx.fixed.conf:/tmp/nginx.conf" alpine cat /tmp/nginx.conf > nginx.conf.temp
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/nginx.conf" < nginx.conf.temp
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/nginx.conf /dest/nginx.conf"
del nginx.conf.temp

rem Step 4: Deploy containers
echo Stopping existing containers...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 -v %REMOTE_DIR%:/app -w /app docker-compose down

echo Starting containers...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 -v %REMOTE_DIR%:/app -w /app docker-compose up -d

rem Display success message
echo.
echo ======================================================
echo  Deployment completed successfully!
echo ======================================================
echo Your application should be accessible at:
echo - Frontend: http://%HOMELAB_IP%:5173
echo - API: http://%HOMELAB_IP%:5291
echo - Swagger: http://%HOMELAB_IP%:5291/swagger
echo.
goto :end

:error
echo Deployment failed!
exit /b 1

:end
pause