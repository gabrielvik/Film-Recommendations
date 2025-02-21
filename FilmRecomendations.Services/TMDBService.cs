using System.Text.Json;
using FilmRecomendations.Models.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace FilmRecomendations.Services;

public class TMDBService : ITMDBService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TMDBService> _logger;
    private readonly IConfiguration _configuration;

    public TMDBService(HttpClient httpClient, ILogger<TMDBService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(configuration["TMDb:BaseUrl"]);
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<int> GetMovieIdAsync(string movieName, int releaseYear)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            var searchUrl = $"search/movie?api_key={apiKey}&query={Uri.EscapeDataString(movieName)}&year={releaseYear}";
            _logger.LogInformation($"Searching for movie: {movieName} ({releaseYear})");
            
            var response = await _httpClient.GetAsync(searchUrl);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(content);
                
                var results = document.RootElement.GetProperty("results");
                
                // Check if any results were found
                if (results.GetArrayLength() > 0)
                {
                    // Get the first result's ID
                    if (results[0].TryGetProperty("id", out var idElement))
                    {
                        return idElement.GetInt32();
                    }
                }
            }
            else
            {
                _logger.LogWarning($"Failed to search for movie. Status code: {response.StatusCode}");
            }
            
            return -1; // Return -1 if no movie found
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error searching for movie: {movieName} ({releaseYear})");
            throw;
        }
    }

    public async Task<Movie?> GetMovieDetailsAsync(int movieId)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            var detailsUrl = $"movie/{movieId}?api_key={apiKey}";
            _logger.LogInformation($"Fetching details for movie ID: {movieId}");
            
            var response = await _httpClient.GetAsync(detailsUrl);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var movie = JsonSerializer.Deserialize<Movie>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                return movie;
            }
            else
            {
                _logger.LogWarning($"Failed to fetch details for movie ID {movieId}. Status code: {response.StatusCode}");
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching details for movie ID {movieId}");
            throw;
        }
    }
}