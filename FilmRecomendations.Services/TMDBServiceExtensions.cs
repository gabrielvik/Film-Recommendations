using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using FilmRecomendations.Models.DTOs;
using Microsoft.Extensions.Logging;

namespace FilmRecomendations.Services
{
    public partial class TMDBService
    {
        public async Task<TVSeriesIdResponse> GetTVSeriesIdAsync(string seriesName, int? firstAirYear = null)
        {
            var response = new TVSeriesIdResponse();

            try
            {
                var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
                string searchUrl = $"search/tv?api_key={apiKey}&query={Uri.EscapeDataString(seriesName)}";
                
                // Add year filter if provided
                if (firstAirYear.HasValue)
                {
                    searchUrl += $"&first_air_date_year={firstAirYear.Value}";
                }
                
                _logger.LogInformation($"Searching for TV series: {seriesName} {(firstAirYear.HasValue ? $"({firstAirYear})" : "")}");

                var httpResponse = await _httpClient.GetAsync(searchUrl);

                if (httpResponse.IsSuccessStatusCode)
                {
                    var content = await httpResponse.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(content);

                    var results = document.RootElement.GetProperty("results");

                    // Return id and details of first result if found
                    if (results.GetArrayLength() > 0)
                    {
                        var firstResult = results[0];
                        
                        if (firstResult.TryGetProperty("id", out var idElement))
                        {
                            response.Id = idElement.GetInt32();
                        }
                        
                        if (firstResult.TryGetProperty("name", out var nameElement))
                        {
                            response.Name = nameElement.GetString();
                        }
                        
                        if (firstResult.TryGetProperty("original_name", out var originalNameElement))
                        {
                            response.OriginalName = originalNameElement.GetString();
                        }
                        
                        if (firstResult.TryGetProperty("first_air_date", out var firstAirDateElement))
                        {
                            response.FirstAirDate = firstAirDateElement.GetString();
                        }
                        
                        if (firstResult.TryGetProperty("poster_path", out var posterPathElement))
                        {
                            response.PosterPath = $"https://image.tmdb.org/t/p/w500{posterPathElement.GetString()}";
                        }
                    }
                }
                else
                {
                    _logger.LogWarning($"Failed to search for TV series. Status code: {httpResponse.StatusCode}");
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching for TV series: {seriesName}");
                throw;
            }
        }

        public async Task<TVSeriesDetails?> GetTVSeriesDetailsAsync(int seriesId)
        {
            try
            {
                var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
                var detailsUrl = $"tv/{seriesId}?api_key={apiKey}";
                _logger.LogInformation($"Fetching details for TV series ID: {seriesId}");

                var response = await _httpClient.GetAsync(detailsUrl);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogDebug($"API Response: {content.Substring(0, Math.Min(500, content.Length))}");

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    var tvSeries = JsonSerializer.Deserialize<TVSeriesDetails>(content, options);
                    
                    // If poster path doesn't have the full URL, add it
                    if (tvSeries != null && !string.IsNullOrEmpty(tvSeries.PosterPath) && !tvSeries.PosterPath.StartsWith("http"))
                    {
                        tvSeries.PosterPath = $"https://image.tmdb.org/t/p/w500{tvSeries.PosterPath}";
                    }

                    return tvSeries;
                }
                else
                {
                    _logger.LogWarning($"Failed to fetch details for TV series ID {seriesId}. Status code: {response.StatusCode}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching details for TV series ID {seriesId}");
                throw;
            }
        }

        public async Task<SeasonDetails?> GetSeasonDetailsAsync(int seriesId, int seasonNumber)
        {
            try
            {
                var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
                var url = $"tv/{seriesId}/season/{seasonNumber}?api_key={apiKey}";
                _logger.LogInformation($"Fetching season {seasonNumber} details for TV series ID: {seriesId}");

                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogDebug($"API Response: {content.Substring(0, Math.Min(500, content.Length))}");

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    var seasonDetails = JsonSerializer.Deserialize<SeasonDetails>(content, options);
                    
                    // If poster path doesn't have the full URL, add it
                    if (seasonDetails != null && !string.IsNullOrEmpty(seasonDetails.PosterPath) && !seasonDetails.PosterPath.StartsWith("http"))
                    {
                        seasonDetails.PosterPath = $"https://image.tmdb.org/t/p/w500{seasonDetails.PosterPath}";
                    }

                    return seasonDetails;
                }
                else
                {
                    _logger.LogWarning($"Failed to fetch season {seasonNumber} details for TV series ID {seriesId}. Status code: {response.StatusCode}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching season {seasonNumber} details for TV series ID {seriesId}");
                throw;
            }
        }

        public async Task<StreamingProviderResponse> GetTVStreamingProvidersAsync(int seriesId)
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
                _logger.LogInformation($"Fetching streaming providers for TV series ID: {seriesId}");

                var response = await _httpClient.GetAsync(requestUrl);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Failed to fetch streaming providers for TV series ID {seriesId}. Status code: {response.StatusCode}");
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
                _logger.LogError(ex, $"Error fetching streaming providers for TV series ID {seriesId}");
                throw;
            }
        }

        public async Task<List<MovieTrailer>> GetTVTrailersAsync(int seriesId)
        {
            try
            {
                var apiKey = Environment.GetEnvironmentVariable("TMDb:ApiKey");
                _logger.LogInformation($"Fetching trailers for TV series ID: {seriesId}");

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
                    _logger.LogWarning($"Failed to fetch trailers for TV series ID {seriesId}. Status code: {response.StatusCode}");
                    return new List<MovieTrailer>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching trailers for TV series ID {seriesId}");
                return new List<MovieTrailer>();
            }
        }
    }
}