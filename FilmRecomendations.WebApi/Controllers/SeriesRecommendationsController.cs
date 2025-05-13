using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;
namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class SeriesRecommendationsController : ControllerBase
{
    private readonly ILogger<SeriesRecommendationsController> _logger;
    private readonly IAiService _aiService;
    private readonly ITMDBService _tmdbService;
    
    public SeriesRecommendationsController(
        ILogger<SeriesRecommendationsController> logger, 
        IAiService aiService,
        ITMDBService tmdbService)
    {
        _logger = logger;
        _aiService = aiService;
        _tmdbService = tmdbService;
    }

    [HttpGet("GetSeriesRecommendation")]
    public async Task<IActionResult> GetSeriesRecommendation(string prompt)
    {
        try
        {
            var recommendationsJson = await _aiService.GetSeriesRecommendationsAsync(prompt);
            return Content(recommendationsJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching series recommendations.");
            return StatusCode(500, "An error occurred while fetching recommendations.");
        }
    }

    [HttpGet("GetSeriesId")]
    public async Task<IActionResult> GetSeriesId(string seriesName, int firstAirYear)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(seriesName))
            {
                return BadRequest("Series name is required");
            }

            if (firstAirYear <= 0)
            {
                return BadRequest("Valid first air year is required");
            }

            var seriesIdResponse = await _tmdbService.GetSeriesIdAsync(seriesName, firstAirYear);
            
            if (seriesIdResponse.Id <= 0)
            {
                return NotFound($"Series not found: {seriesName} ({firstAirYear})");
            }
            
            return Ok(seriesIdResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding series ID.");
            return StatusCode(500, "An error occurred while finding series ID.");
        }
    }

    [HttpGet("GetSeriesDetails/{seriesId}")]
    public async Task<IActionResult> GetSeriesDetails(int seriesId)
    {
        try
        {
            _logger.LogInformation($"GetSeriesDetails called with seriesId: {seriesId}");
            
            if (seriesId <= 0)
            {
                _logger.LogWarning($"Invalid series ID provided: {seriesId}");
                return BadRequest("Valid series ID is required");
            }

            var seriesDetails = await _tmdbService.GetSeriesDetailsAsync(seriesId);
            
            if (seriesDetails == null)
            {
                _logger.LogWarning($"Series details not found for ID: {seriesId}");
                return NotFound($"Series details not found for ID: {seriesId}");
            }
            
            _logger.LogInformation($"Successfully retrieved series details for ID: {seriesId}");
            return Ok(seriesDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching series details for ID: {seriesId}");
            return StatusCode(500, $"An error occurred while fetching series details: {ex.Message}");
        }
    }

    [HttpGet("GetSeriesTrailers/{seriesId}")]
    public async Task<IActionResult> GetSeriesTrailers(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var trailers = await _tmdbService.GetSeriesTrailersAsync(seriesId);
            
            if (trailers.Count == 0)
            {
                return NotFound($"No trailers found for series ID: {seriesId}");
            }
            
            return Ok(trailers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching series trailers.");
            return StatusCode(500, "An error occurred while fetching series trailers.");
        }
    }
    
    [HttpGet("GetStreamingProviders/{seriesId}")]
    public async Task<IActionResult> GetStreamingProviders(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var streamingProviders = await _tmdbService.GetSeriesStreamingProvidersAsync(seriesId);
            
            return Ok(streamingProviders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching streaming providers.");
            return StatusCode(500, "An error occurred while fetching streaming providers.");
        }
    }

    [HttpGet("GetCreators/{seriesId}")]
    public async Task<IActionResult> GetCreators(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var creators = await _tmdbService.GetSeriesCreatorsAsync(seriesId);
            if (creators == null || creators.Count == 0)
            {
                return NotFound($"No creators found for series ID: {seriesId}");
            }
            
            return Ok(creators);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching creators.");
            return StatusCode(500, "An error occurred while fetching creators.");
        }
    }

    [HttpGet("GetActors/{seriesId}")]
    public async Task<IActionResult> GetActors(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var actors = await _tmdbService.GetSeriesActorsAsync(seriesId);
            if (actors == null || actors.Count == 0)
            {
                return NotFound($"No actors found for series ID: {seriesId}");
            }
            
            return Ok(actors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching actors.");
            return StatusCode(500, "An error occurred while fetching actors.");
        }
    }
}