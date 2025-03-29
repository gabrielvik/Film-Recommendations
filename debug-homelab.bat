@echo off
echo Film Recommendations Homelab Debugger
echo ====================================
echo.

set HOMELAB_IP=192.168.1.10

:menu
echo Choose an option:
echo 1. View container status
echo 2. View API logs
echo 3. View Frontend logs
echo 4. View DB logs
echo 5. Restart all containers
echo 6. Restart API container
echo 7. Restart Frontend container
echo 8. Test API connection
echo 9. View Nginx configuration
echo 0. Exit
echo.

set /p choice=Enter your choice (0-9): 

if "%choice%"=="1" goto status
if "%choice%"=="2" goto api_logs
if "%choice%"=="3" goto frontend_logs
if "%choice%"=="4" goto db_logs
if "%choice%"=="5" goto restart_all
if "%choice%"=="6" goto restart_api
if "%choice%"=="7" goto restart_frontend
if "%choice%"=="8" goto test_api
if "%choice%"=="9" goto view_nginx
if "%choice%"=="0" goto end

echo Invalid choice. Please try again.
goto menu

:status
echo.
echo Container Status:
echo ----------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 ps -a
echo.
pause
goto menu

:api_logs
echo.
echo API Logs:
echo ---------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 logs api
echo.
pause
goto menu

:frontend_logs
echo.
echo Frontend Logs:
echo -------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 logs frontend
echo.
pause
goto menu

:db_logs
echo.
echo Database Logs:
echo -------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 logs db
echo.
pause
goto menu

:restart_all
echo.
echo Restarting all containers...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /home/manu/film-recommendations:/app alpine sh -c "cd /app && docker-compose down && docker-compose up -d"
echo Done.
echo.
pause
goto menu

:restart_api
echo.
echo Restarting API container...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 restart api
echo Done.
echo.
pause
goto menu

:restart_frontend
echo.
echo Restarting Frontend container...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 restart frontend
echo Done.
echo.
pause
goto menu

:test_api
echo.
echo Testing API connection...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -s http://api:5291/FilmRecomendations/GetFilmRecommendation?prompt=test
echo.
echo Testing API from outside...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -s http://192.168.1.10:5291/FilmRecomendations/GetFilmRecommendation?prompt=test
echo.
pause
goto menu

:view_nginx
echo.
echo Nginx Configuration:
echo -------------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /home/manu/film-recommendations:/app alpine sh -c "cat /app/nginx.conf"
echo.
pause
goto menu

:end
echo Exiting...
exit