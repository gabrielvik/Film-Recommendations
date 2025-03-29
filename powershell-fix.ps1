# PowerShell script to fix Film Recommendations application
Write-Host "PowerShell Fix for Film Recommendations Application" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$HomelabIP = "192.168.1.10"

# Step 1: Create Nginx configuration
Write-Host "Step 1: Creating new Nginx configuration..." -ForegroundColor Green
$nginxConfig = @"
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
"@

# Save the configuration to a file
$nginxConfig | Out-File -FilePath "new-nginx.conf" -Encoding utf8

# Step 2: Create a shell script to update the Nginx configuration
Write-Host "Step 2: Creating shell script to update Nginx in container..." -ForegroundColor Green
$shellScript = @"
#!/bin/sh
echo 'Backing up original config...'
cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
echo 'Copying new configuration...'
cat /tmp/new-nginx.conf > /etc/nginx/conf.d/default.conf
echo 'Nginx configuration updated!'
"@

# Save the shell script to a file
$shellScript | Out-File -FilePath "update-nginx.sh" -Encoding utf8

# Step 3: Copy the files to the container
Write-Host "Step 3: Copying files to container..." -ForegroundColor Green
docker run --rm -v "${PWD}\new-nginx.conf:/new-nginx.conf" docker:cli docker -H tcp://${HomelabIP}:2375 cp /new-nginx.conf filmrecs-frontend:/tmp/new-nginx.conf
docker run --rm -v "${PWD}\update-nginx.sh:/update-nginx.sh" docker:cli docker -H tcp://${HomelabIP}:2375 cp /update-nginx.sh filmrecs-frontend:/tmp/update-nginx.sh

# Step 4: Execute the update script in the container
Write-Host "Step 4: Executing update script in container..." -ForegroundColor Green
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 exec filmrecs-frontend sh -c "chmod +x /tmp/update-nginx.sh && /tmp/update-nginx.sh"

# Step 5: Restart the frontend container
Write-Host "Step 5: Restarting frontend container..." -ForegroundColor Green
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 restart filmrecs-frontend

# Step 6: Cleanup
Write-Host "Step 6: Cleaning up temporary files..." -ForegroundColor Green
Remove-Item -Path "new-nginx.conf"
Remove-Item -Path "update-nginx.sh"

Write-Host ""
Write-Host "Fix completed!" -ForegroundColor Green
Write-Host "Your application should now be accessible at:" -ForegroundColor Yellow
Write-Host "- Frontend: http://${HomelabIP}:5173" -ForegroundColor Yellow
Write-Host "- API: http://${HomelabIP}:5292" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please try accessing your application now." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
