@echo off
echo Checking Film Recommendations API structure...

set HOMELAB_IP=192.168.1.10

rem Get Swagger JSON to analyze API structure
echo Retrieving Swagger JSON from API...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -s http://192.168.1.10:5292/swagger/v1/swagger.json > swagger.json

rem Display API routes
echo.
echo API Routes:
echo -----------
findstr /C:"\"path\"" swagger.json

rem Test GetFilmRecommendation endpoint
echo.
echo Testing Film Recommendation API...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -v http://192.168.1.10:5292/FilmRecomendations/GetFilmRecommendation?prompt=test

echo.
echo Testing with lowercase path...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm curlimages/curl:latest curl -v http://192.168.1.10:5292/filmrecomendations/GetFilmRecommendation?prompt=test

rem Create direct access script
echo.
echo Creating direct API test script...
echo @echo off > test-api-direct.bat
echo echo Testing direct API access... >> test-api-direct.bat
echo start "" "http://192.168.1.10:5292/FilmRecomendations/GetFilmRecommendation?prompt=Christopher%%20Nolan" >> test-api-direct.bat
echo echo Browser window should have opened to test API directly. >> test-api-direct.bat
echo pause >> test-api-direct.bat

rem Cleanup
del swagger.json

echo.
echo API check complete!
echo If you want to test the API directly in a browser, run:
echo test-api-direct.bat
echo.
pause