using System.Text.Json;
using FilmRecomendations.Models.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;

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

    public async Task<MovieIdResponse> GetMovieIdAsync(string movieName, int releaseYear)
    {
        var movieResponse = new MovieIdResponse();

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
                
                // return id and poster_path of first result if found.

                // Check if any results were found
                if (results.GetArrayLength() > 0)
                {
                    // Get the first result's ID
                    if (results[0].TryGetProperty("id", out var idElement))
                    {

                        movieResponse.Id = idElement.GetInt32();
                    }
                    // Get the first result's poster path
                    if (results[0].TryGetProperty("poster_path", out var posterPathElement))
                    {
                        movieResponse.poster_path = $"https://image.tmdb.org/t/p/w500{posterPathElement.GetString()}";
                    }
                    return movieResponse;
                }
            }
            else
            {
                _logger.LogWarning($"Failed to search for movie. Status code: {response.StatusCode}");
            }
            
            return new MovieIdResponse();
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
                
                // Log the first part of the response for debugging
                _logger.LogDebug($"API Response: {content.Substring(0, Math.Min(500, content.Length))}");
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var movie = JsonSerializer.Deserialize<Movie>(content, options);
                
                // If poster path is still null, try to extract it directly
                if (movie != null && string.IsNullOrEmpty(movie.poster_path))
                {
                    using var document = JsonDocument.Parse(content);
                    if (document.RootElement.TryGetProperty("poster_path", out var posterPathElement))
                    {
                        movie.poster_path = posterPathElement.GetString();
                    }
                }
                
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

    public async Task<List<MovieTrailer>> GetMovieTrailersAsync(int movieId)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            _logger.LogInformation($"Fetching trailers for movie ID: {movieId}");
            
            // Create a request message as per the TMDB docs
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"{_httpClient.BaseAddress}movie/{movieId}/videos?api_key={apiKey}&language=en-US"),
                Headers =
                {
                    { "accept", "application/json" },
                },
            };
            
            using var response = await _httpClient.SendAsync(request);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(content);
                
                var results = document.RootElement.GetProperty("results");
                var trailers = new List<MovieTrailer>();
                
                foreach (var result in results.EnumerateArray())
                {
                    // Only include YouTube trailers or teasers
                    if ((result.TryGetProperty("type", out var typeElement) && 
                        (typeElement.GetString() == "Trailer" || typeElement.GetString() == "Teaser")) && 
                        result.TryGetProperty("site", out var siteElement) && 
                        siteElement.GetString() == "YouTube")
                    {
                        trailers.Add(new MovieTrailer
                        {
                            Id = result.TryGetProperty("id", out var idElement) ? idElement.GetString() : string.Empty,
                            Name = result.TryGetProperty("name", out var nameElement) ? nameElement.GetString() : string.Empty,
                            Key = result.TryGetProperty("key", out var keyElement) ? keyElement.GetString() : string.Empty,
                            Site = siteElement.GetString(),
                            Type = typeElement.GetString()
                        });
                    }
                }
                
                return trailers;
            }
            else
            {
                _logger.LogWarning($"Failed to fetch trailers for movie ID {movieId}. Status code: {response.StatusCode}");
                return new List<MovieTrailer>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching trailers for movie ID {movieId}");
            return new List<MovieTrailer>();
        }
    }
}