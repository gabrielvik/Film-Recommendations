FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["FilmRecomendations.WebApi/FilmRecomendations.WebApi.csproj", "FilmRecomendations.WebApi/"]
COPY ["FilmRecomendations.Db/FilmRecomendations.Db.csproj", "FilmRecomendations.Db/"]
COPY ["FilmRecomendations.Models/FilmRecomendations.Models.csproj", "FilmRecomendations.Models/"]
COPY ["FilmRecomendations.Services/FilmRecomendations.Services.csproj", "FilmRecomendations.Services/"]
COPY ["Film Recommendations.sln", "./"]

# Restore dependencies
RUN dotnet restore "FilmRecomendations.WebApi/FilmRecomendations.WebApi.csproj"

# Copy all source files
COPY . .

# Build the application
WORKDIR "/src/FilmRecomendations.WebApi"
RUN dotnet build "FilmRecomendations.WebApi.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "FilmRecomendations.WebApi.csproj" -c Release -o /app/publish

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FilmRecomendations.WebApi.dll"]