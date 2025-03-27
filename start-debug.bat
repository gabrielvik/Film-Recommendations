@echo off
echo Starting deployment with debug info...

echo Cleaning up any existing containers...
docker-compose down

echo Cleaning build cache...
docker builder prune -f

echo Building with detailed output...
docker-compose build --no-cache --progress=plain

echo Starting services...
docker-compose up -d

echo Checking container status:
docker-compose ps

echo Checking logs:
docker-compose logs

echo Deployment complete!
echo.
echo Application should be accessible at:
echo - Frontend: http://localhost:5173
echo - API: http://localhost:5291
echo - Database: localhost:1433
echo.
echo Press any key to exit...
pause > nul