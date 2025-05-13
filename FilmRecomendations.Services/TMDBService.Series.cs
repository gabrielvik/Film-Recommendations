using System.Text.Json;
using FilmRecomendations.Models.DTOs;
using FilmRecomendations.Models.DTOs.Series;
using Microsoft.Extensions.Logging;

namespace FilmRecomendations.Services;

public partial class TMDBService
{
    public async Task<SeriesIdResponse> GetSeriesIdAsync(string seriesName, int firstAirYear)
    {
        var seriesResponse = new SeriesIdResponse();

        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            var searchUrl = $"search/tv?api_key={apiKey}&query={Uri.EscapeDataString(seriesName)}&first_air_date_year={firstAirYear}";
            _logger.LogInformation($"Searching for series: {seriesName} ({firstAirYear})");

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
                        seriesResponse.Id = idElement.GetInt32();
                    }
                    // Get the first result's poster path
                    if (results[0].TryGetProperty("poster_path", out var posterPathElement))
                    {
                        seriesResponse.poster_path = $"https://image.tmdb.org/t/p/w500{posterPathElement.GetString()}";
                    }
                    return seriesResponse;
                }
            }
            else
            {
                _logger.LogWarning($"Failed to search for series. Status code: {response.StatusCode}");
            }

            return new SeriesIdResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error searching for series: {seriesName} ({firstAirYear})");
            throw;
        }
    }

    public async Task<Series> GetSeriesDetailsAsync(int seriesId)
    {
        try
        {
            // Get API key from several possible locations
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey") ?? 
                         Environment.GetEnvironmentVariable("TMDbApiKey") ?? 
                         _configuration?.GetValue<string>("TMDb:ApiKey") ?? 
                         _configuration?.GetValue<string>("TMDbApiKey");
                         
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("TMDb API key is missing - cannot fetch series details");
                throw new InvalidOperationException("TMDb API key is missing");
            }
            
            var detailsUrl = $"tv/{seriesId}?api_key={apiKey}&append_to_response=credits,videos,watch/providers";
            _logger.LogInformation($"Fetching details for series ID: {seriesId} with URL pattern: tv/{seriesId}?api_key=***&append_to_response=credits,videos,watch/providers");

            // Ensure the HTTP client has the correct base address
            if (_httpClient.BaseAddress == null)
            {
                _httpClient.BaseAddress = new Uri("https://api.themoviedb.org/3/");
                _logger.LogWarning("Base address was null, setting default: https://api.themoviedb.org/3/");
            }

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

                var series = JsonSerializer.Deserialize<Series>(content, options);
                _logger.LogInformation($"Successfully deserialized series data for ID: {seriesId}");

                if (series != null)
                {
                    // Log successful deserialization
                    _logger.LogInformation($"Series data: Name={series.name}, First Air Date={series.first_air_date}, Seasons={series.number_of_seasons}");
                
                    // Initialize collections if they're null to prevent null reference exceptions
                    series.Trailers = series.Trailers ?? new List<SeriesTrailer>();
                    series.Creators = series.Creators ?? new List<Creator>();
                    series.Actors = series.Actors ?? new List<Actor>();
                    
                    // If poster path is still null, try to extract it directly
                    if (string.IsNullOrEmpty(series.poster_path))
                    {
                        using var document = JsonDocument.Parse(content);
                        if (document.RootElement.TryGetProperty("poster_path", out var posterPathElement))
                        {
                            series.poster_path = posterPathElement.GetString();
                        }
                    }

                    // Fetch additional data in parallel to improve performance
                    var trailerTask = GetSeriesTrailersAsync(seriesId);
                    var streamingTask = GetSeriesStreamingProvidersAsync(seriesId);
                    var creatorsTask = GetSeriesCreatorsAsync(seriesId);
                    var actorsTask = GetSeriesActorsAsync(seriesId);

                    // Wait for all tasks to complete
                    await Task.WhenAll(trailerTask, streamingTask, creatorsTask, actorsTask);

                    // Add extension property fields
                    series.Trailers = trailerTask.Result;
                    series.StreamingProviders = streamingTask.Result;
                    series.Creators = creatorsTask.Result;
                    series.Actors = actorsTask.Result;
                }

                return series;
            }
            else
            {
                _logger.LogWarning($"Failed to fetch details for series ID {seriesId}. Status code: {response.StatusCode}");
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching details for series ID {seriesId}");
            throw;
        }
    }

    public async Task<StreamingProviderResponse> GetSeriesStreamingProvidersAsync(int seriesId)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("TMDB API key is missing.");
                throw new InvalidOperationException("TMDB API key is missing.");
            }

            var requestUrl = $"tv/{seriesId}/watch/providers?api_key={apiKey}";
            _logger.LogInformation($"Fetching streaming providers for series ID: {seriesId}");

            var response = await _httpClient.GetAsync(requestUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"Failed to fetch streaming providers for series ID {seriesId}. Status code: {response.StatusCode}");
                return new StreamingProviderResponse
                {
                    Id = seriesId,
                    Results = new Dictionary<string, CountryProviders>()
                };
            }

            var content = await response.Content.ReadAsStringAsync();
            _logger.LogDebug($"API Response: {content.Substring(0, Math.Min(500, content.Length))}");

            var providerResponse = new StreamingProviderResponse { Id = seriesId };
            var results = new Dictionary<string, CountryProviders>();

            using var document = JsonDocument.Parse(content);
            if (document.RootElement.TryGetProperty("results", out var resultsElement) &&
                resultsElement.TryGetProperty("SE", out var seElement))
            {
                var countryProviders = new CountryProviders
                {
                    Flatrate = ParseProviders(seElement, "flatrate"),
                    Rent = ParseProviders(seElement, "rent"),
                    Buy = ParseProviders(seElement, "buy")
                };
                results["SE"] = countryProviders;
            }

            providerResponse.Results = results;
            return providerResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching streaming providers for series ID {seriesId}");
            throw;
        }
    }

    public async Task<List<SeriesTrailer>> GetSeriesTrailersAsync(int seriesId)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            _logger.LogInformation($"Fetching trailers for series ID: {seriesId}");

            // Create a request message as per the TMDB docs
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"{_httpClient.BaseAddress}tv/{seriesId}/videos?api_key={apiKey}&language=en-US"),
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
                var trailers = new List<SeriesTrailer>();

                foreach (var result in results.EnumerateArray())
                {
                    // Only include YouTube trailers or teasers
                    if ((result.TryGetProperty("type", out var typeElement) &&
                        (typeElement.GetString() == "Trailer" || typeElement.GetString() == "Teaser")) &&
                        result.TryGetProperty("site", out var siteElement) &&
                        siteElement.GetString() == "YouTube")
                    {
                        trailers.Add(new SeriesTrailer
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
                _logger.LogWarning($"Failed to fetch trailers for series ID {seriesId}. Status code: {response.StatusCode}");
                return new List<SeriesTrailer>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching trailers for series ID {seriesId}");
            return new List<SeriesTrailer>();
        }
    }

    public async Task<List<Creator>> GetSeriesCreatorsAsync(int seriesId)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            var requestUrl = $"tv/{seriesId}?api_key={apiKey}";
            _logger.LogInformation($"Fetching creators for series ID: {seriesId}");

            var response = await _httpClient.GetAsync(requestUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"Failed to fetch creators for series ID {seriesId}. Status code: {response.StatusCode}");
                return new List<Creator>();
            }

            var content = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(content);

            var creators = new List<Creator>();

            if (document.RootElement.TryGetProperty("created_by", out var createdByElement))
            {
                foreach (var item in createdByElement.EnumerateArray())
                {
                    var creator = new Creator
                    {
                        Id = item.GetProperty("id").GetInt32(),
                        Name = item.GetProperty("name").GetString(),
                        ProfilePath = item.TryGetProperty("profile_path", out var profilePathElement) 
                                    ? profilePathElement.GetString() 
                                    : null
                    };
                    creators.Add(creator);
                }
            }

            return creators;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching creators for series ID {seriesId}");
            throw;
        }
    }

    public async Task<List<Actor>> GetSeriesActorsAsync(int seriesId)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
            var requestUrl = $"tv/{seriesId}/credits?api_key={apiKey}";
            _logger.LogInformation($"Fetching actors for series ID: {seriesId}");

            var response = await _httpClient.GetAsync(requestUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"Failed to fetch actors for series ID {seriesId}. Status code: {response.StatusCode}");
                return new List<Actor>();
            }

            var content = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(content);

            var actors = new List<Actor>();

            if (document.RootElement.TryGetProperty("cast", out var castElement))
            {
                foreach (var item in castElement.EnumerateArray())
                {
                    var actor = new Actor
                    {
                        Id = item.GetProperty("id").GetInt32(),
                        Name = item.GetProperty("name").GetString(),
                        Character = item.TryGetProperty("character", out var characterElement) 
                                    ? characterElement.GetString() 
                                    : null,
                        ProfilePath = item.TryGetProperty("profile_path", out var profilePathElement) 
                                    ? profilePathElement.GetString() 
                                    : null
                    };
                    actors.Add(actor);
                }
            }

            return actors;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching actors for series ID {seriesId}");
            throw;
        }
    }
}