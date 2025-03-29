@echo off
echo Creating Frontend Configuration Fix

set HOMELAB_IP=192.168.1.10
set REMOTE_DIR=/home/manu/film-recommendations

rem Create frontend environment config
echo Creating API configuration override...
echo window.apiBaseUrl = 'http://192.168.1.10:5292'; > api-config.js

rem Copy to container
echo Copying configuration to frontend container...
docker run --rm -v "%cd%\api-config.js:/tmp/api-config.js" alpine cat /tmp/api-config.js > temp-config.js
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/api-config.js" < temp-config.js
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 cp /tmp/api-config.js filmrecs-frontend:/usr/share/nginx/html/api-config.js

rem Create insert script for the container
echo Creating configuration insertion script...
echo #!/bin/sh > insert-script.sh
echo cd /usr/share/nginx/html >> insert-script.sh
echo grep -l '/FilmRecomendations/' *.js | xargs grep -l 'fetch(' | xargs sed -i 's|fetch(`/FilmRecomendations/|fetch(`${window.apiBaseUrl}/FilmRecomendations/|g' >> insert-script.sh
echo awk 'BEGIN{print "<script src=\"/api-config.js\"></script>"}1' index.html > index.html.new >> insert-script.sh
echo mv index.html.new index.html >> insert-script.sh
echo echo "Frontend configuration updated" >> insert-script.sh

rem Copy and run insert script
echo Running configuration update in container...
docker run --rm -v "%cd%\insert-script.sh:/tmp/insert-script.sh" alpine cat /tmp/insert-script.sh > temp-script.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 run --rm -v /tmp:/tmp alpine sh -c "cat > /tmp/insert-script.sh" < temp-script.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 cp /tmp/insert-script.sh filmrecs-frontend:/tmp/insert-script.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 exec filmrecs-frontend sh -c "chmod +x /tmp/insert-script.sh && /tmp/insert-script.sh"

rem Cleanup
del api-config.js
del temp-config.js
del insert-script.sh
del temp-script.sh

echo.
echo Frontend configuration updated!
echo The frontend application should now connect directly to the API at:
echo http://%HOMELAB_IP%:5292
echo.
echo Please try accessing your application now:
echo http://%HOMELAB_IP%:5173
echo.
pause