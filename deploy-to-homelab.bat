@echo off
echo Deploying Film Recommendations to homelab (192.168.1.10)...

rem Get the directory where the batch file is located
set SCRIPT_DIR=%~dp0
echo Script directory: %SCRIPT_DIR%

rem Convert Windows path to WSL path with lowercase drive letter
set DRIVE_LETTER=%SCRIPT_DIR:~0,1%
call :tolower DRIVE_LETTER_LOWER %DRIVE_LETTER%

set WSL_PATH=/mnt/%DRIVE_LETTER_LOWER%/%SCRIPT_DIR:~3,-1%
set WSL_PATH=%WSL_PATH:\=/%
echo WSL path: %WSL_PATH%

rem Check if WSL is installed
wsl --list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Error: WSL is not installed or not available. Please install WSL first.
  pause
  exit /b 1
)

rem Create a simplified deployment script
echo Creating simplified deployment script...
echo @echo off > simplified-deploy.bat
echo echo Deploying to homelab... >> simplified-deploy.bat
echo wsl bash -c "ssh manu@192.168.1.10 'mkdir -p /home/manu/film-recommendations'" >> simplified-deploy.bat
echo wsl bash -c "scp '%SCRIPT_DIR%docker-compose.homelab.yml' manu@192.168.1.10:/home/manu/film-recommendations/docker-compose.yml" >> simplified-deploy.bat 
echo wsl bash -c "scp '%SCRIPT_DIR%.env' manu@192.168.1.10:/home/manu/film-recommendations/.env" >> simplified-deploy.bat
echo wsl bash -c "scp '%SCRIPT_DIR%FilmRecommendations.Frontend\homelab.nginx.conf' manu@192.168.1.10:/home/manu/film-recommendations/nginx.conf" >> simplified-deploy.bat
echo wsl bash -c "ssh manu@192.168.1.10 'cd /home/manu/film-recommendations && docker-compose down && docker-compose pull && docker-compose up -d'" >> simplified-deploy.bat
echo echo Deployment completed! >> simplified-deploy.bat
echo echo. >> simplified-deploy.bat
echo echo Your application should be accessible at: >> simplified-deploy.bat
echo echo - Frontend: http://192.168.1.10:5173 >> simplified-deploy.bat
echo echo - API: http://192.168.1.10:5291 >> simplified-deploy.bat
echo echo - Swagger: http://192.168.1.10:5291/swagger >> simplified-deploy.bat
echo pause >> simplified-deploy.bat

echo Running simplified deployment...
call simplified-deploy.bat

del simplified-deploy.bat
exit /b 0

:tolower
set %1=%2
if "%2"=="A" set %1=a
if "%2"=="B" set %1=b
if "%2"=="C" set %1=c
if "%2"=="D" set %1=d
if "%2"=="E" set %1=e
if "%2"=="F" set %1=f
if "%2"=="G" set %1=g
if "%2"=="H" set %1=h
if "%2"=="I" set %1=i
if "%2"=="J" set %1=j
if "%2"=="K" set %1=k
if "%2"=="L" set %1=l
if "%2"=="M" set %1=m
if "%2"=="N" set %1=n
if "%2"=="O" set %1=o
if "%2"=="P" set %1=p
if "%2"=="Q" set %1=q
if "%2"=="R" set %1=r
if "%2"=="S" set %1=s
if "%2"=="T" set %1=t
if "%2"=="U" set %1=u
if "%2"=="V" set %1=v
if "%2"=="W" set %1=w
if "%2"=="X" set %1=x
if "%2"=="Y" set %1=y
if "%2"=="Z" set %1=z
goto :eof