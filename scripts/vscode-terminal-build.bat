@echo off
echo ======================================
echo    CinematIQ - Terminal Build Fix
echo ======================================
echo.
echo Cleaning and rebuilding from terminal...
echo.

REM Clear all bin/obj folders
echo Cleaning build artifacts...
for /d /r . %%d in (bin,obj) do @if exist "%%d" rd /s /q "%%d"

echo.
echo Setting environment variables...
set DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
set DOTNET_CLI_TELEMETRY_OPTOUT=true

echo.
echo Building each project individually...

echo Building Models...
cd FilmRecomendations.Models
dotnet build --configuration Debug --verbosity quiet
if %errorlevel% neq 0 goto :error

echo Building Database...
cd ..\FilmRecomendations.Db
dotnet build --configuration Debug --verbosity quiet  
if %errorlevel% neq 0 goto :error

echo Building Services...
cd ..\FilmRecomendations.Services
dotnet build --configuration Debug --verbosity quiet
if %errorlevel% neq 0 goto :error

echo Building WebAPI...
cd ..\FilmRecomendations.WebApi
dotnet build --configuration Debug --verbosity quiet
if %errorlevel% neq 0 goto :error

echo.
echo ✅ Build successful! Starting backend...
echo Backend will run on: http://localhost:5291
echo.
dotnet run --urls="http://localhost:5291"
goto :end

:error
echo.
echo ❌ Build failed. Trying alternative method...
echo.
cd ..
dotnet build "Film Recommendations.sln" --configuration Debug --verbosity detailed

:end
pause
