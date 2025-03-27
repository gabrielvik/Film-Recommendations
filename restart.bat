@echo off
echo Stopping and removing containers...
docker-compose down

echo Building and starting containers with the updated configuration...
docker-compose build --no-cache
docker-compose up -d

echo Containers restarted!
echo You can access:
echo - Frontend: http://localhost:5173
echo - API: http://localhost:5291
echo - Swagger: http://localhost:5291/swagger

pause
