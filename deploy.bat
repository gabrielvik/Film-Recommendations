@echo off
echo Starting deployment of Film Recommendations Application...

echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

echo Deployment complete!
echo.
echo Application should be accessible at:
echo - Frontend: http://localhost:5173
echo - API: http://localhost:5291
echo - Database: localhost:1433
echo.
echo Press any key to exit...
pause > nul