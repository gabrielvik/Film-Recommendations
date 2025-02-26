using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;

namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class TVSeriesController : ControllerBase
{
    private readonly ILogger<TVSeriesController> _logger;
    private readonly ITMDBService _tmdbService;
    
    public TVSeriesController(
        ILogger<TVSeriesController> logger,
        ITMDBService tmdbService)
    {
        _logger = logger;
        _tmdbService = tmdbService;
    }

[HttpGet("SearchTVSeries")]
    public async Task<IActionResult> SearchTVSeries(string name, int? firstAirYear = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Series name is required");
            }

            var seriesIdResponse = await _tmdbService.GetTVSeriesIdAsync(name, firstAirYear);
            
            if (seriesIdResponse.Id <= 0)
            {
                return NotFound($"TV series not found: {name}");
            }
            
            return Ok(seriesIdResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for TV series.");
            return StatusCode(500, "An error occurred while searching for TV series.");
        }
    }

    [HttpGet("GetTVSeriesDetails/{seriesId}")]
    public async Task<IActionResult> GetTVSeriesDetails(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var seriesDetails = await _tmdbService.GetTVSeriesDetailsAsync(seriesId);
            
            if (seriesDetails == null)
            {
                return NotFound($"TV series details not found for ID: {seriesId}");
            }
            
            return Ok(seriesDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching TV series details.");
            return StatusCode(500, "An error occurred while fetching TV series details.");
        }
    }

    [HttpGet("GetSeasonDetails/{seriesId}/{seasonNumber}")]
    public async Task<IActionResult> GetSeasonDetails(int seriesId, int seasonNumber)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            if (seasonNumber < 0)
            {
                return BadRequest("Valid season number is required");
            }

            var seasonDetails = await _tmdbService.GetSeasonDetailsAsync(seriesId, seasonNumber);
            
            if (seasonDetails == null)
            {
                return NotFound($"Season {seasonNumber} details not found for TV series ID: {seriesId}");
            }
            
            return Ok(seasonDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching season details.");
            return StatusCode(500, "An error occurred while fetching season details.");
        }
    }

    [HttpGet("GetTVStreamingProviders/{seriesId}")]
    public async Task<IActionResult> GetTVStreamingProviders(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var streamingProviders = await _tmdbService.GetTVStreamingProvidersAsync(seriesId);
            
            return Ok(streamingProviders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching TV streaming providers.");
            return StatusCode(500, "An error occurred while fetching TV streaming providers.");
        }
    }

    [HttpGet("GetTVTrailers/{seriesId}")]
    public async Task<IActionResult> GetTVTrailers(int seriesId)
    {
        try
        {
            if (seriesId <= 0)
            {
                return BadRequest("Valid series ID is required");
            }

            var trailers = await _tmdbService.GetTVTrailersAsync(seriesId);
            
            if (trailers.Count == 0)
            {
                return NotFound($"No trailers found for TV series ID: {seriesId}");
            }
            
            return Ok(trailers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching TV trailers.");
            return StatusCode(500, "An error occurred while fetching TV trailers.");
        }
    }
}