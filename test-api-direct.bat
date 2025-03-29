@echo off
echo Testing Film Recommendations API directly...
echo.
echo Opening browser to test API endpoint...
start "" "http://192.168.1.10:5292/FilmRecomendations/GetFilmRecommendation?prompt=Christopher Nolan"
echo.
echo If this works but the frontend doesn't, there's an issue with the frontend's connection to the API.
pause
