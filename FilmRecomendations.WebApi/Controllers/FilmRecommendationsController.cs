using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;
namespace FilmRecomendations.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class FilmRecomendationsController : ControllerBase
{
    private readonly ILogger<FilmRecomendationsController> _logger;
    private readonly IAiService _aiService;
    private readonly ITMDBService _tmdbService;
    
    public FilmRecomendationsController(
        ILogger<FilmRecomendationsController> logger, 
        IAiService aiService,
        ITMDBService tmdbService)
    {
        _logger = logger;
        _aiService = aiService;
        _tmdbService = tmdbService;
    }

    [HttpGet("GetFilmRecommendation")]
    public async Task<IActionResult> GetFilmRecommendation(string prompt)
    {
        try
        {
            var recommendationsJson = await _aiService.GetMovieRecommendationsAsync(prompt);
            return Content(recommendationsJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching movie recommendations.");
            return StatusCode(500, "An error occurred while fetching recommendations.");
        }
    }

        [HttpGet("GetMovieId")]
    public async Task<IActionResult> GetMovieId(string movieName, int releaseYear)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(movieName))
            {
                return BadRequest("Movie name is required");
            }

            if (releaseYear <= 0)
            {
                return BadRequest("Valid release year is required");
            }

            var movieIdResponse = await _tmdbService.GetMovieIdAsync(movieName, releaseYear);
            
            if (movieIdResponse.Id <= 0)
            {
                return NotFound($"Movie not found: {movieName} ({releaseYear})");
            }
            
            return Ok(movieIdResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding movie ID.");
            return StatusCode(500, "An error occurred while finding movie ID.");
        }
    }

    // Add new endpoint for getting movie details
    [HttpGet("GetMovieDetails/{movieId}")]
    public async Task<IActionResult> GetMovieDetails(int movieId)
    {
        try
        {
            if (movieId <= 0)
            {
                return BadRequest("Valid movie ID is required");
            }

            var movieDetails = await _tmdbService.GetMovieDetailsAsync(movieId);
            
            if (movieDetails == null)
            {
                return NotFound($"Movie details not found for ID: {movieId}");
            }
            
            return Ok(movieDetails);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching movie details.");
            return StatusCode(500, "An error occurred while fetching movie details.");
        }
    }
}
