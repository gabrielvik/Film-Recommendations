@echo off 
echo Deploying to homelab... 
wsl bash -c "ssh manu@192.168.1.10 'mkdir -p /home/manu/film-recommendations'" 
wsl bash -c "scp 'D:\Examensarbete\Film-Recommendations\docker-compose.homelab.yml' manu@192.168.1.10:/home/manu/film-recommendations/docker-compose.yml"  
wsl bash -c "scp 'D:\Examensarbete\Film-Recommendations\.env' manu@192.168.1.10:/home/manu/film-recommendations/.env" 
wsl bash -c "scp 'D:\Examensarbete\Film-Recommendations\FilmRecommendations.Frontend\homelab.nginx.conf' manu@192.168.1.10:/home/manu/film-recommendations/nginx.conf" 
wsl bash -c "ssh manu@192.168.1.10 'cd /home/manu/film-recommendations && docker-compose down && docker-compose pull && docker-compose up -d'" 
echo Deployment completed! 
echo. 
echo Your application should be accessible at: 
echo - Frontend: http://192.168.1.10:5173 
echo - API: http://192.168.1.10:5291 
echo - Swagger: http://192.168.1.10:5291/swagger 
pause 
