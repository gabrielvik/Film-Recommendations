# PowerShell script to test all connections in Film Recommendations app
Write-Host "Film Recommendations - Connection Tester" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$HomelabIP = "192.168.1.10"

function Test-PortConnection {
    param (
        [string]$Host,
        [int]$Port,
        [string]$Description
    )
    
    $result = Test-NetConnection -ComputerName $Host -Port $Port -WarningAction SilentlyContinue
    
    if ($result.TcpTestSucceeded) {
        Write-Host "✅ Connection to $Description ($Host`:$Port) successful!" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ Cannot connect to $Description ($Host`:$Port)" -ForegroundColor Red
        return $false
    }
}

# Test connectivity to homelab
Write-Host "Step 1: Testing basic connectivity to homelab..." -ForegroundColor Green
Test-NetConnection -ComputerName $HomelabIP -InformationLevel Quiet
if ($?) {
    Write-Host "✅ Basic connectivity to homelab at $HomelabIP is working" -ForegroundColor Green
} else {
    Write-Host "❌ Cannot ping homelab at $HomelabIP - check network connectivity" -ForegroundColor Red
    exit 1
}

# Test connectivity to Docker service
Write-Host "`nStep 2: Testing Docker API connectivity..." -ForegroundColor Green
try {
    $dockerVersion = docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 version --format '{{.Server.Version}}'
    Write-Host "✅ Docker API accessible. Server version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Docker API at tcp://${HomelabIP}:2375" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test connectivity to all services
Write-Host "`nStep 3: Testing connectivity to all services..." -ForegroundColor Green
$dbConnected = Test-PortConnection -Host $HomelabIP -Port 1434 -Description "Database"
$apiConnected = Test-PortConnection -Host $HomelabIP -Port 5292 -Description "API"
$frontendConnected = Test-PortConnection -Host $HomelabIP -Port 5173 -Description "Frontend"

# Check container status
Write-Host "`nStep 4: Checking container status..." -ForegroundColor Green
$containers = docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 ps
Write-Host $containers

# Test API endpoint directly
Write-Host "`nStep 5: Testing API endpoint directly..." -ForegroundColor Green
try {
    $apiTest = docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 run --rm curlimages/curl:latest curl -s -o /dev/null -w "%{http_code}" http://${HomelabIP}:5292/FilmRecomendations/GetFilmRecommendation?prompt=test
    
    if ($apiTest -ge 200 -and $apiTest -lt 300) {
        Write-Host "✅ API endpoint test successful! Status code: $apiTest" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API endpoint returned status code: $apiTest" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to test API endpoint" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Generate diagnostic information for report
Write-Host "`nStep 6: Generating diagnostic information..." -ForegroundColor Green

# Check logs for each container
Write-Host "`nFrontend container logs:" -ForegroundColor Yellow
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 logs --tail 20 filmrecs-frontend

Write-Host "`nAPI container logs:" -ForegroundColor Yellow
docker run --rm docker:cli docker -H tcp://${HomelabIP}:2375 logs --tail 20 filmrecs-api

# Generate a summary report
Write-Host "`n===================== DIAGNOSTIC SUMMARY =====================" -ForegroundColor Cyan
Write-Host "Database Connection: $(if ($dbConnected) {"✅ Connected"} else {"❌ Failed"})" -ForegroundColor $(if ($dbConnected) {"Green"} else {"Red"})
Write-Host "API Connection: $(if ($apiConnected) {"✅ Connected"} else {"❌ Failed"})" -ForegroundColor $(if ($apiConnected) {"Green"} else {"Red"})
Write-Host "Frontend Connection: $(if ($frontendConnected) {"✅ Connected"} else {"❌ Failed"})" -ForegroundColor $(if ($frontendConnected) {"Green"} else {"Red"})
Write-Host "API Endpoint Test: $(if ($apiTest -ge 200 -and $apiTest -lt 300) {"✅ Working (Status $apiTest)"} else {"⚠️ Issues (Status $apiTest)"})" -ForegroundColor $(if ($apiTest -ge 200 -and $apiTest -lt 300) {"Green"} else {"Yellow"})

# Provide recommendations based on test results
Write-Host "`nRecommendations:" -ForegroundColor Cyan
if (-not $dbConnected) {
    Write-Host "- Database connection failed. Check if the database container is running and port is accessible." -ForegroundColor Yellow
}
if (-not $apiConnected) {
    Write-Host "- API connection failed. Check if the API container is running and port is accessible." -ForegroundColor Yellow
}
if (-not $frontendConnected) {
    Write-Host "- Frontend connection failed. Check if the frontend container is running and port is accessible." -ForegroundColor Yellow
}
if ($apiTest -lt 200 -or $apiTest -ge 300) {
    Write-Host "- API endpoint test failed with status $apiTest. Check API logs for more details." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Try running restart-containers.ps1 to restart all containers in the correct order." -ForegroundColor White
Write-Host "2. Try running fix-static-assets.ps1 to fix any issues with static assets." -ForegroundColor White
Write-Host "3. Clear your browser cache or try a different browser." -ForegroundColor White
Write-Host "4. Check if your firewall is blocking any connections." -ForegroundColor White

Write-Host "`nConnection test completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"
