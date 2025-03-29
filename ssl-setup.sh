#!/bin/bash

# This script sets up SSL/TLS certificates with Let's Encrypt

# Set your domain name
DOMAIN="filmrecs.example.com"  # Replace with your actual domain

# Install certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Stop nginx temporarily
docker-compose stop nginx

# Obtain SSL certificate
certbot --standalone -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com --http-01-port 80

# Create SSL certificate directory
mkdir -p ./nginx/ssl

# Copy certificates
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/

# Update nginx configuration to use SSL
cat > ./nginx/nginx.conf << EOL
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://api:5291/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /swagger/ {
        proxy_pass http://api:5291/swagger/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOL

# Update nginx Dockerfile to include SSL certificates
cat > ./nginx/Dockerfile << EOL
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ssl /etc/nginx/ssl

EXPOSE 80
EXPOSE 443
EOL

# Rebuild and restart nginx
docker-compose build nginx
docker-compose up -d nginx

# Set up automatic renewal
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker-compose restart nginx") | crontab -

echo "SSL setup complete for $DOMAIN"
