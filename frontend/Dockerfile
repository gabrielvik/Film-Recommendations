FROM node:18-alpine

WORKDIR /app

# Copy package.json files and install dependencies
COPY FilmRecommendations.Frontend/package*.json ./
RUN npm install

# Copy frontend source code
COPY FilmRecommendations.Frontend/ ./

# Expose port 5173 (Vite default)
EXPOSE 5173

# Start development server with host set to 0.0.0.0 to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]