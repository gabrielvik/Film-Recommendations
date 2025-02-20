using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;
using FilmRecomendations.Models.DTOs;

namespace FilmRecomendations.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieDbService _movieDbService;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(IMovieDbService movieDbService, ILogger<MoviesController> logger)
    {
        _movieDbService = movieDbService;
        _logger = logger;
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<int>>> SearchMovies([FromQuery] List<string> titles)
    {
        if (titles == null || !titles.Any())
        {
            return BadRequest("Please provide at least one movie title");
        }

        var movieIds = await _movieDbService.GetMovieIdsAsync(titles);
        return Ok(movieIds);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Movie>> GetMovieDetails(int id)
    {
        try
        {
            var movies = await _movieDbService.GetMovieDetails(new List<int> { id });
            
            if (!movies.Any())
            {
                return NotFound($"Movie with ID {id} was not found");
            }

            return Ok(movies.First());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while fetching movie details for ID {id}");
            return StatusCode(500, "An error occurred while processing your request");
        }
    }
}