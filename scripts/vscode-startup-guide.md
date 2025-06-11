# VS Code Startup Guide for CinematIQ

## ✅ Good News - Your Configuration is Correct!

Your VS Code launch configurations are properly set up and will use the correct ports:

### Backend Configuration
- **Port**: 5291 (from launchSettings.json)
- **API Keys**: ✅ All configured via User Secrets
- **Configuration**: ".NET Core Launch (web)" 

### Frontend Configuration  
- **Port**: 5173 (Vite default)
- **API Endpoint**: ✅ Fixed to http://localhost:5291/api
- **Configuration**: "React Frontend Launch"

## 🚀 Recommended VS Code Startup Methods

### Option 1: Compound Launch (Recommended)
1. Open VS Code in your CinematIQ folder
2. Press `F5` or go to Run > Start Debugging
3. Select **"Run Backend and React Frontend"**
4. This starts both backend and frontend simultaneously

### Option 2: Manual Sequential Start
1. Start Backend: Select ".NET Core Launch (web)" and press F5
2. Wait for backend to fully start (watch terminal)
3. Start Frontend: Select "React Frontend Launch" and press F5

## 📋 Your API Keys Status
✅ **TMDb**: Configured  
✅ **OpenAI**: Configured  
✅ **JWT**: Configured  
✅ **GROK**: Configured  
✅ **Database**: LocalDB configured

## 🌐 Application URLs
- **Backend API**: http://localhost:5291
- **Swagger Documentation**: http://localhost:5291/swagger  
- **Frontend**: http://localhost:5173

## 🔧 If You Still Get Connection Errors

1. **Check Database**: Run this in terminal:
   ```bash
   cd FilmRecomendations.WebApi
   dotnet ef database update
   ```

2. **Verify Backend Started**: Look for this message in VS Code terminal:
   ```
   Now listening on: http://localhost:5291
   ```

3. **Check Browser Console**: Should now connect to correct port (5291)

## 🎯 Your VS Code Setup is Ready!
The configurations in your launch.json are correct and will use the proper ports. Just use the compound configuration "Run Backend and React Frontend" for the easiest startup experience.
