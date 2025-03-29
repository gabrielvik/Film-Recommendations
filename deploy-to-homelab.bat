@echo off
echo Deploying Film Recommendations to homelab (192.168.1.10)...

rem Get the directory where the batch file is located
set SCRIPT_DIR=%~dp0
echo Script directory: %SCRIPT_DIR%

rem Convert Windows path to WSL path
set WSL_PATH=/mnt/%SCRIPT_DIR:~0,1%/%SCRIPT_DIR:~3,-1%
set WSL_PATH=%WSL_PATH:\=/%
echo WSL path: %WSL_PATH%

rem Make bash script executable and run it from the correct directory
wsl bash -c "chmod +x %WSL_PATH%/deploy-to-homelab.sh && cd %WSL_PATH% && ./deploy-to-homelab.sh"

if %ERRORLEVEL% NEQ 0 (
  echo Deployment failed with error code %ERRORLEVEL%
  pause
  exit /b %ERRORLEVEL%
)

echo Deployment completed successfully!
echo.
echo Your application should be accessible at:
echo - Frontend: http://192.168.1.10:5173
echo - API: http://192.168.1.10:5291
echo - Swagger: http://192.168.1.10:5291/swagger
echo.
pause