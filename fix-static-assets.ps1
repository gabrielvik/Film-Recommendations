# PowerShell script to fix static asset loading issues
Write-Host "Film Recommendations - Static Assets Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$HomelabIP = "192.168.1.10"

# Step 1: Create an updated Nginx configuration with better static file handling
Write-Host "Step 1: Creating improved Nginx configuration..." -ForegroundColor Green
$nginxConfig = @"
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Improved static asset handling
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files \$uri \$uri/ =404;
        access_log off;
    }

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

    # Disable favicon.ico 404 logging
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    # Add special handling for vite.svg
    location = /vite.svg {
        try_files \$uri \$uri/ /assets/vite.svg /images/vite.svg /index.html =404;
    }
}
"@

# Save the configuration to a file
$nginxConfig | Out-File -FilePath "improved-nginx.conf" -Encoding utf8

# Step 2: Create a shell script to update the Nginx configuration
Write-Host "Step 2: Creating shell script to update Nginx in container..." -ForegroundColor Green
$shellScript = @"
#!/bin/sh
echo 'Backing up original config...'
cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
echo 'Copying new configuration...'
cat /tmp/improved-nginx.conf > /etc/nginx/conf.d/default.conf
echo 'Listing static assets directory...'
find /usr/share/nginx/html -type f | grep -E '\.(js|css|svg)$'
echo 'Checking for vite.svg file...'
find /usr/share/nginx/html -name "vite.svg"
echo 'Nginx configuration updated!'
"@

# Save the shell script to a file
$shellScript | Out-File -FilePath "update-nginx-assets.sh" -Encoding utf8

# Step 3: Copy the files to the container
Write-Host "Step 3: Copying files to container..." -ForegroundColor Green
docker run --rm -v "${PWD}\improved-nginx.conf:/improved-nginx.conf" docker:cli docker -H tcp://${HomelabIP}:2375 cp /improved-nginx.conf filmrecs-frontend:/tmp/improved-nginx.conf
docker run --rm -v "${PWD}\update-nginx-assets.sh:/update-nginx-assets.sh" docker:cli docker -H tcp://${HomelabIP}:2375 cp /update-nginx-assets.sh filmrecs-frontend:/tmp/update-nginx-assets.sh

# Step 4: Execute the update script in the container
Write-Host "Step 4: Executing update script in container..." -ForegroundColor Green
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 exec filmrecs-frontend sh -c "chmod +x /tmp/update-nginx-assets.sh && /tmp/update-nginx-assets.sh"

# Step 5: Create a fallback vite.svg file
Write-Host "Step 5: Creating fallback vite.svg file..." -ForegroundColor Green
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path fill="#41B883" d="M24.4 3.925H30l-14 24.15L2 3.925h10.71l3.29 5.6 3.22-5.6Z"/>
  <path fill="#41B883" d="m2 3.925 14 24.15 14-24.15h-5.6L16 18.415 7.53 3.925Z"/>
  <path fill="#35495E" d="M7.53 3.925 16 18.485l8.4-14.56h-5.18L16 9.525l-3.29-5.6Z"/>
</svg>
"@

$svgContent | Out-File -FilePath "vite.svg" -Encoding utf8
docker run --rm -v "${PWD}\vite.svg:/vite.svg" docker:cli docker -H tcp://${HomelabIP}:2375 cp /vite.svg filmrecs-frontend:/usr/share/nginx/html/vite.svg

# Step 6: Create an assets directory if it doesn't exist and copy vite.svg there too
Write-Host "Step 6: Creating assets directory and copying vite.svg there..." -ForegroundColor Green
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 exec filmrecs-frontend sh -c "mkdir -p /usr/share/nginx/html/assets && cp /usr/share/nginx/html/vite.svg /usr/share/nginx/html/assets/"

# Step 7: Restart the frontend container
Write-Host "Step 7: Restarting frontend container..." -ForegroundColor Green
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 restart filmrecs-frontend

# Step 8: Cleanup
Write-Host "Step 8: Cleaning up temporary files..." -ForegroundColor Green
Remove-Item -Path "improved-nginx.conf"
Remove-Item -Path "update-nginx-assets.sh"
Remove-Item -Path "vite.svg"

Write-Host ""
Write-Host "Static assets fix completed!" -ForegroundColor Green
Write-Host "Your application should now be accessible at:" -ForegroundColor Yellow
Write-Host "- Frontend: http://192.168.1.10:5173" -ForegroundColor Yellow
Write-Host "- API: http://192.168.1.10:5292" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please try accessing your application now." -ForegroundColor Cyan
Write-Host "If you're still having issues, try clearing your browser cache or using a different browser." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
