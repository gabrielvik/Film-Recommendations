@echo off
echo Deploying Film Recommendations to homelab (192.168.1.10)...

rem Get the directory where the batch file is located
set SCRIPT_DIR=%~dp0
echo Script directory: %SCRIPT_DIR%

rem Convert Windows path to WSL path with lowercase drive letter
set DRIVE_LETTER=%SCRIPT_DIR:~0,1%
for %%i in (A B C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if /I "%DRIVE_LETTER%"=="%%i" set DRIVE_LETTER=%%i
)
set DRIVE_LETTER_LOWER=%DRIVE_LETTER%
if "%DRIVE_LETTER%"=="A" set DRIVE_LETTER_LOWER=a
if "%DRIVE_LETTER%"=="B" set DRIVE_LETTER_LOWER=b
if "%DRIVE_LETTER%"=="C" set DRIVE_LETTER_LOWER=c
if "%DRIVE_LETTER%"=="D" set DRIVE_LETTER_LOWER=d
if "%DRIVE_LETTER%"=="E" set DRIVE_LETTER_LOWER=e
if "%DRIVE_LETTER%"=="F" set DRIVE_LETTER_LOWER=f
if "%DRIVE_LETTER%"=="G" set DRIVE_LETTER_LOWER=g
if "%DRIVE_LETTER%"=="H" set DRIVE_LETTER_LOWER=h
if "%DRIVE_LETTER%"=="I" set DRIVE_LETTER_LOWER=i
if "%DRIVE_LETTER%"=="J" set DRIVE_LETTER_LOWER=j
if "%DRIVE_LETTER%"=="K" set DRIVE_LETTER_LOWER=k
if "%DRIVE_LETTER%"=="L" set DRIVE_LETTER_LOWER=l
if "%DRIVE_LETTER%"=="M" set DRIVE_LETTER_LOWER=m
if "%DRIVE_LETTER%"=="N" set DRIVE_LETTER_LOWER=n
if "%DRIVE_LETTER%"=="O" set DRIVE_LETTER_LOWER=o
if "%DRIVE_LETTER%"=="P" set DRIVE_LETTER_LOWER=p
if "%DRIVE_LETTER%"=="Q" set DRIVE_LETTER_LOWER=q
if "%DRIVE_LETTER%"=="R" set DRIVE_LETTER_LOWER=r
if "%DRIVE_LETTER%"=="S" set DRIVE_LETTER_LOWER=s
if "%DRIVE_LETTER%"=="T" set DRIVE_LETTER_LOWER=t
if "%DRIVE_LETTER%"=="U" set DRIVE_LETTER_LOWER=u
if "%DRIVE_LETTER%"=="V" set DRIVE_LETTER_LOWER=v
if "%DRIVE_LETTER%"=="W" set DRIVE_LETTER_LOWER=w
if "%DRIVE_LETTER%"=="X" set DRIVE_LETTER_LOWER=x
if "%DRIVE_LETTER%"=="Y" set DRIVE_LETTER_LOWER=y
if "%DRIVE_LETTER%"=="Z" set DRIVE_LETTER_LOWER=z

set WSL_PATH=/mnt/%DRIVE_LETTER_LOWER%/%SCRIPT_DIR:~3,-1%
set WSL_PATH=%WSL_PATH:\=/%
echo WSL path: %WSL_PATH%

rem Check if WSL is installed
wsl --list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Error: WSL is not installed or not available. Please install WSL first.
  pause
  exit /b 1
)

rem Copy deployment files to WSL home directory for reliable access
echo Copying deployment script to WSL home directory...
wsl cp %WSL_PATH%/deploy-to-homelab.sh ~/ 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: Failed to copy script to WSL home directory.
  echo Attempting alternative approach...
  
  rem Try direct file creation in WSL
  echo Creating deployment script directly in WSL...
  
  wsl bash -c "cat > ~/deploy-to-homelab.sh << 'EOF'
#!/bin/sh
set -e  # Exit immediately if a command exits with non-zero status

# Define variables
WSL_PROJECT_PATH='%WSL_PATH%'
HOMELAB_USER='manu'
HOMELAB_IP='192.168.1.10'
PROJECT_DIR='/home/manu/film-recommendations'

echo \"Working with project at: \$WSL_PROJECT_PATH\"
cd \"\$WSL_PROJECT_PATH\"

# Check for required deployment files
echo \"Checking for required deployment files...\"
if [ ! -f \"\$WSL_PROJECT_PATH/docker-compose.homelab.yml\" ]; then
    echo \"Error: docker-compose.homelab.yml not found\"
    exit 1
fi

# Check for env file
if [ ! -f \"\$WSL_PROJECT_PATH/.env\" ]; then
    echo \"Warning: .env file not found.\"
    exit 1
fi

# Create project directory on homelab
echo \"Creating project directory on homelab...\"
ssh \"\${HOMELAB_USER}@\${HOMELAB_IP}\" \"mkdir -p \${PROJECT_DIR}\"

# Copy essential files to homelab
echo \"Copying docker-compose.homelab.yml to homelab...\"
scp \"\$WSL_PROJECT_PATH/docker-compose.homelab.yml\" \"\${HOMELAB_USER}@\${HOMELAB_IP}:\${PROJECT_DIR}/docker-compose.yml\"

echo \"Copying .env file to homelab...\"
scp \"\$WSL_PROJECT_PATH/.env\" \"\${HOMELAB_USER}@\${HOMELAB_IP}:\${PROJECT_DIR}/.env\"

# Find nginx config
NGINX_CONF=\"\"
if [ -f \"\$WSL_PROJECT_PATH/FilmRecommendations.Frontend/homelab.nginx.conf\" ]; then
    NGINX_CONF=\"\$WSL_PROJECT_PATH/FilmRecommendations.Frontend/homelab.nginx.conf\"
elif [ -f \"\$WSL_PROJECT_PATH/FilmRecomendations.Frontend/homelab.nginx.conf\" ]; then
    NGINX_CONF=\"\$WSL_PROJECT_PATH/FilmRecomendations.Frontend/homelab.nginx.conf\"
fi

if [ -n \"\$NGINX_CONF\" ]; then
    echo \"Copying nginx configuration from \$NGINX_CONF...\"
    scp \"\$NGINX_CONF\" \"\${HOMELAB_USER}@\${HOMELAB_IP}:\${PROJECT_DIR}/nginx.conf\"
else
    echo \"Warning: Could not find nginx config file\"
fi

# Create remote deployment script
echo \"Creating remote deployment script...\"
cat > remote_deploy.sh << 'EOT'
#!/bin/sh
cd ~/film-recommendations

# Make sure directories exist
mkdir -p FilmRecommendations.Frontend
mkdir -p FilmRecomendations.Frontend

# Copy nginx config if it exists
if [ -f nginx.conf ]; then
  cp nginx.conf FilmRecommendations.Frontend/nginx.conf
  cp nginx.conf FilmRecomendations.Frontend/nginx.conf
  cp nginx.conf FilmRecommendations.Frontend/homelab.nginx.conf
  cp nginx.conf FilmRecomendations.Frontend/homelab.nginx.conf
fi

# Deploy using docker-compose
echo \"Starting containers...\"
docker-compose down
docker-compose pull
docker-compose build
docker-compose up -d

echo \"Checking container status...\"
docker ps | grep filmrecs

echo \"Deployment complete!\"
EOT

# Copy and run the remote script
scp remote_deploy.sh \"\${HOMELAB_USER}@\${HOMELAB_IP}:\${PROJECT_DIR}/remote_deploy.sh\"
ssh \"\${HOMELAB_USER}@\${HOMELAB_IP}\" \"chmod +x \${PROJECT_DIR}/remote_deploy.sh && \${PROJECT_DIR}/remote_deploy.sh\"
rm remote_deploy.sh

echo \"Deployment to homelab completed successfully!\"
echo \"Your application should be accessible at:\"
echo \"- Frontend: http://192.168.1.10:5173\"
echo \"- API: http://192.168.1.10:5291\"
echo \"- Swagger: http://192.168.1.10:5291/swagger\"
EOF"
  
  if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create script in WSL.
    pause
    exit /b %ERRORLEVEL%
  )
)

rem Make script executable
wsl chmod +x ~/deploy-to-homelab.sh
if %ERRORLEVEL% NEQ 0 (
  echo Error: Failed to set executable permission on the script.
  pause
  exit /b %ERRORLEVEL%
)

rem Run the deployment script
echo Running deployment script from WSL home directory...
wsl ~/deploy-to-homelab.sh

if %ERRORLEVEL% NEQ 0 (
  echo Deployment failed with error code %ERRORLEVEL%
  pause
  exit /b %ERRORLEVEL%
)

echo Deployment completed successfully!
echo.
echo Your application should be accessible at:
echo - Frontend: http://192.168.1.10:5173
echo - API: http://192.168.1.10:5291
echo - Swagger: http://192.168.1.10:5291/swagger
echo.
pause