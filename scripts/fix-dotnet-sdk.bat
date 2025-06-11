@echo off
echo ======================================
echo    .NET SDK Fix for CinematIQ
echo ======================================
echo.
echo Current issue: .NET SDK 9.0.301 has a NuGet bug
echo Solution: Create global.json to use a working SDK version
echo.

cd /d "D:\Development\CinematIQ"

echo Creating global.json to force .NET 9.0.0...
echo {> global.json
echo   "sdk": {>> global.json
echo     "version": "9.0.0",>> global.json
echo     "rollForward": "latestMinor">> global.json
echo   }>> global.json
echo }>> global.json

echo.
echo global.json created. Now trying to restore and build...
echo.

dotnet --version
echo.

echo Clearing NuGet cache...
dotnet nuget locals all --clear

echo.
echo Restoring packages...
dotnet restore

echo.
echo Building solution...
dotnet build

echo.
echo If build succeeds, starting backend...
cd FilmRecomendations.WebApi
dotnet run --urls="http://localhost:5291"

pause
