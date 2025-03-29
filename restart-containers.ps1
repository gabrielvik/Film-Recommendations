# PowerShell script to restart containers and fix static assets
Write-Host "Film Recommendations - Complete Fix" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$HomelabIP = "192.168.1.10"

# Check container status
Write-Host "Step 1: Checking container status..." -ForegroundColor Green
$containers = docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 ps
Write-Host $containers

# Restart all containers in correct order
Write-Host "Step 2: Restarting all containers..." -ForegroundColor Green
Write-Host "Stopping containers..." -ForegroundColor Yellow
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 stop filmrecs-frontend filmrecs-api filmrecs-db

Write-Host "Starting containers in order..." -ForegroundColor Yellow
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 start filmrecs-db
Write-Host "Database started. Waiting 10 seconds for initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 start filmrecs-api
Write-Host "API started. Waiting 5 seconds for initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 start filmrecs-frontend
Write-Host "Frontend started." -ForegroundColor Yellow

# Check container status again
Write-Host "Step 3: Verifying container status..." -ForegroundColor Green
$containers = docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 ps
Write-Host $containers

# Create direct container access script
Write-Host "Step 4: Creating direct container access script..." -ForegroundColor Green

# Generate a script to test the API directly
$apiTestScript = @"
@echo off
echo Testing Film Recommendations API directly...
echo.
echo Opening browser to test API endpoint...
start "" "http://192.168.1.10:5292/FilmRecomendations/GetFilmRecommendation?prompt=Christopher Nolan"
echo.
echo If this works but the frontend doesn't, there's an issue with the frontend's connection to the API.
pause
"@

$apiTestScript | Out-File -FilePath "test-api-direct.bat" -Encoding ascii

Write-Host ""
Write-Host "Restart completed!" -ForegroundColor Green
Write-Host "Your application should now be accessible at:" -ForegroundColor Yellow
Write-Host "- Frontend: http://192.168.1.10:5173" -ForegroundColor Yellow
Write-Host "- API: http://192.168.1.10:5292" -ForegroundColor Yellow
Write-Host "- Swagger: http://192.168.1.10:5292/swagger" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test the API directly, run:" -ForegroundColor Cyan
Write-Host "test-api-direct.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you're still having issues, try clearing your browser cache or using a different browser." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
