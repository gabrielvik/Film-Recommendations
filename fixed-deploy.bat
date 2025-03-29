@echo off
echo Deploying Film Recommendations to homelab (192.168.1.10)...

rem Set variables
set HOMELAB_IP=192.168.1.10
set REMOTE_DIR=/home/manu/film-recommendations

echo ======================================================
echo  Film Recommendations - Homelab Deployment
echo ======================================================
echo Target:           %HOMELAB_IP%
echo Remote Directory: %REMOTE_DIR%
echo.

rem Step 1: Create remote directory
echo Creating remote directory...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm alpine sh -c "mkdir -p %REMOTE_DIR%"

rem Step 2: Create a fixed docker-compose.yml
echo Creating docker-compose.yml...
echo version: '3.8' > fixed-docker-compose.yml
echo. >> fixed-docker-compose.yml
echo services: >> fixed-docker-compose.yml
echo   api: >> fixed-docker-compose.yml
echo     image: film-recommendations-api:latest >> fixed-docker-compose.yml
echo     container_name: api >> fixed-docker-compose.yml
echo     environment: >> fixed-docker-compose.yml
echo       - ASPNETCORE_ENVIRONMENT=Development >> fixed-docker-compose.yml
echo       - ASPNETCORE_URLS=http://+:5291 >> fixed-docker-compose.yml
echo       - ConnectionStrings__FilmConnectionString=Server=db;Database=FilmRecommendations;User=sa;Password=YourStrongPassword123!;TrustServerCertificate=True; >> fixed-docker-compose.yml
echo       - TMDb__BaseUrl=https://api.themoviedb.org/3/ >> fixed-docker-compose.yml
echo       - TMDb__ApiKey=${TMDB_API_KEY} >> fixed-docker-compose.yml
echo       - OpenAI__ApiKey=${OPENAI_API_KEY} >> fixed-docker-compose.yml
echo       - GROK__ApiKey=${GROK_API_KEY} >> fixed-docker-compose.yml
echo       - Jwt__Key=${JWT_KEY:-your_jwt_secret_key_here} >> fixed-docker-compose.yml
echo       - Jwt__Issuer=${JWT_ISSUER:-FilmRecomendationWebsite} >> fixed-docker-compose.yml
echo       - Jwt__Audience=${JWT_AUDIENCE:-ClientApplication} >> fixed-docker-compose.yml
echo     ports: >> fixed-docker-compose.yml
echo       - "5291:5291" >> fixed-docker-compose.yml
echo     networks: >> fixed-docker-compose.yml
echo       - filmrecs-network >> fixed-docker-compose.yml
echo     restart: unless-stopped >> fixed-docker-compose.yml
echo     depends_on: >> fixed-docker-compose.yml
echo       - db >> fixed-docker-compose.yml
echo. >> fixed-docker-compose.yml
echo   frontend: >> fixed-docker-compose.yml
echo     image: film-recommendations-frontend:latest >> fixed-docker-compose.yml
echo     container_name: frontend >> fixed-docker-compose.yml
echo     volumes: >> fixed-docker-compose.yml
echo       - ./nginx.conf:/etc/nginx/conf.d/default.conf >> fixed-docker-compose.yml
echo     ports: >> fixed-docker-compose.yml
echo       - "5173:80" >> fixed-docker-compose.yml
echo     networks: >> fixed-docker-compose.yml
echo       - filmrecs-network >> fixed-docker-compose.yml
echo     restart: unless-stopped >> fixed-docker-compose.yml
echo     depends_on: >> fixed-docker-compose.yml
echo       - api >> fixed-docker-compose.yml
echo. >> fixed-docker-compose.yml
echo   db: >> fixed-docker-compose.yml
echo     image: mcr.microsoft.com/mssql/server:2022-latest >> fixed-docker-compose.yml
echo     container_name: db >> fixed-docker-compose.yml
echo     environment: >> fixed-docker-compose.yml
echo       - ACCEPT_EULA=Y >> fixed-docker-compose.yml
echo       - SA_PASSWORD=YourStrongPassword123! >> fixed-docker-compose.yml
echo       - MSSQL_PID=Express >> fixed-docker-compose.yml
echo     ports: >> fixed-docker-compose.yml
echo       - "1433:1433" >> fixed-docker-compose.yml
echo     volumes: >> fixed-docker-compose.yml
echo       - filmrecs-db-data:/var/opt/mssql >> fixed-docker-compose.yml
echo     networks: >> fixed-docker-compose.yml
echo       - filmrecs-network >> fixed-docker-compose.yml
echo     restart: unless-stopped >> fixed-docker-compose.yml
echo. >> fixed-docker-compose.yml
echo networks: >> fixed-docker-compose.yml
echo   filmrecs-network: >> fixed-docker-compose.yml
echo     driver: bridge >> fixed-docker-compose.yml
echo. >> fixed-docker-compose.yml
echo volumes: >> fixed-docker-compose.yml
echo   filmrecs-db-data: >> fixed-docker-compose.yml

rem Step 3: Create fixed nginx.conf
echo Creating nginx.conf...
echo server { > fixed-nginx.conf
echo     listen 80; >> fixed-nginx.conf
echo     server_name localhost; >> fixed-nginx.conf
echo     root /usr/share/nginx/html; >> fixed-nginx.conf
echo     index index.html; >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Enable gzip compression >> fixed-nginx.conf
echo     gzip on; >> fixed-nginx.conf
echo     gzip_comp_level 5; >> fixed-nginx.conf
echo     gzip_min_length 256; >> fixed-nginx.conf
echo     gzip_proxied any; >> fixed-nginx.conf
echo     gzip_vary on; >> fixed-nginx.conf
echo     gzip_types >> fixed-nginx.conf
echo         application/javascript >> fixed-nginx.conf
echo         application/json >> fixed-nginx.conf
echo         application/x-javascript >> fixed-nginx.conf
echo         application/xml >> fixed-nginx.conf
echo         image/svg+xml >> fixed-nginx.conf
echo         text/css >> fixed-nginx.conf
echo         text/javascript >> fixed-nginx.conf
echo         text/plain >> fixed-nginx.conf
echo         text/xml; >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # API proxy configuration >> fixed-nginx.conf
echo     location /FilmRecomendations/ { >> fixed-nginx.conf
echo         proxy_pass http://api:5291/FilmRecomendations/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Add lowercase version >> fixed-nginx.conf
echo     location /filmrecomendations/ { >> fixed-nginx.conf
echo         proxy_pass http://api:5291/FilmRecomendations/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Swagger proxy configuration >> fixed-nginx.conf
echo     location /swagger/ { >> fixed-nginx.conf
echo         proxy_pass http://api:5291/swagger/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     location /api/ { >> fixed-nginx.conf
echo         proxy_pass http://api:5291/api/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Enable CORS >> fixed-nginx.conf
echo     add_header 'Access-Control-Allow-Origin' '*' always; >> fixed-nginx.conf
echo     add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always; >> fixed-nginx.conf
echo     add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always; >> fixed-nginx.conf
echo     add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always; >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Handle OPTIONS method for CORS preflight requests >> fixed-nginx.conf
echo     if ($request_method = 'OPTIONS') { >> fixed-nginx.conf
echo         add_header 'Access-Control-Allow-Origin' '*'; >> fixed-nginx.conf
echo         add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE'; >> fixed-nginx.conf
echo         add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization'; >> fixed-nginx.conf
echo         add_header 'Access-Control-Max-Age' 1728000; >> fixed-nginx.conf
echo         add_header 'Content-Type' 'text/plain; charset=utf-8'; >> fixed-nginx.conf
echo         add_header 'Content-Length' 0; >> fixed-nginx.conf
echo         return 204; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Handle single page application routing >> fixed-nginx.conf
echo     location / { >> fixed-nginx.conf
echo         try_files $uri $uri/ /index.html; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Cache static assets >> fixed-nginx.conf
echo     location ~* \.(jpg^|jpeg^|png^|gif^|ico^|css^|js^|svg)$ { >> fixed-nginx.conf
echo         expires 30d; >> fixed-nginx.conf
echo         add_header Cache-Control "public, no-transform"; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Error pages >> fixed-nginx.conf
echo     error_page 404 /index.html; >> fixed-nginx.conf
echo     error_page 500 502 503 504 /50x.html; >> fixed-nginx.conf
echo     location = /50x.html { >> fixed-nginx.conf
echo         root /usr/share/nginx/html; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo } >> fixed-nginx.conf

rem Step 4: Create deployment script for homelab
echo Creating deployment script...
echo #!/bin/sh > deploy-script.sh
echo cd %REMOTE_DIR% >> deploy-script.sh
echo docker-compose down >> deploy-script.sh
echo docker-compose up -d >> deploy-script.sh
echo echo "Deployment completed on homelab" >> deploy-script.sh

rem Step 5: Copy files to homelab
echo Copying files to homelab...
docker run --rm -v "%cd%\fixed-docker-compose.yml:/tmp/docker-compose.yml" alpine cat /tmp/docker-compose.yml > temp-docker-compose.yml
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/docker-compose.yml" < temp-docker-compose.yml
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/docker-compose.yml /dest/docker-compose.yml"

docker run --rm -v "%cd%\fixed-nginx.conf:/tmp/nginx.conf" alpine cat /tmp/nginx.conf > temp-nginx.conf
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/nginx.conf" < temp-nginx.conf
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/nginx.conf /dest/nginx.conf"

docker run --rm -v "%cd%\.env:/tmp/.env" alpine cat /tmp/.env > temp-env
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/.env" < temp-env
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/.env /dest/.env"

docker run --rm -v "%cd%\deploy-script.sh:/tmp/deploy-script.sh" alpine cat /tmp/deploy-script.sh > temp-deploy-script.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/deploy-script.sh" < temp-deploy-script.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/deploy-script.sh /dest/deploy-script.sh && chmod +x /dest/deploy-script.sh"

rem Step 6: Run deployment script on homelab
echo Running deployment script on homelab...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v %REMOTE_DIR%:/app alpine sh -c "cd /app && sh ./deploy-script.sh"

rem Cleanup temporary files
del fixed-docker-compose.yml
del fixed-nginx.conf
del deploy-script.sh
del temp-docker-compose.yml
del temp-nginx.conf
del temp-env
del temp-deploy-script.sh

echo ======================================================
echo  Deployment completed successfully!
echo ======================================================
echo Your application should be accessible at:
echo - Frontend: http://%HOMELAB_IP%:5173
echo - API: http://%HOMELAB_IP%:5291
echo - Swagger: http://%HOMELAB_IP%:5291/swagger
echo.
echo To check container status, run:
echo docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 ps
echo.
echo To view API logs, run:
echo docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 logs api
echo.
pause