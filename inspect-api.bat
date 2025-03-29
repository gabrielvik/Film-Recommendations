@echo off
echo Inspecting Film Recommendations API
echo ==================================
echo.

set HOMELAB_IP=192.168.1.10

:menu
echo Choose an option:
echo 1. Check API routes (Swagger JSON)
echo 2. Test API connection directly
echo 3. Test API through frontend
echo 4. Inspect API container
echo 5. Test API health
echo 6. View API logs
echo 7. View frontend-to-API network
echo 0. Exit
echo.

set /p choice=Enter your choice (0-7): 

if "%choice%"=="1" goto routes
if "%choice%"=="2" goto test_direct
if "%choice%"=="3" goto test_frontend
if "%choice%"=="4" goto inspect
if "%choice%"=="5" goto health
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto network
if "%choice%"=="0" goto end

echo Invalid choice. Please try again.
goto menu

:routes
echo.
echo API Routes (Swagger JSON):
echo -------------------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -s http://api:5291/swagger/v1/swagger.json | grep "path"
echo.
pause
goto menu

:test_direct
echo.
echo Testing API connection directly:
echo -------------------------------
set /p route=Enter API route to test (e.g., FilmRecomendations/GetFilmRecommendation?prompt=test): 
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -v http://api:5291/%route%
echo.
pause
goto menu

:test_frontend
echo.
echo Testing API through frontend:
echo ----------------------------
set /p route=Enter route to test (e.g., FilmRecomendations/GetFilmRecommendation?prompt=test): 
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -v http://frontend/%route%
echo.
pause
goto menu

:inspect
echo.
echo Inspecting API container:
echo ------------------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 inspect api
echo.
pause
goto menu

:health
echo.
echo Testing API health:
echo -----------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -v http://api:5291/health
echo.
pause
goto menu

:logs
echo.
echo API Logs:
echo ---------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 logs api
echo.
pause
goto menu

:network
echo.
echo Network details:
echo ---------------
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 network inspect filmrecs-network
echo.
pause
goto menu

:end
echo Exiting...
exit