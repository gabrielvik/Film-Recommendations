using System.Text.Json;
using FilmRecomendations.Models.DTOs;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace FilmRecomendations.Services;

public class MovieDbService : IMovieDbService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MovieDbService> _logger;
    private readonly IConfiguration _configuration;

    public MovieDbService(IHttpClientFactory httpClientFactory, ILogger<MovieDbService> logger, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient("TMDb.WebApi");
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<List<int>> GetMovieIdsAsync(List<string> movieNames)
    {
        var movieIds = new List<int>();
        
        foreach (var movieName in movieNames)
        {
            var apiKey = _configuration["TMDb:ApiKey"];
            var searchUrl = $"search/movie?api_key={apiKey}&query={Uri.EscapeDataString(movieName)}";
            _logger.LogInformation($"Searching with URL: {searchUrl}");
            
            var response = await _httpClient.GetAsync(searchUrl);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(content);
                
                var results = document.RootElement.GetProperty("results");
                
                foreach (var result in results.EnumerateArray())
                {
                    if (result.TryGetProperty("id", out var idElement))
                    {
                        movieIds.Add(idElement.GetInt32());
                    }
                }
            }
        }
        
        return movieIds;
    }

    public async Task<List<Movie>> GetMovieDetails(List<int> movieIds)
    {
        var movies = new List<Movie>();
        
        foreach (var movieId in movieIds)
        {
            try
            {
                var apiKey = _configuration["TMDb:ApiKey"];
                var detailsUrl = $"movie/{movieId}?api_key={apiKey}";
                _logger.LogInformation($"Fetching movie details with URL: {detailsUrl}");
                
                var response = await _httpClient.GetAsync(detailsUrl);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var movie = JsonSerializer.Deserialize<Movie>(content, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    
                    if (movie != null)
                    {
                        movies.Add(movie);
                    }
                }
                else
                {
                    _logger.LogWarning($"Failed to fetch details for movie ID {movieId}. Status code: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching details for movie ID {movieId}");
                // Continue with the next movie instead of failing the entire request
                continue;
            }
        }
        
        return movies;
    }
}