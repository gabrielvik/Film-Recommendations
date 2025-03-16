FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5291

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first and restore to cache dependencies
COPY ["FilmRecomendations.WebApi/FilmRecomendations.WebApi.csproj", "FilmRecomendations.WebApi/"]
COPY ["FilmRecomendations.Models/FilmRecomendations.Models.csproj", "FilmRecomendations.Models/"]
COPY ["FilmRecomendations.Services/FilmRecomendations.Services.csproj", "FilmRecomendations.Services/"]
COPY ["FilmRecomendations.Db/FilmRecomendations.Db.csproj", "FilmRecomendations.Db/"]
COPY ["Film Recommendations.sln", "./"]

RUN dotnet restore "Film Recommendations.sln"

# Copy the rest of the source code
COPY . .

# Build the API project
WORKDIR "/src/FilmRecomendations.WebApi"
RUN dotnet build "FilmRecomendations.WebApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FilmRecomendations.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set the entry point
ENTRYPOINT ["dotnet", "FilmRecomendations.WebApi.dll"]