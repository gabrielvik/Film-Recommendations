# Docker Deployment Guide for Film Recommendations

This guide provides troubleshooting steps for deploying the Film Recommendations application using Docker.

## Setup

1. Ensure Docker Desktop is running.
2. Make sure your `.env` file is properly configured with your API keys.

## Key Files

- `docker-compose.yml` - Container configuration
- `.env` - Environment variables (API keys, JWT settings)
- `start-debug.bat` - Script for troubleshooting builds

## Troubleshooting

### "Connection Refused" Errors

If you're seeing "Connection Refused" errors when trying to access your app:

1. First, check if containers are running:
   ```
   docker-compose ps
   ```

2. If containers aren't running, check build logs:
   ```
   docker-compose build --no-cache --progress=plain
   ```

3. If you see file not found errors, run the `start-debug.bat` script.

### Common Issues & Solutions

1. **Path Case Sensitivity**:
   - Ensure all references to project files match the actual case of files/folders.

2. **Solution File Not Found**:
   - The Dockerfile has been updated to avoid dependencies on the .sln file.

3. **Port Conflicts**:
   - Check if another process is using ports 5173, 5291, or 1433:
     ```
     netstat -ano | findstr 5173
     netstat -ano | findstr 5291
     netstat -ano | findstr 1433
     ```

4. **Docker Network Issues**:
   - Try restarting Docker Desktop if containers can see each other.

## Checking Logs

To see detailed logs for a specific container:
```
docker-compose logs frontend
docker-compose logs api
docker-compose logs db
```

## Steps If Still Not Working

1. Run `start-debug.bat` to get detailed logs
2. Check Docker settings (shared drives, resources)
3. Try removing all containers, images, and volumes:
   ```
   docker-compose down -v
   docker system prune -a
   ```
   Then rebuild with `start-debug.bat`