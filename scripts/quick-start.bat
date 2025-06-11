@echo off
echo ======================================
echo       CinematIQ Quick Start
echo ======================================
echo.
echo This script will start both backend and frontend
echo.
echo 1. Starting Backend API on http://localhost:5291
start "CinematIQ Backend" cmd /k "cd /d D:\Development\CinematIQ\FilmRecomendations.WebApi && dotnet run --urls=http://localhost:5291"
echo.
echo Waiting 10 seconds for backend to initialize...
timeout /t 10 /nobreak
echo.
echo 2. Starting Frontend on http://localhost:5173
start "CinematIQ Frontend" cmd /k "cd /d D:\Development\CinematIQ\FilmRekommendations.React && npm run dev"
echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:5291
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause