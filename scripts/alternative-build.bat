@echo off
echo ======================================
echo    CinematIQ - .NET SDK Workaround
echo ======================================
echo.
echo Trying multiple approaches to fix the .NET SDK issue...
echo.

cd /d "D:\Development\CinematIQ"

echo Method 1: Setting environment variables...
set DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
set DOTNET_CLI_TELEMETRY_OPTOUT=true
set NUGET_PACKAGES=%USERPROFILE%\.nuget\packages

echo.
echo Method 2: Cleaning everything...
rmdir /s /q "FilmRecomendations.WebApi\bin" 2>nul
rmdir /s /q "FilmRecomendations.WebApi\obj" 2>nul
rmdir /s /q "FilmRecomendations.Db\bin" 2>nul
rmdir /s /q "FilmRecomendations.Db\obj" 2>nul
rmdir /s /q "FilmRecomendations.Models\bin" 2>nul
rmdir /s /q "FilmRecomendations.Models\obj" 2>nul
rmdir /s /q "FilmRecomendations.Services\bin" 2>nul
rmdir /s /q "FilmRecomendations.Services\obj" 2>nul

echo.
echo Method 3: Trying msbuild instead of dotnet...
msbuild "Film Recommendations.sln" /p:Configuration=Debug

if %errorlevel% neq 0 (
    echo.
    echo MSBuild failed. Trying alternative approach...
    echo.
    
    echo Method 4: Individual project builds...
    cd FilmRecomendations.Models
    dotnet build --verbosity minimal
    cd ..\FilmRecomendations.Db  
    dotnet build --verbosity minimal
    cd ..\FilmRecomendations.Services
    dotnet build --verbosity minimal
    cd ..\FilmRecomendations.WebApi
    dotnet build --verbosity minimal
) else (
    echo.
    echo MSBuild succeeded! Starting backend...
    cd FilmRecomendations.WebApi
    dotnet run --urls="http://localhost:5291"
)

pause
