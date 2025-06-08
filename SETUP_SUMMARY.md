# CinematIQ Setup Summary

## ✅ What's Been Configured

### 1. Environment Variables (.env)
Created `D:\Development\CinematIQ\cinematiq-frontend\.env` with:
- ✅ TMDB API Key: `fd5222b7e0abf0fee158febdb77c93ac`
- ✅ Backend API URL: `https://localhost:7295/api`
- ✅ All necessary configuration variables

### 2. VS Code Launch Configuration
Updated `.vscode\launch.json` with:
- ✅ New "React Frontend Launch" configuration
- ✅ New compound "Run Backend and React Frontend" option
- ✅ Auto-opens browser when ready

### 3. Backend CORS Configuration
Updated `FilmRecomendations.WebApi\Program.cs`:
- ✅ Added `http://localhost:3000` for new React frontend
- ✅ Kept `http://localhost:5173` for Vite default
- ✅ Maintained Azure deployment URL

### 4. VS Code Tasks
Added `install-react-frontend` task to automatically install npm dependencies.

## 🚀 How to Start Both Backend and React Frontend

### Option 1: Using VS Code Run Configuration (Recommended)
1. Open VS Code in the project root: `D:\Development\CinematIQ`
2. Press `F5` or go to Run and Debug (Ctrl+Shift+D)
3. Select **"Run Backend and React Frontend"** from the dropdown
4. Click the play button or press F5

### Option 2: Manual Terminal Commands
**Terminal 1 - Backend:**
```bash
cd "D:\Development\CinematIQ\FilmRecomendations.WebApi"
dotnet run
```

**Terminal 2 - React Frontend:**
```bash
cd "D:\Development\CinematIQ\cinematiq-frontend"
npm install  # First time only
npm run dev
```

## 🌐 URLs After Starting
- **React Frontend**: http://localhost:3000
- **Backend API**: https://localhost:7295
- **Swagger UI**: https://localhost:7295/swagger

## 🔑 API Keys Available
All keys are automatically loaded from User Secrets:
- ✅ TMDB API Key
- ✅ OpenAI API Key  
- ✅ Grok API Key
- ✅ JWT Configuration
- ✅ Database Connection String

## 📁 Project Structure
```
D:\Development\CinematIQ\
├── cinematiq-frontend\          # ← New React Frontend (TypeScript + Vite)
├── FilmRecommendations.Frontend\ # ← Old Frontend
├── FilmRecomendations.WebApi\   # ← .NET Backend API
└── .vscode\                     # ← VS Code configurations
```

## 🔧 Key Configuration Files
- `cinematiq-frontend\.env` - Environment variables
- `.vscode\launch.json` - Run configurations  
- `.vscode\tasks.json` - Build tasks
- `FilmRecomendations.WebApi\Program.cs` - CORS and API config

## 🎯 Next Steps
1. **Start the application** using the VS Code run configuration
2. **Test the connection** - Frontend should connect to backend API
3. **Verify TMDB integration** - Movie data should load properly
4. **Check authentication** - Login/register should work with JWT tokens

## 📝 Notes
- The new React frontend uses port 3000 (configured in vite.config.ts)
- CORS is configured to allow both old (5173) and new (3000) frontend ports
- All API keys are securely stored in User Secrets
- Environment variables are properly configured for the React app
