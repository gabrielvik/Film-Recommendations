@echo off
echo Updating Nginx configuration to match existing container setup...

rem Set variables
set HOMELAB_IP=192.168.1.10
set REMOTE_DIR=/home/manu/film-recommendations

rem Create fixed nginx.conf
echo Creating updated nginx.conf...
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
echo     # API proxy configuration - Use correct port 5292 and IP >> fixed-nginx.conf
echo     location /FilmRecomendations/ { >> fixed-nginx.conf
echo         proxy_pass http://192.168.1.10:5292/FilmRecomendations/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Add lowercase version >> fixed-nginx.conf
echo     location /filmrecomendations/ { >> fixed-nginx.conf
echo         proxy_pass http://192.168.1.10:5292/FilmRecomendations/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     # Swagger proxy configuration >> fixed-nginx.conf
echo     location /swagger/ { >> fixed-nginx.conf
echo         proxy_pass http://192.168.1.10:5292/swagger/; >> fixed-nginx.conf
echo         proxy_set_header Host $host; >> fixed-nginx.conf
echo         proxy_set_header X-Real-IP $remote_addr; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> fixed-nginx.conf
echo         proxy_set_header X-Forwarded-Proto $scheme; >> fixed-nginx.conf
echo     } >> fixed-nginx.conf
echo. >> fixed-nginx.conf
echo     location /api/ { >> fixed-nginx.conf
echo         proxy_pass http://192.168.1.10:5292/api/; >> fixed-nginx.conf
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
echo     # Cache static assets - Fix: Escape the braces and simplify pattern >> fixed-nginx.conf
echo     location ~ \.(jpg^|jpeg^|png^|gif^|ico^|css^|js^|svg)$ { >> fixed-nginx.conf
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

rem Copy nginx.conf to homelab
echo Copying nginx configuration to homelab...
docker run --rm -v "%cd%\fixed-nginx.conf:/tmp/nginx.conf" alpine cat /tmp/nginx.conf > temp-nginx.conf
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/nginx.conf" < temp-nginx.conf
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp -v %REMOTE_DIR%:/dest alpine sh -c "cp /tmp/nginx.conf /dest/nginx.conf"

rem Restart frontend container to apply new config
echo Restarting frontend container...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 restart filmrecs-frontend

rem Cleanup
del fixed-nginx.conf
del temp-nginx.conf

echo.
echo Nginx configuration updated and frontend restarted!
echo Your application should now be accessible at:
echo - Frontend: http://%HOMELAB_IP%:5173
echo - API: http://%HOMELAB_IP%:5292
echo - Swagger: http://%HOMELAB_IP%:5292/swagger
echo.
echo Please try accessing your application now.
pause