@echo off
echo Quick Fix for Film Recommendations Application
echo ============================================

set HOMELAB_IP=192.168.1.10

echo Step 1: Creating Nginx configuration update script...
echo "#!/bin/sh
cd /etc/nginx/conf.d
# Back up original config
cp default.conf default.conf.backup

# Create new config with correct API port
cat > default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # API proxy configuration - Using correct port 5292
    location /FilmRecomendations/ {
        proxy_pass http://192.168.1.10:5292/FilmRecomendations/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Add lowercase version
    location /filmrecomendations/ {
        proxy_pass http://192.168.1.10:5292/FilmRecomendations/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Swagger documentation
    location /swagger/ {
        proxy_pass http://192.168.1.10:5292/swagger/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API endpoint
    location /api/ {
        proxy_pass http://192.168.1.10:5292/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Handle single page application routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo 'Updated Nginx configuration'
" > update-nginx.sh

echo Step 2: Executing Nginx update...
docker run --rm -v "%cd%\update-nginx.sh:/update-nginx.sh" docker:cli docker -H tcp://%HOMELAB_IP%:2375 cp /update-nginx.sh filmrecs-frontend:/update-nginx.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 exec filmrecs-frontend sh -c "chmod +x /update-nginx.sh && /update-nginx.sh"

echo Step 3: Restarting frontend container...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 restart filmrecs-frontend

echo Step 4: Cleanup temporary files...
del update-nginx.sh

echo.
echo Fix completed!
echo Your application should now be accessible at:
echo - Frontend: http://%HOMELAB_IP%:5173
echo - API: http://%HOMELAB_IP%:5292
echo.
echo Please try accessing your application now.
echo.
pause