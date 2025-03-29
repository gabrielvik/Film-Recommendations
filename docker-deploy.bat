@echo off
echo Deploying Film Recommendations to homelab (192.168.1.10)...

rem Set variables
set HOMELAB_IP=192.168.1.10
set REMOTE_DIR=/home/manu/film-recommendations
set API_PORT=5291
set FRONTEND_PORT=5173

rem Create the target directory on homelab
echo Creating remote directory on homelab...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 exec -i alpine /bin/sh -c "mkdir -p %REMOTE_DIR%"
if %ERRORLEVEL% NEQ 0 (
  echo Failed to create directory on homelab
  pause
  exit /b 1
)

rem Copy docker-compose.yml to homelab
echo Copying docker-compose.yml to homelab...
docker run --rm -v "%cd%\docker-compose.homelab.yml:/src/docker-compose.yml" -v "%REMOTE_DIR%:/dest" alpine /bin/sh -c "cp /src/docker-compose.yml /dest/docker-compose.yml"
if %ERRORLEVEL% NEQ 0 (
  echo Failed to copy docker-compose.yml
  pause
  exit /b 1
)

rem Copy .env file to homelab
echo Copying .env file to homelab...
docker run --rm -v "%cd%\.env:/src/.env" -v "%REMOTE_DIR%:/dest" alpine /bin/sh -c "cp /src/.env /dest/.env"
if %ERRORLEVEL% NEQ 0 (
  echo Failed to copy .env file
  pause
  exit /b 1
)

rem Copy nginx config to homelab
echo Copying nginx config to homelab...
docker run --rm -v "%cd%\FilmRecommendations.Frontend\homelab.nginx.conf:/src/nginx.conf" -v "%REMOTE_DIR%:/dest" alpine /bin/sh -c "cp /src/nginx.conf /dest/nginx.conf"
if %ERRORLEVEL% NEQ 0 (
  echo Failed to copy nginx config
  pause
  exit /b 1
)

rem Deploy the containers
echo Deploying containers on homelab...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 -v %REMOTE_DIR%:/data -w /data docker-compose down
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 -v %REMOTE_DIR%:/data -w /data docker-compose pull
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 -v %REMOTE_DIR%:/data -w /data docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
  echo Failed to deploy containers
  pause
  exit /b 1
)

echo Deployment completed successfully!
echo.
echo Your application should be accessible at:
echo - Frontend: http://%HOMELAB_IP%:%FRONTEND_PORT%
echo - API: http://%HOMELAB_IP%:%API_PORT%
echo - Swagger: http://%HOMELAB_IP%:%API_PORT%/swagger
echo.
pause