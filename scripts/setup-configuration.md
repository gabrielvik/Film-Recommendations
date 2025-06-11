# CinematIQ Configuration Setup

## Required Configuration Steps

### 1. Backend API Keys (appsettings.json)

Edit `FilmRecomendations.WebApi/appsettings.json` and add the following:

```json
{
  "TMDb": {
    "ApiKey": "YOUR_TMDB_API_KEY",
    "Token": "YOUR_TMDB_TOKEN",
    "BaseUrl": "https://api.themoviedb.org/3/"
  },
  "OpenAI": {
    "ApiKey": "YOUR_OPENAI_API_KEY"
  },
  "Jwt": {
    "Key": "YOUR_BASE64_JWT_SECRET_KEY",
    "Issuer": "FilmRecomendationWebsite",
    "Audience": "ClientApplication"
  },
  "GROK": {
    "ApiKey": "YOUR_GROK_API_KEY"
  }
}
```

### 2. Generate JWT Secret Key

Run this PowerShell command to generate a secure JWT key:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

### 3. Database Setup

1. Ensure SQL Server LocalDB is installed
2. Run database migrations:
```bash
cd FilmRecomendations.WebApi
dotnet ef database update
```

### 4. API Keys Required

- **TMDB API Key**: Get from https://www.themoviedb.org/settings/api
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys
- **GROK API Key**: Get from Grok AI platform

### 5. CORS Configuration

The backend is already configured to allow frontend connections from:
- http://localhost:3000
- http://localhost:3001
- http://localhost:3002
- http://localhost:5173

## Startup Order

1. Start Backend: Run `scripts/start-backend.bat`
2. Start Frontend: Run `scripts/start-frontend.bat`

## Troubleshooting

- If backend fails to start, check API keys are properly set
- If database errors occur, run `dotnet ef database update`
- If CORS errors persist, ensure frontend is running on allowed ports
