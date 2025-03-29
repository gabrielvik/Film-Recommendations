@echo off
echo Direct Fix for Film Recommendations Application
echo ==============================================

set HOMELAB_IP=192.168.1.10

echo Step 1: Creating API configuration script...
echo "window.apiBaseUrl = 'http://192.168.1.10:5292';" > api-config.js

echo Step 2: Copying configuration to frontend container...
docker run --rm -v "%cd%\api-config.js:/api-config.js" docker:cli docker -H tcp://%HOMELAB_IP%:2375 cp /api-config.js filmrecs-frontend:/usr/share/nginx/html/api-config.js

echo Step 3: Create HTML update script...
echo "#!/bin/sh
cd /usr/share/nginx/html
sed -i 's|</head>|<script>window.apiBaseUrl = \"http://192.168.1.10:5292\";</script></head>|' index.html
echo 'Added API configuration to index.html'
" > update-html.sh

echo Step 4: Executing update...
docker run --rm -v "%cd%\update-html.sh:/update-html.sh" docker:cli docker -H tcp://%HOMELAB_IP%:2375 cp /update-html.sh filmrecs-frontend:/update-html.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 exec filmrecs-frontend sh -c "chmod +x /update-html.sh && /update-html.sh"

echo Step 5: Create JavaScript patching script...
echo "#!/bin/sh
cd /usr/share/nginx/html
for file in *.js; do
  sed -i 's|/FilmRecomendations/|window.apiBaseUrl + \"/FilmRecomendations/\"|g' \$file
  echo \"Updated \$file\"
done
echo 'JavaScript files updated to use apiBaseUrl'
" > patch-js.sh

echo Step 6: Executing JavaScript patch...
docker run --rm -v "%cd%\patch-js.sh:/patch-js.sh" docker:cli docker -H tcp://%HOMELAB_IP%:2375 cp /patch-js.sh filmrecs-frontend:/patch-js.sh
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 exec filmrecs-frontend sh -c "chmod +x /patch-js.sh && /patch-js.sh"

echo Step 7: Restarting frontend container...
docker run --rm docker:cli docker -H tcp://%HOMELAB_IP%:2375 restart filmrecs-frontend

echo Step 8: Cleanup temporary files...
del api-config.js
del update-html.sh
del patch-js.sh

echo.
echo Fix completed!
echo Your application should now be accessible at:
echo - Frontend: http://%HOMELAB_IP%:5173
echo - API: http://%HOMELAB_IP%:5292
echo.
echo Please try accessing your application now.
echo.
pause