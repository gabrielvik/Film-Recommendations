using Microsoft.AspNetCore.Mvc;
using FilmRecomendations.Services;

namespace FilmRecomendations.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieDbService _movieDbService;

    public MoviesController(IMovieDbService movieDbService)
    {
        _movieDbService = movieDbService;
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
}