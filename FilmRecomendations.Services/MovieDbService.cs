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

    public Task<List<Movie>> GetMovieDetails(List<int> movieIds)
    {
        throw new NotImplementedException();
    }
}